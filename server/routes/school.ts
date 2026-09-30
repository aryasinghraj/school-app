import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/school
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const school = await prisma.school.findFirst({
      where: { id: req.user!.schoolId },
    });
    if (!school) {
      return res.status(404).json({ message: 'School configuration not found' });
    }
    res.json(school);
  } catch (err) {
    next(err);
  }
});

// PUT /api/school
router.put('/', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, location, state, country, logoUrl, phone, email, currency } = req.body;

    const updated = await prisma.school.update({
      where: { id: req.user!.schoolId },
      data: {
        name,
        location,
        state,
        country,
        logoUrl,
        phone,
        email,
        currency,
      },
    });

    res.json({ message: 'School settings updated successfully', school: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
