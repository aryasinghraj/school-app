import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { BookOpen, Plus, Code, FileText } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Core',
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await apiRequest('/subjects');
      setSubjects(data);
    } catch (err) {
      showToast('error', 'Failed to fetch subjects catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/subjects', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      showToast('success', 'Subject created successfully');
      setIsAddOpen(false);
      setFormData({ name: '', code: '', type: 'Core' });
      fetchSubjects();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create subject');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-600" />
            Academic Subjects Catalog
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage course catalog, core subjects, and electives taught at Jaipur Public School.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading subjects catalog...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-md font-mono text-[10px] font-bold">
                  {sub.code}
                </span>
                <h3 className="font-bold text-gray-900 text-base mt-1">{sub.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{sub.type} Curriculum</p>
              </div>
              <div className="p-3 bg-gray-50 text-brand-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Subject Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Computer Science"
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Subject Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. CS-01"
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Subject Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            >
              <option value="Core">Core Subject</option>
              <option value="Elective">Elective</option>
              <option value="Activity">Co-Curricular Activity</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-md">
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
