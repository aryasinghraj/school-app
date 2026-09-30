import React from 'react';
import { DashboardStats } from '@shared/types';
import { StatCard } from '../StatCard';
import {
  GraduationCap,
  Users,
  Building2,
  CalendarCheck,
  IndianRupee,
  FileText,
  TrendingUp,
  UserPlus,
  CreditCard,
  Megaphone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface AdminDashboardProps {
  stats: DashboardStats;
  userName?: string;
  onNavigate?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, userName, onNavigate }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Hero Card */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 p-6 lg:p-8 text-white shadow-xl relative overflow-hidden border border-brand-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-0.5 bg-white/10 rounded-full text-xs font-semibold text-brand-200 border border-white/15">
              Principal & Administrator Office
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-2">
              Welcome back, {userName || 'Administrator'}! 👑
            </h2>
            <p className="text-xs md:text-sm text-brand-100/90 mt-1 max-w-2xl">
              Live institutional overview for Jaipur Public School, Shri Dungargarh. All metrics derived from verified database records.
            </p>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigate && (
              <button
                onClick={() => onNavigate('students')}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-300" />
                <span>Add Student</span>
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('fees')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Collect Fees</span>
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('notices')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Post Circular</span>
              </button>
            )}
          </div>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          subtitle="Enrolled Active Students"
          icon={GraduationCap}
          colorBg="bg-blue-50"
          colorIcon="text-blue-600"
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers || 0}
          subtitle="Faculty Members"
          icon={Users}
          colorBg="bg-indigo-50"
          colorIcon="text-indigo-600"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.todayAttendancePercentage || 0}%`}
          subtitle="Classroom Present Ratio"
          icon={CalendarCheck}
          colorBg="bg-emerald-50"
          colorIcon="text-emerald-600"
        />
        <StatCard
          title="Pending Fees"
          value={`₹${(stats.totalPendingFees || 0).toLocaleString('en-IN')}`}
          subtitle="Outstanding Fee Balance"
          icon={IndianRupee}
          colorBg="bg-amber-50"
          colorIcon="text-amber-600"
        />
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Enrollment Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Student Distribution by Class</h3>
              <p className="text-xs text-gray-500">Active student counts across grades</p>
            </div>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.studentDistributionByClass || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="className" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#0270c7" radius={[8, 8, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Attendance Trend */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Attendance Breakdown Trend</h3>
              <p className="text-xs text-gray-500">Daily attendance records past 7 days</p>
            </div>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.attendanceTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={3} name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fee & Exam Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Collection Overview */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Fee Collection Summary</h3>
              <p className="text-xs text-gray-500">Collected vs pending fees by category</p>
            </div>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.feeOverview || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="collected" fill="#10b981" name="Collected (₹)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending (₹)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic Exam Performance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Subject Exam Performance</h3>
              <p className="text-xs text-gray-500">School-wide average score % by subject</p>
            </div>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.examPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Average Score']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="averageMarks" fill="#6366f1" name="Average Marks %" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
