import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/notices
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const role = req.user!.role;

    let targetFilter: string[] = ['EVERYONE'];
    if (role === 'TEACHER') targetFilter.push('TEACHERS');
    if (role === 'STUDENT') targetFilter.push('STUDENTS');
    if (role === 'PARENT') targetFilter.push('PARENTS');
    if (role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN') {
      targetFilter = ['EVERYONE', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS_SPECIFIC'];
    }

    const notices = await prisma.notice.findMany({
      where: {
        schoolId,
        targetAudience: { in: targetFilter },
      },
      include: {
        author: { select: { name: true, avatarUrl: true, role: true } },
        class: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    res.json(notices);
  } catch (err) {
    next(err);
  }
});

// POST /api/notices
router.post('/', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { title, content, targetAudience, classId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const notice = await prisma.notice.create({
      data: {
        schoolId: req.user!.schoolId,
        title,
        content,
        targetAudience: targetAudience || 'EVERYONE',
        classId: classId || null,
        authorUserId: req.user!.id,
      },
      include: {
        author: { select: { name: true } },
        class: true,
      },
    });

    res.status(201).json({ message: 'Notice published successfully', notice });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notices/:id
router.delete('/:id', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    await prisma.notice.delete({ where: { id } });
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
