import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/exams
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;

    const exams = await prisma.exam.findMany({
      where: { schoolId },
      include: {
        academicYear: true,
        examSubjects: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    res.json(exams);
  } catch (err) {
    next(err);
  }
});

// POST /api/exams
router.post('/', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, examType, startDate, endDate } = req.body;
    const schoolId = req.user!.schoolId;

    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    });

    if (!currentYear) {
      return res.status(400).json({ message: 'No active academic year found' });
    }

    const exam = await prisma.exam.create({
      data: {
        schoolId,
        academicYearId: currentYear.id,
        name,
        examType: examType || 'Unit Test',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (err) {
    next(err);
  }
});

// POST /api/exams/:examId/subjects
router.post('/:examId/subjects', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { examId } = req.params;
    const { subjectId, classId, examDate, maxMarks, passMarks } = req.body;

    const examSubject = await prisma.examSubject.create({
      data: {
        examId,
        subjectId,
        classId,
        examDate: new Date(examDate),
        maxMarks: maxMarks ? Number(maxMarks) : 100,
        passMarks: passMarks ? Number(passMarks) : 33,
      },
      include: { subject: true, class: true },
    });

    res.status(201).json({ message: 'Subject added to exam schedule', examSubject });
  } catch (err) {
    next(err);
  }
});

export default router;
