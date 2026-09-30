import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const { showToast } = useToast();

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'student123',
    classId: '',
    sectionId: '',
    admissionNo: '',
    rollNo: '',
    dob: '2011-05-10',
    gender: 'Male',
    fatherName: '',
    motherName: '',
    guardianPhone: '',
    address: 'Shri Dungargarh, Rajasthan',
  });

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, [search, selectedClass]);

  const fetchClasses = async () => {
    try {
      const data = await apiRequest('/classes');
      setClasses(data);
      if (data.length > 0 && !formData.classId) {
        setFormData((prev) => ({
          ...prev,
          classId: data[0].id,
          sectionId: data[0].sections[0]?.id || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let query = `?search=${encodeURIComponent(search)}`;
      if (selectedClass) query += `&classId=${selectedClass}`;
      const data = await apiRequest(`/students${query}`);
      setStudents(data);
    } catch (err: any) {
      showToast('error', 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/students', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      showToast('success', 'Student added successfully');
      setIsAddOpen(false);
      fetchStudents();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add student');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this student account?')) return;
    try {
      await apiRequest(`/students/${id}`, { method: 'DELETE' });
      showToast('success', 'Student account deactivated');
      fetchStudents();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to deactivate student');
    }
  };

  const openProfile = async (id: string) => {
    try {
      const data = await apiRequest(`/students/${id}`);
      setSelectedStudent(data);
      setIsViewOpen(true);
    } catch (err: any) {
      showToast('error', 'Failed to load student profile details');
    }
  };

  const activeClassObj = classes.find((c) => c.id === formData.classId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-600" />
            Student Roster Management
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage student admissions, profiles, roll numbers, and academic records for Jaipur Public School.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student by name, admission no, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="sm:w-64 relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none text-gray-700 font-medium"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading student directory...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700">No Students Found</h3>
            <p className="text-xs text-gray-400 mt-1">Try clearing filters or add a new student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Admission No</th>
                  <th className="p-4">Class & Sec</th>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Parent Info</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {student.user.avatarUrl ? (
                          <img
                            src={student.user.avatarUrl}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                            {student.user.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{student.user.name}</p>
                          <p className="text-xs text-gray-400">{student.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-brand-700 font-semibold">{student.admissionNo}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                        {student.class.name} - {student.section.name}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">{student.rollNo}</td>
                    <td className="p-4 text-xs">
                      <p className="font-semibold text-gray-800">{student.fatherName}</p>
                      <p className="text-gray-400">{student.guardianPhone}</p>
                    </td>
                    <td className="p-4">
                      {student.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openProfile(student.id)}
                        className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(student.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Student">
        <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Student Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="e.g. Aarav Sharma"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="aarav@jaipurpublic.edu.in"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => {
                  const cId = e.target.value;
                  const found = classes.find((c) => c.id === cId);
                  setFormData({
                    ...formData,
                    classId: cId,
                    sectionId: found?.sections[0]?.id || '',
                  });
                }}
                className="w-full p-2.5 border rounded-xl"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Section *</label>
              <select
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              >
                {activeClassObj?.sections?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Roll Number *</label>
              <input
                type="number"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="e.g. 1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Admission Number *</label>
              <input
                type="text"
                value={formData.admissionNo}
                onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="JPS-2026-0001"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Guardian Phone *</label>
              <input
                type="text"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                placeholder="+91 98290 00000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Father's Name *</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mother's Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            />
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
              Register Student
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Profile Modal */}
      {selectedStudent && (
        <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Student Comprehensive Profile">
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border">
              <div className="w-16 h-16 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {selectedStudent.user.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedStudent.user.name}</h3>
                <p className="text-gray-500 font-medium">
                  {selectedStudent.class?.name} - Section {selectedStudent.section?.name} | Roll #{selectedStudent.rollNo}
                </p>
                <p className="text-brand-700 font-mono text-[11px] font-semibold mt-0.5">
                  Admission No: {selectedStudent.admissionNo}
                </p>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-2 gap-4 bg-white p-4 border rounded-xl">
              <div>
                <span className="text-gray-400 block font-medium">Father's Name</span>
                <span className="font-bold text-gray-800">{selectedStudent.fatherName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Mother's Name</span>
                <span className="font-bold text-gray-800">{selectedStudent.motherName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Guardian Contact</span>
                <span className="font-bold text-gray-800">{selectedStudent.guardianPhone}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Email Address</span>
                <span className="font-bold text-gray-800">{selectedStudent.user.email}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block font-medium">Residential Address</span>
                <span className="font-bold text-gray-800">{selectedStudent.address}</span>
              </div>
            </div>

            {/* Attendance & Fee summary snippets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <p className="text-emerald-800 font-bold">Attendance Records</p>
                <p className="text-2xl font-extrabold text-emerald-950 mt-1">
                  {selectedStudent.attendances?.length || 0} Records Logged
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <p className="text-amber-800 font-bold">Fee Records</p>
                <p className="text-2xl font-extrabold text-amber-950 mt-1">
                  {selectedStudent.feeRecords?.length || 0} Bills Generated
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
