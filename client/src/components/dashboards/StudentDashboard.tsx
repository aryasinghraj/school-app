import React from 'react';
import { StudentDashboardData } from '@shared/types';
import {
  CalendarCheck,
  IndianRupee,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  ArrowRight,
  GraduationCap,
  Calendar,
} from 'lucide-react';

interface StudentDashboardProps {
  data: StudentDashboardData;
  onNavigate?: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ data, onNavigate }) => {
  const { studentProfile, attendance, fees, homework, exams, todaySchedule, notices } = data;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[new Date().getDay()];
  const scheduleForToday = todaySchedule.filter((s) => s.dayOfWeek === currentDay);
  const displaySchedule = scheduleForToday.length > 0 ? scheduleForToday : todaySchedule.slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Student Welcome Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 lg:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  studentProfile.avatarUrl ||
                  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
                }
                alt={studentProfile.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900" title="Active Student"></span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-3 py-0.5 bg-white/10 rounded-full text-xs font-semibold text-blue-200 border border-white/15">
                  Student Portal
                </span>
                <span className="px-3 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-400/20">
                  {studentProfile.className} - {studentProfile.sectionName}
                </span>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-400/20">
                  Roll #{studentProfile.rollNo}
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                Welcome, {studentProfile.name}! 🎓
              </h2>
              <p className="text-xs md:text-sm text-blue-200/80 mt-1">
                Admission No: <span className="font-mono font-bold text-white">{studentProfile.admissionNo}</span> • Academic Session 2026-2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {onNavigate && (
              <button
                onClick={() => onNavigate('results')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 flex items-center gap-2 backdrop-blur-sm shadow-sm"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>My Report Card</span>
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('timetable')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Full Timetable</span>
              </button>
            )}
          </div>
        </div>
        <div className="absolute right-[-40px] bottom-[-40px] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Personal Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-gray-900">{attendance.percentage}%</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              attendance.percentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {attendance.percentage >= 75 ? 'Good' : 'Low'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {attendance.presentDays} of {attendance.totalDays} Days Present
          </p>
        </div>

        {/* Pending / Cleared Fees */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee Balance</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-gray-900">
              ₹{fees.pendingFees.toLocaleString('en-IN')}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              fees.pendingFees === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {fees.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Total Paid: ₹{fees.paidFees.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Active Homework */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Homework Due</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-gray-900">{homework.totalActive}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Assignments
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            For {studentProfile.className}-{studentProfile.sectionName}
          </p>
        </div>

        {/* Academic Grade / Performance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Score</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-gray-900">{exams.averageScore}%</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {exams.averageScore >= 90 ? 'A+' : exams.averageScore >= 80 ? 'A' : exams.averageScore >= 70 ? 'B' : 'Pass'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Across {exams.totalExamsRecorded} Exam Subjects
          </p>
        </div>
      </div>

      {/* Main Content Grid: Timetable & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule / Timetable */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Class Schedule ({currentDay})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Periods for {studentProfile.className} - Section {studentProfile.sectionName}
              </p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Week <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {displaySchedule.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No classes scheduled for today.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displaySchedule.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/40 hover:border-blue-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold text-xs shadow-xs">
                    <span className="text-[10px] uppercase tracking-tighter opacity-80">Period</span>
                    <span>{slot.periodNo}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900 truncate">{slot.subject.name}</span>
                      <span className="text-[11px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <span>Faculty: {slot.teacher.user.name}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Attendance Strip */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Recent Attendance History (Past Days)
            </h4>
            <div className="flex flex-wrap gap-2">
              {attendance.recentLog.length === 0 ? (
                <span className="text-xs text-gray-400">No attendance marked yet.</span>
              ) : (
                attendance.recentLog.map((att) => (
                  <div
                    key={att.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      att.status === 'PRESENT'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : att.status === 'LATE'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {att.status === 'PRESENT' ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : att.status === 'LATE' ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{att.date}: {att.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pending Homework */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Active Homework
              </h3>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('homework')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {homework.list.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                🎉 No pending homework assignments!
              </div>
            ) : (
              <div className="space-y-3">
                {homework.list.slice(0, 4).map((hw) => (
                  <div
                    key={hw.id}
                    className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {hw.subjectName}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due {hw.dueDate}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{hw.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {hw.description || 'Complete the assignment as instructed in class.'}
                    </p>
                    <div className="mt-2 text-[11px] text-gray-400 font-medium">
                      Assigned by: {hw.teacherName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('homework')}
              className="mt-4 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors text-center"
            >
              Submit / Check All Homework
            </button>
          )}
        </div>
      </div>

      {/* Academic Marks & Notices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exam Scores */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Recent Exam Scores & Grades
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Subject-wise marks recorded for your profile</p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('results')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Report Card <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {exams.recentMarks.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No exam marks recorded yet for this session.
            </div>
          ) : (
            <div className="space-y-3.5">
              {exams.recentMarks.slice(0, 5).map((m) => {
                const scorePercent = Math.round((m.obtainedMarks / m.maxMarks) * 100);
                return (
                  <div key={m.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <span>{m.subjectName}</span>
                        <span className="text-[10px] text-gray-500 font-normal">({m.examName})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 font-mono">
                          {m.obtainedMarks} / {m.maxMarks}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-black">
                          {m.grade || 'A'}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, scorePercent)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notices & Circulars */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                School Notices & Circulars
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Announcements for Jaipur Public School students</p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                All Notices <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {notices.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No recent notices on the circular board.
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-brand-600">{n.publishDate}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                      Notice
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">{n.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
