import React, { useState } from 'react';
import { ParentDashboardData } from '@shared/types';
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
  User,
  Users,
  CreditCard,
  Calendar,
} from 'lucide-react';

interface ParentDashboardProps {
  data: ParentDashboardData;
  onNavigate?: (tab: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ data, onNavigate }) => {
  const { children, notices } = data;
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900">No Wards Registered</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          There are currently no student profiles linked to your parent portal account. Please contact the Jaipur Public School administration.
        </p>
      </div>
    );
  }

  const activeChild = children[selectedChildIndex] || children[0];
  const { childProfile, attendance, fees, homework, exams, todaySchedule } = activeChild;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[new Date().getDay()];
  const scheduleForToday = todaySchedule.filter((s) => s.dayOfWeek === currentDay);
  const displaySchedule = scheduleForToday.length > 0 ? scheduleForToday : todaySchedule.slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Parent Welcome Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 lg:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-0.5 bg-white/10 rounded-full text-xs font-semibold text-emerald-200 border border-white/15">
              Parent Guardian Portal
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-2">
              Ward Academic & Welfare Monitor 👨‍👩‍👦
            </h2>
            <p className="text-xs md:text-sm text-emerald-100/80 mt-1">
              Live tracking for your registered children at Jaipur Public School, Shri Dungargarh.
            </p>
          </div>

          {/* Ward Switcher Tabs */}
          {children.length > 1 && (
            <div className="bg-black/30 p-1.5 rounded-2xl border border-white/15 flex items-center gap-1">
              {children.map((c, idx) => (
                <button
                  key={c.childProfile.id}
                  onClick={() => setSelectedChildIndex(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedChildIndex === idx
                      ? 'bg-emerald-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{c.childProfile.name} ({c.childProfile.className})</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="absolute right-[-40px] bottom-[-40px] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Selected Child Info Strip */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              childProfile.avatarUrl ||
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
            }
            alt={childProfile.name}
            className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-gray-900 text-lg">{childProfile.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                {childProfile.className} - {childProfile.sectionName}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Admission: <span className="font-mono font-bold text-gray-700">{childProfile.admissionNo}</span> • Roll #{childProfile.rollNo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('fees')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Fees</span>
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate('results')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-purple-600" />
              <span>Full Report Card</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Ward Monitoring KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Child Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ward Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-gray-900">{attendance.percentage}%</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              attendance.percentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {attendance.percentage >= 75 ? 'Regular' : 'Irregular'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {attendance.presentDays} Present • {attendance.absentDays} Absent
          </p>
        </div>

        {/* Child Outstanding Fees */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding Fees</span>
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

        {/* Child Pending Homework */}
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
              Tasks
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Active for Class {childProfile.className}
          </p>
        </div>

        {/* Academic Grade */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Standing</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-gray-900">{exams.averageScore}%</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {exams.averageScore >= 90 ? 'Grade A+' : exams.averageScore >= 80 ? 'Grade A' : 'Grade B'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Across {exams.totalExamsRecorded} Subject Evaluations
          </p>
        </div>
      </div>

      {/* Main Grid: Exam Scores & Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Child Exam Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                {childProfile.name}'s Exam Performance
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Evaluation summary by subject</p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('results')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Full Report <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {exams.recentMarks.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No exam results recorded for this academic session yet.
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

        {/* Child Fee Ledger Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-amber-600" />
                  Fee Ledger & Payment Status
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Itemized fee dues and collection status</p>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('fees')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  Pay Online <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {fees.records.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                🎉 No pending fees recorded for this student!
              </div>
            ) : (
              <div className="space-y-3">
                {fees.records.map((f) => (
                  <div key={f.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900">{f.category}</h4>
                        <span className={`px-2 py-0.2 text-[10px] font-bold rounded-full ${
                          f.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Due Date: {f.dueDate} • Paid: ₹{f.paidAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-base text-gray-900">
                        ₹{f.dueAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Pending Dues</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('fees')}
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors text-center shadow-xs"
            >
              Clear Outstanding Balance
            </button>
          )}
        </div>
      </div>

      {/* Timetable & Notices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Child Schedule Today */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Class Schedule ({currentDay})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Classroom periods for {childProfile.className}-{childProfile.sectionName}
              </p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Timetable <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {displaySchedule.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No classes scheduled for today.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displaySchedule.map((slot) => (
                <div key={slot.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold text-xs">
                    <span className="text-[9px] uppercase opacity-70">P</span>
                    <span>{slot.periodNo}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate">{slot.subject.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{slot.startTime} - {slot.endTime}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* School Circulars for Parents */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Parent Circulars & Notices
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Official school circulars and parent updates</p>
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
              No active announcements for parents.
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-brand-600">{n.publishDate}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Circular
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
