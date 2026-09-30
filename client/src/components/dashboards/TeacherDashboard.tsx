import React from 'react';
import { TeacherDashboardData } from '@shared/types';
import {
  Users,
  CalendarCheck,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  ArrowRight,
  PlusCircle,
  Award,
  Building2,
  FileText,
} from 'lucide-react';

interface TeacherDashboardProps {
  data: TeacherDashboardData;
  onNavigate?: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ data, onNavigate }) => {
  const { teacherProfile, assignedClasses, totalStudentsTaught, totalLecturesToday, todaySchedule, recentHomework, notices } = data;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[new Date().getDay()];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Teacher Profile Hero Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-900 p-6 lg:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-0.5 bg-white/10 rounded-full text-xs font-semibold text-brand-200 border border-white/15">
                Faculty Portal
              </span>
              <span className="px-3 py-0.5 bg-brand-500/20 text-brand-300 rounded-full text-xs font-bold border border-brand-400/20">
                Code: {teacherProfile.teacherCode}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-400/20">
                {teacherProfile.mainSubject} Department
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Welcome, Prof. {teacherProfile.name}! 👨‍🏫
            </h2>
            <p className="text-xs md:text-sm text-brand-100/80 mt-1">
              Qualification: {teacherProfile.qualification} • Jaipur Public School Faculty
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('attendance')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Mark Attendance</span>
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('homework')}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Assign Homework</span>
              </button>
            )}
          </div>
        </div>
        <div className="absolute right-[-40px] bottom-[-40px] w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Faculty KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Classes */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Classes</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-gray-900">{assignedClasses.length}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Classrooms
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {assignedClasses.map((c) => `${c.className}-${c.sectionName}`).join(', ')}
          </p>
        </div>

        {/* Lectures Today */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lectures Today</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-gray-900">{totalLecturesToday}</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Periods
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Scheduled for {currentDay}
          </p>
        </div>

        {/* Active Students Taught */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Students Under Care</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-gray-900">{totalStudentsTaught}</span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Enrolled
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Across your assigned batches
          </p>
        </div>

        {/* Attendance Status */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {assignedClasses.some((c) => c.isAttendanceMarkedToday) ? (
              <>
                <span className="text-xl lg:text-2xl font-black text-emerald-700">Submitted</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Done
                </span>
              </>
            ) : (
              <>
                <span className="text-xl lg:text-2xl font-black text-amber-700">Pending</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Action Required
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Daily classroom register
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Teaching Schedule & Assigned Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Teaching Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Teaching Schedule Today ({currentDay})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Chronological list of your lecture periods</p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Full Week <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {todaySchedule.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No lecture periods scheduled on your timetable for {currentDay}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todaySchedule.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-indigo-200 transition-all flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center font-bold text-xs shadow-xs">
                    <span className="text-[10px] uppercase opacity-70">P</span>
                    <span>{slot.periodNo}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900 truncate">
                        {slot.class.name} - {slot.section.name}
                      </span>
                      <span className="text-[11px] font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-brand-700">{slot.subject.name}</span>
                      {slot.section.roomNo && (
                        <span>• Room: {slot.section.roomNo}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assigned Classes Quick Summary */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Your Assigned Classrooms & Attendance Today
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignedClasses.map((ac) => (
                <div
                  key={`${ac.classId}-${ac.sectionId}`}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-gray-900">
                      {ac.className} - Section {ac.sectionName}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Subject: {ac.subjectName} • {ac.studentCount} Students
                    </p>
                  </div>
                  <div>
                    {ac.isAttendanceMarkedToday ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" /> Marked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Homework Published */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                Published Homework
              </h3>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('homework')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {recentHomework.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                You haven't assigned any homework yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentHomework.map((h) => (
                  <div key={h.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-brand-700">{h.className}-{h.sectionName}</span>
                      <span className="text-gray-500 font-semibold">Due: {h.dueDate}</span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{h.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{h.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('attendance')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Mark Today's Attendance</span>
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('results')}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-purple-600" />
                <span>Enter Exam Marks</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Staff Circulars */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Faculty & Staff Bulletins
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Circulars from Jaipur Public School Principal Office</p>
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
          <div className="py-8 text-center text-gray-400 text-sm">
            No active staff circulars on the bulletin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notices.map((n) => (
              <div key={n.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-brand-600">{n.publishDate}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                      Staff Bulletin
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 mt-1">{n.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-3 leading-relaxed">{n.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
