import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
};

const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  LEAVE: 'LEAVE',
};

const FeeStatus = {
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE',
};

const TargetAudience = {
  EVERYONE: 'EVERYONE',
  TEACHERS: 'TEACHERS',
  STUDENTS: 'STUDENTS',
  PARENTS: 'PARENTS',
  CLASS_SPECIFIC: 'CLASS_SPECIFIC',
};

async function main() {
  console.log('🌱 Starting database seeding for Jaipur Public School...');

  // Clean existing records in cascade-safe order
  await prisma.payment.deleteMany({});
  await prisma.feeRecord.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.feeCategory.deleteMany({});
  await prisma.timetable.deleteMany({});
  await prisma.mark.deleteMany({});
  await prisma.examSubject.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.homework.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.classSubjectTeacher.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.academicYear.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.school.deleteMany({});

  // 1. Create School Entity
  const school = await prisma.school.create({
    data: {
      name: 'Jaipur Public School',
      code: 'JPS-SDG-01',
      location: 'Shri Dungargarh, Rajasthan',
      state: 'Rajasthan',
      country: 'India',
      logoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80',
      phone: '+91 1565 223456',
      email: 'info@jaipurpublicschool.edu.in',
      established: 2005,
      currency: 'INR',
    },
  });

  console.log(`✅ Created School: ${school.name}`);

  // Default Passwords Hashed
  const superAdminPassword = await bcrypt.hash('superadmin123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);
  const parentPassword = await bcrypt.hash('parent123', 10);

  // 2. Users - Super Admin & School Admin
  const superAdminUser = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'superadmin@jaipurpublic.edu.in',
      passwordHash: superAdminPassword,
      name: 'Platform Super Admin',
      role: Role.SUPER_ADMIN,
    },
  });

  const schoolAdminUser = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'admin@jaipurpublic.edu.in',
      passwordHash: adminPassword,
      name: 'Dr. Om Prakash Sharma',
      role: Role.SCHOOL_ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      yearName: '2026-2027',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
    },
  });

  // 4. Classes & Sections
  const class9 = await prisma.class.create({
    data: { schoolId: school.id, academicYearId: academicYear.id, name: 'Class 9', numericGrade: 9 },
  });
  const class10 = await prisma.class.create({
    data: { schoolId: school.id, academicYearId: academicYear.id, name: 'Class 10', numericGrade: 10 },
  });
  const class11 = await prisma.class.create({
    data: { schoolId: school.id, academicYearId: academicYear.id, name: 'Class 11', numericGrade: 11 },
  });
  const class12 = await prisma.class.create({
    data: { schoolId: school.id, academicYearId: academicYear.id, name: 'Class 12', numericGrade: 12 },
  });

  const sec9A = await prisma.section.create({ data: { classId: class9.id, name: 'A', roomNo: 'Room 101' } });
  const sec9B = await prisma.section.create({ data: { classId: class9.id, name: 'B', roomNo: 'Room 102' } });
  const sec10A = await prisma.section.create({ data: { classId: class10.id, name: 'A', roomNo: 'Room 201' } });
  const sec10B = await prisma.section.create({ data: { classId: class10.id, name: 'B', roomNo: 'Room 202' } });
  const sec11A = await prisma.section.create({ data: { classId: class11.id, name: 'A', roomNo: 'Room 301' } });
  const sec12A = await prisma.section.create({ data: { classId: class12.id, name: 'A', roomNo: 'Room 401' } });

  // 5. Subjects
  const mathSubject = await prisma.subject.create({ data: { schoolId: school.id, name: 'Mathematics', code: 'MATH-01', type: 'Core' } });
  const engSubject = await prisma.subject.create({ data: { schoolId: school.id, name: 'English', code: 'ENG-01', type: 'Core' } });
  const hindiSubject = await prisma.subject.create({ data: { schoolId: school.id, name: 'Hindi', code: 'HIN-01', type: 'Core' } });
  const sciSubject = await prisma.subject.create({ data: { schoolId: school.id, name: 'Science', code: 'SCI-01', type: 'Core' } });
  const sstSubject = await prisma.subject.create({ data: { schoolId: school.id, name: 'Social Science', code: 'SST-01', type: 'Core' } });
  const csSubject = await prisma.subject.create({ data: { schoolId: school.id, name: 'Computer Science', code: 'CS-01', type: 'Elective' } });

  // 6. Teachers
  const teacher1User = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'teacher@jaipurpublic.edu.in',
      passwordHash: teacherPassword,
      name: 'Rajesh Sharma',
      role: Role.TEACHER,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });
  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacher1User.id,
      schoolId: school.id,
      teacherCode: 'TCH-001',
      phone: '+91 98290 12345',
      gender: 'Male',
      dob: new Date('1985-05-15'),
      qualification: 'M.Sc. Mathematics, B.Ed.',
      mainSubject: 'Mathematics',
      joiningDate: new Date('2018-07-01'),
    },
  });

  const teacher2User = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'sunita.sharma@jaipurpublic.edu.in',
      passwordHash: teacherPassword,
      name: 'Sunita Sharma',
      role: Role.TEACHER,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });
  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacher2User.id,
      schoolId: school.id,
      teacherCode: 'TCH-002',
      phone: '+91 98290 67890',
      gender: 'Female',
      dob: new Date('1988-11-20'),
      qualification: 'M.A. English Literature, B.Ed.',
      mainSubject: 'English',
      joiningDate: new Date('2019-08-10'),
    },
  });

  const teacher3User = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'vikram.singh@jaipurpublic.edu.in',
      passwordHash: teacherPassword,
      name: 'Vikram Singh Rathore',
      role: Role.TEACHER,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });
  const teacher3 = await prisma.teacher.create({
    data: {
      userId: teacher3User.id,
      schoolId: school.id,
      teacherCode: 'TCH-003',
      phone: '+91 98291 11223',
      gender: 'Male',
      dob: new Date('1983-02-10'),
      qualification: 'M.Sc. Physics, M.Ed.',
      mainSubject: 'Science',
      joiningDate: new Date('2016-04-15'),
    },
  });

  // Assign teachers to class-subject mappings
  await prisma.classSubjectTeacher.createMany({
    data: [
      { classId: class9.id, sectionId: sec9A.id, subjectId: mathSubject.id, teacherId: teacher1.id },
      { classId: class9.id, sectionId: sec9A.id, subjectId: engSubject.id, teacherId: teacher2.id },
      { classId: class9.id, sectionId: sec9A.id, subjectId: sciSubject.id, teacherId: teacher3.id },
      { classId: class10.id, sectionId: sec10A.id, subjectId: mathSubject.id, teacherId: teacher1.id },
      { classId: class10.id, sectionId: sec10A.id, subjectId: engSubject.id, teacherId: teacher2.id },
      { classId: class10.id, sectionId: sec10A.id, subjectId: sciSubject.id, teacherId: teacher3.id },
    ],
  });

  // 7. Parents
  const parent1User = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'parent@jaipurpublic.edu.in',
      passwordHash: parentPassword,
      name: 'Ramesh Kumar Agarwal',
      role: Role.PARENT,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });
  const parent1 = await prisma.parent.create({
    data: {
      userId: parent1User.id,
      schoolId: school.id,
      occupation: 'Business Owner (Textiles)',
      alternatePhone: '+91 94140 55443',
      address: 'Main Market Road, Shri Dungargarh, Bikaner Dist, Rajasthan - 331803',
    },
  });

  const parent2User = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'mahendra.seervai@jaipurpublic.edu.in',
      passwordHash: parentPassword,
      name: 'Mahendra Seervai',
      role: Role.PARENT,
    },
  });
  const parent2 = await prisma.parent.create({
    data: {
      userId: parent2User.id,
      schoolId: school.id,
      occupation: 'Agricultural Manager',
      alternatePhone: '+91 94141 99887',
      address: 'Station Road, Shri Dungargarh, Rajasthan',
    },
  });

  // 8. Students
  const student1User = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'student@jaipurpublic.edu.in',
      passwordHash: studentPassword,
      name: 'Aarav Agarwal',
      role: Role.STUDENT,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
  });
  const student1 = await prisma.student.create({
    data: {
      userId: student1User.id,
      schoolId: school.id,
      classId: class9.id,
      sectionId: sec9A.id,
      parentId: parent1.id,
      admissionNo: 'JPS-2024-0901',
      rollNo: 1,
      gender: 'Male',
      dob: new Date('2011-06-12'),
      fatherName: 'Ramesh Kumar Agarwal',
      motherName: 'Sunita Devi Agarwal',
      guardianPhone: '+91 94140 55443',
      address: 'Main Market Road, Shri Dungargarh, Rajasthan',
      admissionDate: new Date('2024-04-05'),
    },
  });

  const student2User = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'ananya.agarwal@jaipurpublic.edu.in',
      passwordHash: studentPassword,
      name: 'Ananya Agarwal',
      role: Role.STUDENT,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  });
  const student2 = await prisma.student.create({
    data: {
      userId: student2User.id,
      schoolId: school.id,
      classId: class10.id,
      sectionId: sec10A.id,
      parentId: parent1.id,
      admissionNo: 'JPS-2023-1002',
      rollNo: 2,
      gender: 'Female',
      dob: new Date('2010-03-24'),
      fatherName: 'Ramesh Kumar Agarwal',
      motherName: 'Sunita Devi Agarwal',
      guardianPhone: '+91 94140 55443',
      address: 'Main Market Road, Shri Dungargarh, Rajasthan',
      admissionDate: new Date('2023-04-02'),
    },
  });

  const extraStudentsData = [
    { name: 'Priya Sharma', email: 'priya.sharma@jaipurpublic.edu.in', classId: class9.id, secId: sec9A.id, roll: 2, gender: 'Female', parentId: parent2.id, adm: 'JPS-2024-0902' },
    { name: 'Rohan Rathore', email: 'rohan.rathore@jaipurpublic.edu.in', classId: class9.id, secId: sec9A.id, roll: 3, gender: 'Male', parentId: null, adm: 'JPS-2024-0903' },
    { name: 'Kavya Choudhary', email: 'kavya.c@jaipurpublic.edu.in', classId: class9.id, secId: sec9B.id, roll: 1, gender: 'Female', parentId: null, adm: 'JPS-2024-0904' },
    { name: 'Devendra Shekhawat', email: 'devendra.s@jaipurpublic.edu.in', classId: class10.id, secId: sec10A.id, roll: 1, gender: 'Male', parentId: null, adm: 'JPS-2023-1001' },
    { name: 'Diya Joshi', email: 'diya.j@jaipurpublic.edu.in', classId: class10.id, secId: sec10B.id, roll: 1, gender: 'Female', parentId: null, adm: 'JPS-2023-1003' },
    { name: 'Manish Saini', email: 'manish.s@jaipurpublic.edu.in', classId: class11.id, secId: sec11A.id, roll: 1, gender: 'Male', parentId: null, adm: 'JPS-2022-1101' },
    { name: 'Pooja Kanwar', email: 'pooja.k@jaipurpublic.edu.in', classId: class12.id, secId: sec12A.id, roll: 1, gender: 'Female', parentId: null, adm: 'JPS-2021-1201' },
  ];

  const createdStudents = [student1, student2];

  for (const s of extraStudentsData) {
    const sUser = await prisma.user.create({
      data: {
        schoolId: school.id,
        email: s.email,
        passwordHash: studentPassword,
        name: s.name,
        role: Role.STUDENT,
      },
    });
    const sProfile = await prisma.student.create({
      data: {
        userId: sUser.id,
        schoolId: school.id,
        classId: s.classId,
        sectionId: s.secId,
        parentId: s.parentId,
        admissionNo: s.adm,
        rollNo: s.roll,
        gender: s.gender,
        dob: new Date('2011-08-15'),
        fatherName: 'Father ' + s.name.split(' ')[1],
        motherName: 'Mother ' + s.name.split(' ')[1],
        guardianPhone: '+91 98299 00000',
        address: 'Shri Dungargarh, Rajasthan',
        admissionDate: new Date('2024-04-01'),
      },
    });
    createdStudents.push(sProfile);
  }

  console.log(`✅ Created ${createdStudents.length} Students & Demo Users`);

  // 9. Attendance Records for past 10 days
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0) continue;

    for (const student of createdStudents) {
      let status: string = AttendanceStatus.PRESENT;
      const rand = (student.rollNo + i) % 10;
      if (rand === 8) status = AttendanceStatus.ABSENT;
      else if (rand === 9) status = AttendanceStatus.LATE;
      else if (rand === 7 && i === 3) status = AttendanceStatus.LEAVE;

      await prisma.attendance.create({
        data: {
          schoolId: school.id,
          studentId: student.id,
          classId: student.classId,
          sectionId: student.sectionId,
          date: date,
          status: status,
          markedBy: schoolAdminUser.id,
          remarks: status === AttendanceStatus.ABSENT ? 'Absent without prior application' : null,
        },
      });
    }
  }

  console.log('✅ Created Attendance Records');

  // 10. Homework
  await prisma.homework.createMany({
    data: [
      {
        schoolId: school.id,
        classId: class9.id,
        sectionId: sec9A.id,
        subjectId: mathSubject.id,
        teacherId: teacher1.id,
        title: 'Quadratic Equations Exercise 4.2',
        description: 'Solve questions 1 to 15 from Chapter 4 Exercise 4.2 in your homework notebook.',
        assignedDate: new Date(today.getTime() - 86400000 * 2),
        dueDate: new Date(today.getTime() + 86400000 * 2),
      },
      {
        schoolId: school.id,
        classId: class9.id,
        sectionId: sec9A.id,
        subjectId: engSubject.id,
        teacherId: teacher2.id,
        title: 'Essay Writing on Digital India',
        description: 'Write a 300-word essay on the topic "Impact of Technology on Rural Education in India".',
        assignedDate: new Date(today.getTime() - 86400000 * 1),
        dueDate: new Date(today.getTime() + 86400000 * 3),
      },
      {
        schoolId: school.id,
        classId: class10.id,
        sectionId: sec10A.id,
        subjectId: sciSubject.id,
        teacherId: teacher3.id,
        title: 'Lab Report: Light Reflection and Refraction',
        description: 'Complete the ray diagrams and calculation table for the convex lens experiment.',
        assignedDate: new Date(today.getTime() - 86400000 * 3),
        dueDate: new Date(today.getTime() + 86400000 * 1),
      },
    ],
  });

  console.log('✅ Created Homework Assignments');

  // 11. Exams & Marks
  const exam1 = await prisma.exam.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: 'Unit Test 1 (2026)',
      examType: 'Unit Test',
      startDate: new Date('2026-07-15'),
      endDate: new Date('2026-07-22'),
    },
  });

  const exam2 = await prisma.exam.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: 'Half Yearly Examination 2026',
      examType: 'Half Yearly',
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-20'),
    },
  });

  const examSubMath9 = await prisma.examSubject.create({
    data: { examId: exam2.id, subjectId: mathSubject.id, classId: class9.id, examDate: new Date('2026-09-11'), maxMarks: 100, passMarks: 33 },
  });
  const examSubEng9 = await prisma.examSubject.create({
    data: { examId: exam2.id, subjectId: engSubject.id, classId: class9.id, examDate: new Date('2026-09-13'), maxMarks: 100, passMarks: 33 },
  });
  const examSubSci9 = await prisma.examSubject.create({
    data: { examId: exam2.id, subjectId: sciSubject.id, classId: class9.id, examDate: new Date('2026-09-15'), maxMarks: 100, passMarks: 33 },
  });

  await prisma.mark.createMany({
    data: [
      { examSubjectId: examSubMath9.id, studentId: student1.id, obtainedMarks: 92, grade: 'A+', remarks: 'Excellent logical analytical skills', evaluatorId: teacher1User.id },
      { examSubjectId: examSubEng9.id, studentId: student1.id, obtainedMarks: 85, grade: 'A', remarks: 'Good grammar and essay composition', evaluatorId: teacher2User.id },
      { examSubjectId: examSubSci9.id, studentId: student1.id, obtainedMarks: 88, grade: 'A', remarks: 'Clear understanding of scientific concepts', evaluatorId: teacher3User.id },
    ],
  });

  console.log('✅ Created Exams and Exam Marks');

  // 12. Weekly Timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let p = 1; p <= 6; p++) {
    for (const day of days) {
      let subjId = mathSubject.id;
      let tchId = teacher1.id;
      if (p % 3 === 2) {
        subjId = engSubject.id;
        tchId = teacher2.id;
      } else if (p % 3 === 0) {
        subjId = sciSubject.id;
        tchId = teacher3.id;
      }

      await prisma.timetable.create({
        data: {
          classId: class9.id,
          sectionId: sec9A.id,
          subjectId: subjId,
          teacherId: tchId,
          dayOfWeek: day,
          periodNo: p,
          startTime: `${8 + Math.floor((p * 45) / 60)}:${((p * 45) % 60).toString().padStart(2, '0')}`,
          endTime: `${8 + Math.floor(((p + 1) * 45) / 60)}:${(((p + 1) * 45) % 60).toString().padStart(2, '0')}`,
        },
      });
    }
  }

  console.log('✅ Created Timetables');

  // 13. Fees
  const feeCatTuition = await prisma.feeCategory.create({
    data: { schoolId: school.id, name: 'Tuition Fee', description: 'Quarterly Academic Tuition Fee' },
  });
  const feeCatExam = await prisma.feeCategory.create({
    data: { schoolId: school.id, name: 'Examination Fee', description: 'Annual Examination Fee' },
  });
  const feeCatComputer = await prisma.feeCategory.create({
    data: { schoolId: school.id, name: 'Computer & Lab Fee', description: 'Annual Computer Lab maintenance' },
  });

  await prisma.feeStructure.createMany({
    data: [
      { schoolId: school.id, classId: class9.id, feeCategoryId: feeCatTuition.id, academicYearId: academicYear.id, amount: 12000 },
      { schoolId: school.id, classId: class9.id, feeCategoryId: feeCatExam.id, academicYearId: academicYear.id, amount: 1500 },
      { schoolId: school.id, classId: class9.id, feeCategoryId: feeCatComputer.id, academicYearId: academicYear.id, amount: 2000 },
      { schoolId: school.id, classId: class10.id, feeCategoryId: feeCatTuition.id, academicYearId: academicYear.id, amount: 14000 },
    ],
  });

  const feeRecord1 = await prisma.feeRecord.create({
    data: {
      schoolId: school.id,
      studentId: student1.id,
      feeCategoryId: feeCatTuition.id,
      totalAmount: 12000,
      discountAmount: 1000,
      fineAmount: 0,
      netAmount: 11000,
      paidAmount: 11000,
      dueAmount: 0,
      dueDate: new Date('2026-06-30'),
      status: FeeStatus.PAID,
    },
  });

  await prisma.payment.create({
    data: {
      feeRecordId: feeRecord1.id,
      paymentDate: new Date('2026-06-15'),
      amountPaid: 11000,
      paymentMethod: 'UPI',
      transactionRef: 'UPI/619283019283/JPS',
      remarks: 'Quarter 1 Tuition Fee Paid via PhonePe',
    },
  });

  const feeRecord2 = await prisma.feeRecord.create({
    data: {
      schoolId: school.id,
      studentId: student1.id,
      feeCategoryId: feeCatExam.id,
      totalAmount: 1500,
      discountAmount: 0,
      fineAmount: 0,
      netAmount: 1500,
      paidAmount: 500,
      dueAmount: 1000,
      dueDate: new Date('2026-09-01'),
      status: FeeStatus.PARTIAL,
    },
  });

  await prisma.payment.create({
    data: {
      feeRecordId: feeRecord2.id,
      paymentDate: new Date('2026-08-20'),
      amountPaid: 500,
      paymentMethod: 'Cash',
      transactionRef: 'REC-2026-0042',
      remarks: 'Partial payment cash counter',
    },
  });

  await prisma.feeRecord.create({
    data: {
      schoolId: school.id,
      studentId: student2.id,
      feeCategoryId: feeCatTuition.id,
      totalAmount: 14000,
      discountAmount: 0,
      fineAmount: 200,
      netAmount: 14200,
      paidAmount: 0,
      dueAmount: 14200,
      dueDate: new Date('2026-08-31'),
      status: FeeStatus.OVERDUE,
    },
  });

  console.log('✅ Created Fee Records and Payment History');

  // 14. School Notices
  await prisma.notice.createMany({
    data: [
      {
        schoolId: school.id,
        title: 'Parent-Teacher Meeting (PTM) Notice',
        content: 'Dear Parents, PTM for Classes 9 to 12 will be conducted on Saturday, 28th September 2026 from 9:00 AM to 1:00 PM at Jaipur Public School campus. Attendance is highly recommended to discuss student progress.',
        targetAudience: TargetAudience.EVERYONE,
        authorUserId: schoolAdminUser.id,
        publishedAt: new Date(today.getTime() - 86400000 * 1),
      },
      {
        schoolId: school.id,
        title: 'Annual Sports Day Selection Trials',
        content: 'Inter-house sports selection trials for athletics, volleyball, and kabaddi will begin from Monday next week. Interested students should contact Mr. Vikram Singh (Sports Instructor).',
        targetAudience: TargetAudience.STUDENTS,
        authorUserId: schoolAdminUser.id,
        publishedAt: new Date(today.getTime() - 86400000 * 3),
      },
      {
        schoolId: school.id,
        title: 'Staff Meeting on Academic Syllabus Review',
        content: 'All faculty members are requested to attend the syllabus completion review meeting in the Staff Room on Friday at 3:30 PM.',
        targetAudience: TargetAudience.TEACHERS,
        authorUserId: schoolAdminUser.id,
        publishedAt: new Date(today.getTime() - 86400000 * 2),
      },
    ],
  });

  console.log('✅ Created Notices and Announcements');

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETE FOR JAIPUR PUBLIC SCHOOL!');
  console.log('======================================================');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
