import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  FileText,
  Award,
  Clock,
  IndianRupee,
  Megaphone,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'] },
    { id: 'teachers', label: 'Teachers', icon: Users, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
    { id: 'classes', label: 'Classes & Sections', icon: Building2, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
    { id: 'subjects', label: 'Subjects Catalog', icon: BookOpen, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { id: 'homework', label: 'Homework', icon: FileText, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { id: 'results', label: 'Exams & Results', icon: Award, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { id: 'fees', label: 'Fees & Billing', icon: IndianRupee, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT'] },
    { id: 'notices', label: 'Notice Board', icon: Megaphone, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    { id: 'reports', label: 'Reports & Export', icon: BarChart3, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'] },
    { id: 'settings', label: 'School Settings', icon: Settings, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  ];

  const filteredNavItems = allNavItems.filter((item) => item.roles.includes(role));

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        ></div>
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b">
            <span className="font-bold text-gray-800">Menu</span>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-500 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </div>

          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold border-l-4 border-brand-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-800 p-3 text-white">
            <p className="text-xs font-semibold text-brand-200 uppercase tracking-wider">Academic Session</p>
            <p className="text-sm font-bold mt-0.5">2026 - 2027</p>
            <p className="text-[11px] text-brand-300 mt-1">Jaipur Public School v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};
