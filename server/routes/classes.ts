import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/classes
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    let classWhere: any = { schoolId };

    if (req.user!.role === 'TEACHER') {
      const mappings = await prisma.classSubjectTeacher.findMany({
        where: { teacherId: req.user!.teacherId! },
        select: { classId: true },
      });
      const allowedClassIds = Array.from(new Set(mappings.map((m) => m.classId)));
      classWhere.id = { in: allowedClassIds };
    } else if (req.user!.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { id: req.user!.studentId!, schoolId },
      });
      if (student) {
        classWhere.id = student.classId;
      }
    } else if (req.user!.role === 'PARENT') {
      const children = await prisma.student.findMany({
        where: { parentId: req.user!.parentId!, schoolId },
        select: { classId: true },
      });
      const childClassIds = Array.from(new Set(children.map((c) => c.classId)));
      classWhere.id = { in: childClassIds };
    }

    const classes = await prisma.class.findMany({
      where: classWhere,
      include: {
        academicYear: true,
        sections: {
          include: {
            _count: { select: { students: true } },
          },
        },
        _count: { select: { students: true } },
      },
      orderBy: { numericGrade: 'asc' },
    });

    res.json(classes);
  } catch (err) {
    next(err);
  }
});

// POST /api/classes
router.post('/', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, numericGrade } = req.body;
    const schoolId = req.user!.schoolId;

    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    });

    if (!academicYear) {
      return res.status(400).json({ message: 'No active academic year found for school' });
    }

    const newClass = await prisma.class.create({
      data: {
        schoolId,
        academicYearId: academicYear.id,
        name,
        numericGrade: Number(numericGrade),
      },
    });

    // Automatically create default Section A
    await prisma.section.create({
      data: {
        classId: newClass.id,
        name: 'A',
      },
    });

    res.status(201).json({ message: 'Class created successfully', class: newClass });
  } catch (err) {
    next(err);
  }
});

// POST /api/classes/:classId/sections
router.post('/:classId/sections', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { classId } = req.params;
    const { name, roomNo, capacity } = req.body;
    const schoolId = req.user!.schoolId;

    const parentClass = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });

    if (!parentClass) {
      return res.status(404).json({ message: 'Class not found in this school' });
    }

    const section = await prisma.section.create({
      data: {
        classId,
        name,
        roomNo: roomNo || null,
        capacity: capacity ? Number(capacity) : 40,
      },
    });

    res.status(201).json({ message: 'Section added successfully', section });
  } catch (err) {
    next(err);
  }
});

export default router;
