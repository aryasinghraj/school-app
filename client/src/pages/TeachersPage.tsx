import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { Users, Plus, Mail, Phone, BookOpen, Award, CheckCircle } from 'lucide-react';

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'teacher123',
    teacherCode: '',
    phone: '',
    qualification: 'M.Sc., B.Ed.',
    mainSubject: 'Mathematics',
    gender: 'Male',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await apiRequest('/teachers');
      setTeachers(data);
    } catch (err) {
      showToast('error', 'Failed to fetch faculty list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/teachers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      showToast('success', 'Teacher registered successfully');
      setIsAddOpen(false);
      fetchTeachers();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to register teacher');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Faculty & Teacher Directory
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage teaching staff profiles, main subjects, and classroom assignments for Jaipur Public School.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading teacher directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  {teacher.user.avatarUrl ? (
                    <img
                      src={teacher.user.avatarUrl}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                      {teacher.user.name[0]}
                    </div>
                  )}
                  <div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-mono text-[10px] font-bold">
                      {teacher.teacherCode}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-1">{teacher.user.name}</h3>
                    <p className="text-xs text-brand-700 font-semibold">{teacher.mainSubject} Teacher</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{teacher.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{teacher.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{teacher.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Active Faculty
                </span>
                <span className="text-gray-400 font-medium">
                  Joined {new Date(teacher.joiningDate).getFullYear()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Teacher Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Faculty Member">
        <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Teacher Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="e.g. Rajesh Sharma"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="teacher@jaipurpublic.edu.in"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Teacher Code *</label>
              <input
                type="text"
                value={formData.teacherCode}
                onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="TCH-004"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Main Subject *</label>
              <input
                type="text"
                value={formData.mainSubject}
                onChange={(e) => setFormData({ ...formData, mainSubject: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="Mathematics / Physics"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Qualifications</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="+91 98290 00000"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 text-white rounded-xl font-bold shadow-md hover:bg-brand-700"
            >
              Register Teacher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
