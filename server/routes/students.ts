import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { hashPassword } from '../utils/password.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/students
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const { search, classId, sectionId, status } = req.query;

    // RBAC: If Student, return only self. If Parent, return only linked children. If Teacher, return only assigned students.
    let studentWhere: any = { schoolId };

    if (req.user!.role === 'STUDENT') {
      studentWhere.id = req.user!.studentId;
    } else if (req.user!.role === 'PARENT') {
      studentWhere.parentId = req.user!.parentId;
    } else if (req.user!.role === 'TEACHER') {
      const teacherMappings = await prisma.classSubjectTeacher.findMany({
        where: { teacherId: req.user!.teacherId! },
        select: { classId: true },
      });
      const teacherClassIds = Array.from(new Set(teacherMappings.map((m) => m.classId)));
      studentWhere.classId = { in: teacherClassIds };
      if (classId) {
        if (!teacherClassIds.includes(String(classId))) {
          return res.status(403).json({ message: 'Forbidden. You are not assigned to this class.' });
        }
        studentWhere.classId = String(classId);
      }
      if (sectionId) studentWhere.sectionId = String(sectionId);
      if (status) studentWhere.status = String(status);
    } else {
      if (classId) studentWhere.classId = String(classId);
      if (sectionId) studentWhere.sectionId = String(sectionId);
      if (status) studentWhere.status = String(status);
    }

    let students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        user: { select: { email: true, name: true, avatarUrl: true, status: true } },
        class: true,
        section: true,
        parent: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: [{ classId: 'asc' }, { rollNo: 'asc' }],
    });

    if (search) {
      const q = String(search).toLowerCase();
      students = students.filter(
        (s) =>
          s.user.name.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.rollNo.toString().includes(q) ||
          s.fatherName.toLowerCase().includes(q)
      );
    }

    res.json(students);
  } catch (err) {
    next(err);
  }
});

// GET /api/students/:id
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const schoolId = req.user!.schoolId;

    const student = await prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        user: { select: { email: true, name: true, avatarUrl: true, status: true } },
        class: true,
        section: true,
        parent: { include: { user: { select: { name: true, email: true } } } },
        attendances: { orderBy: { date: 'desc' }, take: 30 },
        marks: { include: { examSubject: { include: { exam: true, subject: true } } } },
        feeRecords: { include: { feeCategory: true, payments: true } },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found in this school' });
    }

    // Role-based Access Scoping
    if (req.user!.role === 'STUDENT' && req.user!.studentId !== student.id) {
      return res.status(403).json({ message: 'Access denied: You can only view your own student profile.' });
    }

    if (req.user!.role === 'PARENT' && req.user!.parentId !== student.parentId) {
      return res.status(403).json({ message: 'Access denied: You can only view your own child\'s student profile.' });
    }

    if (req.user!.role === 'TEACHER') {
      const isAssigned = await prisma.classSubjectTeacher.findFirst({
        where: { teacherId: req.user!.teacherId!, classId: student.classId, sectionId: student.sectionId },
      });
      if (!isAssigned) {
        return res.status(403).json({ message: 'Access denied: You are not assigned to this student\'s class.' });
      }
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
});

// POST /api/students
router.post('/', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const {
      name,
      email,
      password,
      classId,
      sectionId,
      parentId,
      admissionNo,
      rollNo,
      gender,
      dob,
      fatherName,
      motherName,
      guardianPhone,
      address,
      admissionDate,
    } = req.body;

    if (!name || !email || !password || !classId || !sectionId || !admissionNo || !rollNo) {
      return res.status(400).json({ message: 'Missing required student fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingAdm = await prisma.student.findUnique({ where: { admissionNo } });
    if (existingAdm) {
      return res.status(400).json({ message: 'Student with this admission number already exists' });
    }

    const passwordHash = await hashPassword(password);

    // Create User & Student profile transactionally
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId: req.user!.schoolId,
          email: email.trim().toLowerCase(),
          passwordHash,
          name,
          role: 'STUDENT',
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          schoolId: req.user!.schoolId,
          classId,
          sectionId,
          parentId: parentId || null,
          admissionNo,
          rollNo: Number(rollNo),
          gender: gender || 'Male',
          dob: new Date(dob || '2010-01-01'),
          fatherName: fatherName || 'N/A',
          motherName: motherName || 'N/A',
          guardianPhone: guardianPhone || '',
          address: address || 'Shri Dungargarh, Rajasthan',
          admissionDate: new Date(admissionDate || Date.now()),
        },
        include: {
          user: true,
          class: true,
          section: true,
        },
      });

      return student;
    });

    res.status(201).json({ message: 'Student added successfully', student: result });
  } catch (err) {
    next(err);
  }
});

// PUT /api/students/:id
router.put('/:id', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { name, classId, sectionId, rollNo, gender, dob, fatherName, motherName, guardianPhone, address, status } = req.body;

    const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: student.userId },
        data: {
          name: name || student.user.name,
          status: status || student.user.status,
        },
      }),
      prisma.student.update({
        where: { id },
        data: {
          classId: classId || student.classId,
          sectionId: sectionId || student.sectionId,
          rollNo: rollNo ? Number(rollNo) : student.rollNo,
          gender: gender || student.gender,
          dob: dob ? new Date(dob) : student.dob,
          fatherName: fatherName || student.fatherName,
          motherName: motherName || student.motherName,
          guardianPhone: guardianPhone || student.guardianPhone,
          address: address || student.address,
          status: status || student.status,
        },
      }),
    ]);

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/students/:id (Deactivate)
router.delete('/:id', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await prisma.$transaction([
      prisma.student.update({ where: { id }, data: { status: 'INACTIVE' } }),
      prisma.user.update({ where: { id: student.userId }, data: { status: 'INACTIVE' } }),
    ]);

    res.json({ message: 'Student account deactivated successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
