import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

// GET /api/results
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const { examId, classId, subjectId, studentId } = req.query;

    let where: any = {
      examSubject: {
        exam: { schoolId },
      },
    };

    if (req.user!.role === 'STUDENT') {
      where.studentId = req.user!.studentId;
    } else if (req.user!.role === 'PARENT') {
      const children = await prisma.student.findMany({
        where: { parentId: req.user!.parentId!, schoolId },
        select: { id: true },
      });
      const childIds = children.map((c) => c.id);

      if (studentId) {
        if (!childIds.includes(String(studentId))) {
          return res.status(403).json({ message: 'Forbidden: You cannot view results of an unrelated student.' });
        }
        where.studentId = String(studentId);
      } else {
        where.studentId = { in: childIds };
      }
    } else if (req.user!.role === 'TEACHER') {
      const teacherClasses = await prisma.classSubjectTeacher.findMany({
        where: { teacherId: req.user!.teacherId! },
        select: { classId: true, subjectId: true },
      });
      const allowedClassIds = Array.from(new Set(teacherClasses.map((t) => t.classId)));

      if (classId) {
        if (!allowedClassIds.includes(String(classId))) {
          return res.status(403).json({ message: 'Forbidden: You are not assigned to this class.' });
        }
        where.examSubject.classId = String(classId);
      } else {
        where.examSubject.classId = { in: allowedClassIds };
      }

      if (subjectId) where.examSubject.subjectId = String(subjectId);
      if (studentId) where.studentId = String(studentId);
    } else {
      if (studentId) where.studentId = String(studentId);
      if (classId) where.examSubject.classId = String(classId);
      if (subjectId) where.examSubject.subjectId = String(subjectId);
    }

    if (examId) {
      where.examSubject.examId = String(examId);
    }

    const marks = await prisma.mark.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } },
        examSubject: {
          include: {
            exam: true,
            subject: true,
            class: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(marks);
  } catch (err) {
    next(err);
  }
});

// POST /api/results (Batch mark entry)
router.post('/', authenticate, requireRoles(['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { examSubjectId, marksList } = req.body;
    const schoolId = req.user!.schoolId;

    if (!examSubjectId || !Array.isArray(marksList)) {
      return res.status(400).json({ message: 'Invalid marks entry payload' });
    }

    const examSubject = await prisma.examSubject.findFirst({
      where: {
        id: examSubjectId,
        exam: { schoolId },
      },
    });

    if (!examSubject) {
      return res.status(404).json({ message: 'Exam subject not found in this school' });
    }

    // Teacher Authorization Check: Must teach this class and subject
    if (req.user!.role === 'TEACHER') {
      const isAssigned = await prisma.classSubjectTeacher.findFirst({
        where: {
          teacherId: req.user!.teacherId!,
          classId: examSubject.classId,
          subjectId: examSubject.subjectId,
        },
      });

      if (!isAssigned) {
        return res.status(403).json({
          message: 'Forbidden: You are not authorized to grade this subject for this class.',
        });
      }
    }

    const upserts = marksList.map((m: any) => {
      const percentage = (Number(m.obtainedMarks) / examSubject.maxMarks) * 100;
      const grade = calculateGrade(percentage);

      return prisma.mark.upsert({
        where: {
          examSubjectId_studentId: {
            examSubjectId,
            studentId: m.studentId,
          },
        },
        update: {
          obtainedMarks: Number(m.obtainedMarks),
          grade,
          remarks: m.remarks || null,
          evaluatorId: req.user!.id,
        },
        create: {
          examSubjectId,
          studentId: m.studentId,
          obtainedMarks: Number(m.obtainedMarks),
          grade,
          remarks: m.remarks || null,
          evaluatorId: req.user!.id,
        },
      });
    });

    await Promise.all(upserts);

    res.json({ message: `Successfully updated marks for ${marksList.length} students.` });
  } catch (err) {
    next(err);
  }
});

// GET /api/results/report-card/:studentId/:examId
router.get('/report-card/:studentId/:examId', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { studentId, examId } = req.params;
    const schoolId = req.user!.schoolId;

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: {
        user: true,
        class: true,
        section: true,
        school: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student record not found in this school' });
    }

    // RBAC Scoping
    if (req.user!.role === 'STUDENT' && req.user!.studentId !== student.id) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own report card.' });
    }

    if (req.user!.role === 'PARENT' && req.user!.parentId !== student.parentId) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own child\'s report card.' });
    }

    if (req.user!.role === 'TEACHER') {
      const isAssigned = await prisma.classSubjectTeacher.findFirst({
        where: { teacherId: req.user!.teacherId!, classId: student.classId, sectionId: student.sectionId },
      });
      if (!isAssigned) {
        return res.status(403).json({ message: 'Forbidden: You are not assigned to this student\'s class.' });
      }
    }

    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
      include: { academicYear: true },
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam record not found' });
    }

    const marks = await prisma.mark.findMany({
      where: {
        studentId,
        examSubject: { examId },
      },
      include: {
        examSubject: { include: { subject: true } },
      },
    });

    const totalMax = marks.reduce((acc, m) => acc + m.examSubject.maxMarks, 0);
    const totalObtained = marks.reduce((acc, m) => acc + m.obtainedMarks, 0);
    const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 : 0;
    const overallGrade = calculateGrade(overallPercentage);

    res.json({
      student,
      exam,
      marks: marks.map((m) => ({
        subjectName: m.examSubject.subject.name,
        subjectCode: m.examSubject.subject.code,
        maxMarks: m.examSubject.maxMarks,
        passMarks: m.examSubject.passMarks,
        obtainedMarks: m.obtainedMarks,
        grade: m.grade,
        remarks: m.remarks,
      })),
      summary: {
        totalMax,
        totalObtained,
        percentage: overallPercentage,
        overallGrade,
        status: overallPercentage >= 33 ? 'PASSED' : 'FAILED',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
