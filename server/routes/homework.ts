import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/homework
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const { classId, sectionId, subjectId, childId } = req.query;

    let where: any = { schoolId };

    if (req.user!.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { id: req.user!.studentId!, schoolId },
      });
      if (student) {
        where.classId = student.classId;
        where.sectionId = student.sectionId;
      }
    } else if (req.user!.role === 'PARENT') {
      const children = await prisma.student.findMany({
        where: { parentId: req.user!.parentId!, schoolId },
      });

      if (childId) {
        const matchingChild = children.find((c) => c.id === String(childId));
        if (!matchingChild) {
          return res.status(403).json({ message: 'Forbidden: Child not linked to parent profile.' });
        }
        where.classId = matchingChild.classId;
        where.sectionId = matchingChild.sectionId;
      } else if (children.length > 0) {
        where.OR = children.map((c) => ({
          classId: c.classId,
          sectionId: c.sectionId,
        }));
      }
    } else if (req.user!.role === 'TEACHER') {
      const teacherMappings = await prisma.classSubjectTeacher.findMany({
        where: { teacherId: req.user!.teacherId! },
      });
      const allowedClassIds = Array.from(new Set(teacherMappings.map((m) => m.classId)));

      if (classId) {
        if (!allowedClassIds.includes(String(classId))) {
          return res.status(403).json({ message: 'Forbidden: You are not assigned to this class.' });
        }
        where.classId = String(classId);
      } else {
        where.classId = { in: allowedClassIds };
      }
      if (sectionId) where.sectionId = String(sectionId);
    } else {
      if (classId) where.classId = String(classId);
      if (sectionId) where.sectionId = String(sectionId);
    }

    if (subjectId) where.subjectId = String(subjectId);

    const homeworks = await prisma.homework.findMany({
      where,
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: { include: { user: { select: { name: true } } } },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json(homeworks);
  } catch (err) {
    next(err);
  }
});

// POST /api/homework
router.post('/', authenticate, requireRoles(['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { classId, sectionId, subjectId, title, description, dueDate, attachmentUrl } = req.body;
    const schoolId = req.user!.schoolId;

    if (!classId || !sectionId || !subjectId || !title || !dueDate) {
      return res.status(400).json({ message: 'Missing required homework details' });
    }

    let teacherId = req.user!.teacherId;

    // If teacher, verify they are assigned to this class, section, and subject
    if (req.user!.role === 'TEACHER') {
      if (!teacherId) {
        return res.status(403).json({ message: 'Teacher profile not found' });
      }

      const isAssigned = await prisma.classSubjectTeacher.findFirst({
        where: { teacherId, classId, sectionId, subjectId },
      });

      if (!isAssigned) {
        return res.status(403).json({
          message: 'Forbidden: You can only assign homework for your assigned classes and subjects.',
        });
      }
    } else {
      // Admin posting homework: find assigned teacher or first teacher
      const mapping = await prisma.classSubjectTeacher.findFirst({
        where: { classId, sectionId, subjectId },
      });
      teacherId = mapping?.teacherId;
      if (!teacherId) {
        const firstTeacher = await prisma.teacher.findFirst({ where: { schoolId } });
        teacherId = firstTeacher?.id;
      }
    }

    if (!teacherId) {
      return res.status(400).json({ message: 'No teacher found to assign this homework.' });
    }

    const homework = await prisma.homework.create({
      data: {
        schoolId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        title,
        description: description || '',
        dueDate: new Date(dueDate),
        attachmentUrl: attachmentUrl || null,
      },
      include: {
        class: true,
        section: true,
        subject: true,
      },
    });

    res.status(201).json({ message: 'Homework published successfully', homework });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/homework/:id
router.delete('/:id', authenticate, requireRoles(['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.user!.schoolId;

    const homework = await prisma.homework.findFirst({
      where: { id, schoolId },
    });

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    // Teacher can only delete their own homework
    if (req.user!.role === 'TEACHER' && homework.teacherId !== req.user!.teacherId) {
      return res.status(403).json({ message: 'Forbidden: You can only delete homework created by you.' });
    }

    await prisma.homework.delete({ where: { id } });
    res.json({ message: 'Homework deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
