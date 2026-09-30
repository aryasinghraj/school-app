import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/reports/students
router.get('/students', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const { classId } = req.query;

    let where: any = { schoolId };

    if (req.user!.role === 'TEACHER') {
      const mappings = await prisma.classSubjectTeacher.findMany({
        where: { teacherId: req.user!.teacherId! },
        select: { classId: true },
      });
      const teacherClassIds = Array.from(new Set(mappings.map((m) => m.classId)));

      if (classId) {
        if (!teacherClassIds.includes(String(classId))) {
          return res.status(403).json({ message: 'Forbidden: You are not assigned to this class.' });
        }
        where.classId = String(classId);
      } else {
        where.classId = { in: teacherClassIds };
      }
    } else {
      if (classId) where.classId = String(classId);
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        class: true,
        section: true,
      },
      orderBy: [{ classId: 'asc' }, { rollNo: 'asc' }],
    });

    const reportData = students.map((s) => ({
      admissionNo: s.admissionNo,
      studentName: s.user.name,
      email: s.user.email,
      class: `${s.class.name}-${s.section.name}`,
      rollNo: s.rollNo,
      gender: s.gender,
      fatherName: s.fatherName,
      guardianPhone: s.guardianPhone,
      status: s.status,
    }));

    res.json(reportData);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/attendance
router.get('/attendance', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const { classId } = req.query;

    let studentWhere: any = { schoolId };

    if (req.user!.role === 'TEACHER') {
      const mappings = await prisma.classSubjectTeacher.findMany({
        where: { teacherId: req.user!.teacherId! },
        select: { classId: true },
      });
      const teacherClassIds = Array.from(new Set(mappings.map((m) => m.classId)));

      if (classId) {
        if (!teacherClassIds.includes(String(classId))) {
          return res.status(403).json({ message: 'Forbidden: You are not assigned to this class.' });
        }
        studentWhere.classId = String(classId);
      } else {
        studentWhere.classId = { in: teacherClassIds };
      }
    } else {
      if (classId) studentWhere.classId = String(classId);
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        user: { select: { name: true } },
        class: true,
        section: true,
        attendances: true,
      },
    });

    const reportData = students.map((s) => {
      const total = s.attendances.length;
      const present = s.attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
      const absent = s.attendances.filter((a) => a.status === 'ABSENT').length;
      const leave = s.attendances.filter((a) => a.status === 'LEAVE').length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 100;

      return {
        studentName: s.user.name,
        admissionNo: s.admissionNo,
        class: `${s.class.name}-${s.section.name}`,
        totalDays: total,
        presentDays: present,
        absentDays: absent,
        leaveDays: leave,
        attendancePercentage: `${pct}%`,
      };
    });

    res.json(reportData);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/fees
router.get('/fees', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;

    const feeRecords = await prisma.feeRecord.findMany({
      where: { schoolId },
      include: {
        student: { include: { user: { select: { name: true } }, class: true, section: true } },
        feeCategory: true,
      },
    });

    const reportData = feeRecords.map((f) => ({
      studentName: f.student.user.name,
      admissionNo: f.student.admissionNo,
      class: `${f.student.class.name}-${f.student.section.name}`,
      feeCategory: f.feeCategory.name,
      totalAmount: f.totalAmount,
      discountAmount: f.discountAmount,
      netAmount: f.netAmount,
      paidAmount: f.paidAmount,
      dueAmount: f.dueAmount,
      status: f.status,
      dueDate: f.dueDate.toISOString().split('T')[0],
    }));

    res.json(reportData);
  } catch (err) {
    next(err);
  }
});

export default router;
