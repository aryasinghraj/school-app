import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/fees/records
router.get('/records', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN', 'STUDENT', 'PARENT']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const schoolId = req.user!.schoolId;
    const { status, studentId, classId } = req.query;

    let where: any = { schoolId };

    // RBAC Scope
    if (req.user!.role === 'STUDENT') {
      where.studentId = req.user!.studentId;
    } else if (req.user!.role === 'PARENT') {
      const children = await prisma.student.findMany({
        where: { parentId: req.user!.parentId!, schoolId },
        select: { id: true },
      });
      const childIds = children.map((c) => c.id);
      if (studentId) {
        if (!childIds.includes(String(studentId))) {
          return res.status(403).json({ message: 'Forbidden: You cannot access fee records of an unrelated student.' });
        }
        where.studentId = String(studentId);
      } else {
        where.studentId = { in: childIds };
      }
    } else {
      if (studentId) where.studentId = String(studentId);
      if (status) where.status = String(status);
      if (classId) where.student = { classId: String(classId) };
    }

    const records = await prisma.feeRecord.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } }, class: true, section: true } },
        feeCategory: true,
        payments: { orderBy: { paymentDate: 'desc' } },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
});

// GET /api/fees/categories
router.get('/categories', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const categories = await prisma.feeCategory.findMany({
      where: { schoolId: req.user!.schoolId },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// POST /api/fees/categories
router.post('/categories', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.feeCategory.create({
      data: {
        schoolId: req.user!.schoolId,
        name,
        description: description || null,
      },
    });
    res.status(201).json({ message: 'Fee Category created', category });
  } catch (err) {
    next(err);
  }
});

// POST /api/fees/records (Assign fee to student)
router.post('/records', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { studentId, feeCategoryId, totalAmount, discountAmount, fineAmount, dueDate } = req.body;

    if (!studentId || !feeCategoryId || !totalAmount || !dueDate) {
      return res.status(400).json({ message: 'Missing required fee record fields' });
    }

    const total = Number(totalAmount);
    const discount = discountAmount ? Number(discountAmount) : 0;
    const fine = fineAmount ? Number(fineAmount) : 0;
    const net = total - discount + fine;

    const record = await prisma.feeRecord.create({
      data: {
        schoolId: req.user!.schoolId,
        studentId,
        feeCategoryId,
        totalAmount: total,
        discountAmount: discount,
        fineAmount: fine,
        netAmount: net,
        paidAmount: 0,
        dueAmount: net,
        dueDate: new Date(dueDate),
        status: 'PENDING',
      },
      include: { student: { include: { user: true } }, feeCategory: true },
    });

    res.status(201).json({ message: 'Fee record created successfully', record });
  } catch (err) {
    next(err);
  }
});

// POST /api/fees/pay (Record payment)
router.post('/pay', authenticate, requireRoles(['SCHOOL_ADMIN', 'SUPER_ADMIN', 'STUDENT', 'PARENT']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { feeRecordId, amountPaid, paymentMethod, transactionRef, remarks } = req.body;
    const schoolId = req.user!.schoolId;

    if (!feeRecordId || !amountPaid || !paymentMethod) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    const record = await prisma.feeRecord.findFirst({
      where: { id: feeRecordId, schoolId },
    });
    if (!record) {
      return res.status(404).json({ message: 'Fee record not found in this school' });
    }

    // Role-based Verification
    if (req.user!.role === 'STUDENT' && record.studentId !== req.user!.studentId) {
      return res.status(403).json({ message: 'Forbidden: You cannot pay another student\'s fee record.' });
    }

    if (req.user!.role === 'PARENT') {
      const student = await prisma.student.findFirst({
        where: { id: record.studentId, parentId: req.user!.parentId!, schoolId },
      });
      if (!student) {
        return res.status(403).json({ message: 'Forbidden: You can only pay fee records for your registered children.' });
      }
    }

    const payAmount = Number(amountPaid);
    const newPaidAmount = record.paidAmount + payAmount;
    const newDueAmount = Math.max(0, record.netAmount - newPaidAmount);

    let newStatus = 'PARTIAL';
    if (newDueAmount <= 0) {
      newStatus = 'PAID';
    }

    const paymentResult = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          feeRecordId,
          amountPaid: payAmount,
          paymentMethod,
          transactionRef: transactionRef || `TXN-${Date.now()}`,
          remarks: remarks || 'Fee Payment Receipt',
        },
      });

      const updatedRecord = await tx.feeRecord.update({
        where: { id: feeRecordId },
        data: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: newStatus,
        },
        include: { student: { include: { user: true } }, feeCategory: true },
      });

      return { payment, record: updatedRecord };
    });

    res.json({
      message: 'Payment recorded successfully!',
      receipt: {
        receiptNo: paymentResult.payment.transactionRef,
        date: paymentResult.payment.paymentDate,
        amountPaid: payAmount,
        paymentMethod,
        studentName: paymentResult.record.student.user.name,
        feeCategory: paymentResult.record.feeCategory.name,
        remainingDue: paymentResult.record.dueAmount,
        status: paymentResult.record.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
