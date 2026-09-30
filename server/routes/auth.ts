import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { UserSession } from '../../shared/types.js';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        school: true,
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Your user account is deactivated. Contact administration.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const session: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      schoolId: user.schoolId,
      schoolName: user.school.name,
      avatarUrl: user.avatarUrl,
      teacherId: user.teacherProfile?.id || null,
      studentId: user.studentProfile?.id || null,
      parentId: user.parentProfile?.id || null,
    };

    const token = generateToken(session);

    return res.json({
      message: 'Login successful',
      token,
      user: session,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        school: true,
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const session: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      schoolId: user.schoolId,
      schoolName: user.school.name,
      avatarUrl: user.avatarUrl,
      teacherId: user.teacherProfile?.id || null,
      studentId: user.studentProfile?.id || null,
      parentId: user.parentProfile?.id || null,
    };

    return res.json({ user: session });
  } catch (err) {
    next(err);
  }
});

export default router;
