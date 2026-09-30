import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Megaphone, Plus, Calendar, User, Trash2 } from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const isStaff = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'EVERYONE',
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const data = await apiRequest('/notices');
      setNotices(data);
    } catch (err) {
      showToast('error', 'Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/notices', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      showToast('success', 'Notice published successfully');
      setIsAddOpen(false);
      setFormData({ title: '', content: '', targetAudience: 'EVERYONE' });
      fetchNotices();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to publish notice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await apiRequest(`/notices/${id}`, { method: 'DELETE' });
      showToast('success', 'Notice deleted');
      fetchNotices();
    } catch (err) {
      showToast('error', 'Failed to delete notice');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-brand-600" />
            School Notices & Circulars
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Official announcements, parent-teacher meeting circulars, and sports event notices for Jaipur Public School.
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="p-12 text-center text-gray-400">No active announcements.</div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs relative">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  Target: {notice.targetAudience}
                </span>
                {isStaff && (
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mt-3">{notice.title}</h3>
              <p className="text-xs text-gray-700 mt-2 leading-relaxed whitespace-pre-line">{notice.content}</p>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand-600" /> Posted by {notice.author?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" /> {new Date(notice.publishedAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Publish Notice">
        <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Notice Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Parent-Teacher Meeting Notice"
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Notice Audience *</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            >
              <option value="EVERYONE">Everyone (Public Announcement)</option>
              <option value="TEACHERS">Teachers Only</option>
              <option value="STUDENTS">Students Only</option>
              <option value="PARENTS">Parents Only</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Notice Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="w-full p-2.5 border rounded-xl"
              placeholder="Enter announcement details..."
              required
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-md">
              Publish Circular
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
