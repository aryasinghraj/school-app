import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/timetable
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const { classId, sectionId, teacherId, childId } = req.query;

    let where: any = {
      class: { schoolId },
    };

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
        where.classId = children[0].classId;
        where.sectionId = children[0].sectionId;
      }
    } else if (req.user!.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: { id: req.user!.teacherId!, schoolId },
      });

      if (classId) {
        const isAssigned = await prisma.classSubjectTeacher.findFirst({
          where: { teacherId: req.user!.teacherId!, classId: String(classId) },
        });
        if (!isAssigned) {
          return res.status(403).json({ message: 'Forbidden: You are not assigned to this class.' });
        }
        where.classId = String(classId);
        if (sectionId) where.sectionId = String(sectionId);
      } else if (teacher) {
        where.teacherId = teacher.id;
      }
    } else {
      if (classId) where.classId = String(classId);
      if (sectionId) where.sectionId = String(sectionId);
      if (teacherId) where.teacherId = String(teacherId);
    }

    const timetable = await prisma.timetable.findMany({
      where,
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { periodNo: 'asc' }],
    });

    res.json(timetable);
  } catch (err) {
    next(err);
  }
});

// POST /api/timetable
router.post('/', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { classId, sectionId, subjectId, teacherId, dayOfWeek, periodNo, startTime, endTime } = req.body;

    if (!classId || !sectionId || !subjectId || !teacherId || !dayOfWeek || !periodNo) {
      return res.status(400).json({ message: 'Missing required timetable slot info' });
    }

    const slot = await prisma.timetable.upsert({
      where: {
        classId_sectionId_dayOfWeek_periodNo: {
          classId,
          sectionId,
          dayOfWeek,
          periodNo: Number(periodNo),
        },
      },
      update: {
        subjectId,
        teacherId,
        startTime: startTime || '08:30',
        endTime: endTime || '09:15',
      },
      create: {
        classId,
        sectionId,
        subjectId,
        teacherId,
        dayOfWeek,
        periodNo: Number(periodNo),
        startTime: startTime || '08:30',
        endTime: endTime || '09:15',
      },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    res.status(201).json({ message: 'Timetable period updated', slot });
  } catch (err) {
    next(err);
  }
});

export default router;
