import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/subjects
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    let subjectWhere: any = { schoolId };

    if (req.user!.role === 'TEACHER') {
      const mappings = await prisma.classSubjectTeacher.findMany({
        where: { teacherId: req.user!.teacherId! },
        select: { subjectId: true },
      });
      const allowedSubjectIds = Array.from(new Set(mappings.map((m) => m.subjectId)));
      subjectWhere.id = { in: allowedSubjectIds };
    }

    const subjects = await prisma.subject.findMany({
      where: subjectWhere,
      orderBy: { name: 'asc' },
    });
    res.json(subjects);
  } catch (err) {
    next(err);
  }
});

// POST /api/subjects
router.post('/', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, code, type } = req.body;
    const subject = await prisma.subject.create({
      data: {
        schoolId: req.user!.schoolId,
        name,
        code,
        type: type || 'Core',
      },
    });
    res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (err) {
    next(err);
  }
});

export default router;
