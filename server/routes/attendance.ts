import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/attendance
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const { date, classId, sectionId, studentId } = req.query;

    let where: any = { schoolId };

    // Role-based Access Scoping
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
          return res.status(403).json({ message: 'Forbidden: You cannot access attendance of an unrelated student.' });
        }
        where.studentId = String(studentId);
      } else {
        where.studentId = { in: childIds };
      }
    } else if (req.user!.role === 'TEACHER') {
      const teacherClasses = await prisma.classSubjectTeacher.findMany({
        where: { teacherId: req.user!.teacherId! },
        select: { classId: true, sectionId: true },
      });
      const allowedClassIds = Array.from(new Set(teacherClasses.map((t) => t.classId)));

      if (classId) {
        if (!allowedClassIds.includes(String(classId))) {
          return res.status(403).json({ message: 'Forbidden: You are not assigned to this class.' });
        }
        where.classId = String(classId);
      } else {
        where.classId = { in: allowedClassIds };
      }

      if (sectionId) where.sectionId = String(sectionId);
      if (studentId) where.studentId = String(studentId);
    } else {
      if (studentId) where.studentId = String(studentId);
      if (classId) where.classId = String(classId);
      if (sectionId) where.sectionId = String(sectionId);
    }

    if (date) {
      const queryDate = new Date(String(date));
      queryDate.setHours(0, 0, 0, 0);
      const queryDateEnd = new Date(queryDate);
      queryDateEnd.setHours(23, 59, 59, 999);
      where.date = { gte: queryDate, lte: queryDateEnd };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } },
        class: true,
        section: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance (Batch save attendance)
router.post('/', authenticate, requireRoles(['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { classId, sectionId, date, records } = req.body;
    const schoolId = req.user!.schoolId;

    if (!classId || !sectionId || !date || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Invalid attendance submission payload' });
    }

    // Teacher Authorization Check: Ensure teacher is assigned to this class and section
    if (req.user!.role === 'TEACHER') {
      const isAssigned = await prisma.classSubjectTeacher.findFirst({
        where: { teacherId: req.user!.teacherId!, classId, sectionId },
      });
      if (!isAssigned) {
        return res.status(403).json({
          message: 'Forbidden: You are only authorized to submit attendance for your assigned classes.',
        });
      }
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const upsertPromises = records.map((r: any) =>
      prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: r.studentId,
            date: targetDate,
          },
        },
        update: {
          status: r.status,
          remarks: r.remarks || null,
          markedBy: req.user!.id,
        },
        create: {
          schoolId,
          studentId: r.studentId,
          classId,
          sectionId,
          date: targetDate,
          status: r.status,
          remarks: r.remarks || null,
          markedBy: req.user!.id,
        },
      })
    );

    await Promise.all(upsertPromises);

    res.json({ message: `Attendance saved successfully for ${records.length} students.` });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/summary/student/:studentId
router.get('/summary/student/:studentId', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { studentId } = req.params;
    const schoolId = req.user!.schoolId;

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student record not found in this school' });
    }

    // RBAC: Student can only access own attendance
    if (req.user!.role === 'STUDENT' && req.user!.studentId !== studentId) {
      return res.status(403).json({ message: 'Forbidden: You cannot access attendance of other students.' });
    }

    // RBAC: Parent can only access their child's attendance
    if (req.user!.role === 'PARENT' && req.user!.parentId !== student.parentId) {
      return res.status(403).json({ message: 'Forbidden: You cannot access attendance of an unrelated student.' });
    }

    // RBAC: Teacher can only access students in classes they teach
    if (req.user!.role === 'TEACHER') {
      const isAssigned = await prisma.classSubjectTeacher.findFirst({
        where: { teacherId: req.user!.teacherId!, classId: student.classId, sectionId: student.sectionId },
      });
      if (!isAssigned) {
        return res.status(403).json({ message: 'Forbidden: You are not assigned to this student\'s class.' });
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: { studentId, schoolId },
      orderBy: { date: 'desc' },
    });

    const totalDays = attendances.length;
    const presentDays = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const absentDays = attendances.filter((a) => a.status === 'ABSENT').length;
    const lateDays = attendances.filter((a) => a.status === 'LATE').length;
    const leaveDays = attendances.filter((a) => a.status === 'LEAVE').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    res.json({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      percentage,
      records: attendances,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
