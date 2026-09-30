export type Role = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

export type FeeStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';

export type TargetAudience = 'EVERYONE' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'CLASS_SPECIFIC';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  schoolId: string;
  schoolName: string;
  avatarUrl?: string | null;
  teacherId?: string | null;
  studentId?: string | null;
  parentId?: string | null;
}

export interface SchoolConfig {
  id: string;
  name: string;
  code: string;
  location: string;
  state: string;
  country: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  currency: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayAttendancePercentage: number;
  totalPendingFees: number;
  upcomingExamsCount: number;
  recentNoticesCount: number;
  studentDistributionByClass: { className: string; count: number }[];
  attendanceTrend: { date: string; present: number; absent: number; late: number; leave: number }[];
  feeOverview: { category: string; collected: number; pending: number }[];
  examPerformance: { subject: string; averageMarks: number }[];
}

export type AdminDashboardData = DashboardStats;

export interface StudentDashboardData {
  role: 'STUDENT';
  studentProfile: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    admissionNo: string;
    rollNo: number;
    className: string;
    sectionName: string;
    classId: string;
    sectionId: string;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    percentage: number;
    recentLog: {
      id: string;
      date: string;
      status: AttendanceStatus;
      remarks?: string | null;
    }[];
  };
  fees: {
    totalFees: number;
    paidFees: number;
    pendingFees: number;
    status: FeeStatus;
    records: {
      id: string;
      category: string;
      totalAmount: number;
      paidAmount: number;
      dueAmount: number;
      status: FeeStatus;
      dueDate: string;
    }[];
  };
  homework: {
    totalActive: number;
    list: {
      id: string;
      title: string;
      description: string;
      subjectName: string;
      teacherName: string;
      dueDate: string;
    }[];
  };
  exams: {
    averageScore: number;
    totalExamsRecorded: number;
    recentMarks: {
      id: string;
      examName: string;
      subjectName: string;
      obtainedMarks: number;
      maxMarks: number;
      grade?: string | null;
      remarks?: string | null;
    }[];
  };
  todaySchedule: {
    id: string;
    periodNo: number;
    startTime: string;
    endTime: string;
    subject: { name: string; code: string };
    teacher: { user: { name: string } };
    dayOfWeek: string;
  }[];
  notices: {
    id: string;
    title: string;
    content: string;
    priority: string;
    publishDate: string;
  }[];
}

export interface ParentChildData {
  childProfile: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    admissionNo: string;
    rollNo: number;
    className: string;
    sectionName: string;
    classId: string;
    sectionId: string;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    percentage: number;
    recentLog: {
      id: string;
      date: string;
      status: AttendanceStatus;
      remarks?: string | null;
    }[];
  };
  fees: {
    totalFees: number;
    paidFees: number;
    pendingFees: number;
    status: FeeStatus;
    records: {
      id: string;
      category: string;
      totalAmount: number;
      paidAmount: number;
      dueAmount: number;
      status: FeeStatus;
      dueDate: string;
    }[];
  };
  homework: {
    totalActive: number;
    list: {
      id: string;
      title: string;
      description: string;
      subjectName: string;
      teacherName: string;
      dueDate: string;
    }[];
  };
  exams: {
    averageScore: number;
    totalExamsRecorded: number;
    recentMarks: {
      id: string;
      examName: string;
      subjectName: string;
      obtainedMarks: number;
      maxMarks: number;
      grade?: string | null;
      remarks?: string | null;
    }[];
  };
  todaySchedule: {
    id: string;
    periodNo: number;
    startTime: string;
    endTime: string;
    subject: { name: string; code: string };
    teacher: { user: { name: string } };
    dayOfWeek: string;
  }[];
}

export interface ParentDashboardData {
  role: 'PARENT';
  children: ParentChildData[];
  selectedChildId: string;
  notices: {
    id: string;
    title: string;
    content: string;
    priority: string;
    publishDate: string;
  }[];
}

export interface TeacherDashboardData {
  role: 'TEACHER';
  teacherProfile: {
    id: string;
    name: string;
    email: string;
    teacherCode: string;
    mainSubject: string;
    qualification: string;
    phone: string;
  };
  assignedClasses: {
    classId: string;
    sectionId: string;
    className: string;
    sectionName: string;
    subjectName: string;
    studentCount: number;
    isAttendanceMarkedToday: boolean;
  }[];
  totalStudentsTaught: number;
  totalLecturesToday: number;
  todaySchedule: {
    id: string;
    periodNo: number;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    class: { name: string };
    section: { name: string; roomNo?: string | null };
    subject: { name: string; code: string };
  }[];
  recentHomework: {
    id: string;
    title: string;
    description: string;
    className: string;
    sectionName: string;
    subjectName: string;
    dueDate: string;
  }[];
  notices: {
    id: string;
    title: string;
    content: string;
    priority: string;
    publishDate: string;
  }[];
}

export type RoleDashboardData =
  | ({ role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' } & DashboardStats)
  | StudentDashboardData
  | ParentDashboardData
  | TeacherDashboardData;

