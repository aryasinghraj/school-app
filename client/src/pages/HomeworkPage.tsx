import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { FileText, Plus, Calendar, BookOpen, Clock, Trash2 } from 'lucide-react';

export const HomeworkPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const isStaff = user?.role === 'TEACHER' || user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchHomeworks();
    if (isStaff) {
      fetchClassesAndSubjects();
    }
  }, []);

  const fetchHomeworks = async () => {
    try {
      const data = await apiRequest('/homework');
      setHomeworks(data);
    } catch (err) {
      showToast('error', 'Failed to fetch homework list');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSubjects = async () => {
    try {
      const [classList, subjectList] = await Promise.all([apiRequest('/classes'), apiRequest('/subjects')]);
      setClasses(classList);
      setSubjects(subjectList);
      if (classList.length > 0 && subjectList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          classId: classList[0].id,
          sectionId: classList[0].sections[0]?.id || '',
          subjectId: subjectList[0].id,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/homework', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      showToast('success', 'Homework published successfully');
      setIsAddOpen(false);
      setFormData({
        classId: classes[0]?.id || '',
        sectionId: classes[0]?.sections[0]?.id || '',
        subjectId: subjects[0]?.id || '',
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      });
      fetchHomeworks();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to publish homework');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this homework assignment?')) return;
    try {
      await apiRequest(`/homework/${id}`, { method: 'DELETE' });
      showToast('success', 'Homework deleted');
      fetchHomeworks();
    } catch (err: any) {
      showToast('error', 'Failed to delete homework');
    }
  };

  const activeClassObj = classes.find((c) => c.id === formData.classId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            Classroom Homework & Assignments
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Publish, track, and review homework assignments for Jaipur Public School students.
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Homework</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading homework assignments...</div>
      ) : homeworks.length === 0 ? (
        <div className="p-12 text-center text-gray-400">No active homework assignments found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {homeworks.map((hw) => (
            <div
              key={hw.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {hw.subject.name}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {hw.class.name} - {hw.section.name}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mt-3">{hw.title}</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {hw.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5" /> Due Date: {new Date(hw.dueDate).toLocaleDateString('en-IN')}
                </div>
                {isStaff && (
                  <button
                    onClick={() => handleDelete(hw.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Homework Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Assign New Homework">
        <form onSubmit={handleCreateHomework} className="space-y-4 text-xs">
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
              <label className="block font-semibold text-gray-700 mb-1">Subject *</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Chapter 4 Exercise 4.2"
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Assignment Instructions / Details *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full p-2.5 border rounded-xl"
              placeholder="Provide problem numbers, guidelines, or essay prompts..."
              required
            ></textarea>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Submission Due Date *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-xl font-medium">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white rounded-xl font-bold shadow-md hover:bg-brand-700">
              Publish Homework
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
