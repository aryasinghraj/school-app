import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { hashPassword } from '../utils/password.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/teachers
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const { search, subject } = req.query;

    let teachers = await prisma.teacher.findMany({
      where: { schoolId },
      include: {
        user: { select: { email: true, name: true, avatarUrl: true, status: true } },
        classSubjectTeachers: {
          include: { class: true, section: true, subject: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (search) {
      const q = String(search).toLowerCase();
      teachers = teachers.filter(
        (t) =>
          t.user.name.toLowerCase().includes(q) ||
          t.teacherCode.toLowerCase().includes(q) ||
          t.mainSubject.toLowerCase().includes(q)
      );
    }

    if (subject) {
      teachers = teachers.filter((t) => t.mainSubject.toLowerCase() === String(subject).toLowerCase());
    }

    res.json(teachers);
  } catch (err) {
    next(err);
  }
});

// POST /api/teachers
router.post('/', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, email, password, teacherCode, phone, gender, dob, qualification, mainSubject, joiningDate } = req.body;

    if (!name || !email || !password || !teacherCode || !mainSubject) {
      return res.status(400).json({ message: 'Missing required teacher fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId: req.user!.schoolId,
          email: email.trim().toLowerCase(),
          passwordHash,
          name,
          role: 'TEACHER',
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          schoolId: req.user!.schoolId,
          teacherCode,
          phone: phone || '',
          gender: gender || 'Male',
          dob: new Date(dob || '1990-01-01'),
          qualification: qualification || 'B.Ed',
          mainSubject,
          joiningDate: new Date(joiningDate || Date.now()),
        },
        include: { user: true },
      });

      return teacher;
    });

    res.status(201).json({ message: 'Teacher added successfully', teacher: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/teachers/assign-subject
router.post('/assign-subject', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { teacherId, classId, sectionId, subjectId } = req.body;

    if (!teacherId || !classId || !sectionId || !subjectId) {
      return res.status(400).json({ message: 'Missing assignment parameters' });
    }

    const assignment = await prisma.classSubjectTeacher.upsert({
      where: {
        classId_sectionId_subjectId: {
          classId,
          sectionId,
          subjectId,
        },
      },
      update: { teacherId },
      create: {
        classId,
        sectionId,
        subjectId,
        teacherId,
      },
      include: { class: true, section: true, subject: true, teacher: { include: { user: true } } },
    });

    res.json({ message: 'Subject assignment updated successfully', assignment });
  } catch (err) {
    next(err);
  }
});

export default router;
