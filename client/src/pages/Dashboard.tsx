import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { RoleDashboardData, StudentDashboardData, ParentDashboardData, TeacherDashboardData, DashboardStats } from '@shared/types';
import { StudentDashboard } from '../components/dashboards/StudentDashboard';
import { ParentDashboard } from '../components/dashboards/ParentDashboard';
import { TeacherDashboard } from '../components/dashboards/TeacherDashboard';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DashboardPageProps {
  onNavigate?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<RoleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id, user?.role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<RoleDashboardData>('/dashboard');
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-11 w-11 border-4 border-brand-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-gray-500 tracking-wide">
          Loading {user?.role ? user.role.toLowerCase() : 'user'} dashboard...
        </p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="bg-white rounded-3xl p-8 lg:p-12 text-center border border-red-100 shadow-xs max-w-xl mx-auto my-12">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Dashboard Unavailable</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
          {error || 'Could not retrieve your role-specific dashboard metrics from the database.'}
        </p>
        <button
          onClick={fetchDashboardData}
          className="mt-6 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  // Render Role-Specific Dashboards
  if (dashboardData.role === 'STUDENT') {
    return <StudentDashboard data={dashboardData as StudentDashboardData} onNavigate={onNavigate} />;
  }

  if (dashboardData.role === 'PARENT') {
    return <ParentDashboard data={dashboardData as ParentDashboardData} onNavigate={onNavigate} />;
  }

  if (dashboardData.role === 'TEACHER') {
    return <TeacherDashboard data={dashboardData as TeacherDashboardData} onNavigate={onNavigate} />;
  }

  // Fallback / Admin Dashboard for SCHOOL_ADMIN and SUPER_ADMIN
  return (
    <AdminDashboard
      stats={dashboardData as unknown as DashboardStats}
      userName={user?.name}
      onNavigate={onNavigate}
    />
  );
};
