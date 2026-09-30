import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { Building2, Plus, Users, DoorOpen } from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const { showToast } = useToast();

  const [newClassName, setNewClassName] = useState('');
  const [newGrade, setNewGrade] = useState('11');
  const [newSecName, setNewSecName] = useState('C');
  const [newRoomNo, setNewRoomNo] = useState('Room 303');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await apiRequest('/classes');
      setClasses(data);
    } catch (err) {
      showToast('error', 'Failed to fetch class structure');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/classes', {
        method: 'POST',
        body: JSON.stringify({ name: newClassName, numericGrade: newGrade }),
      });
      showToast('success', 'Class created successfully');
      setIsAddClassOpen(false);
      setNewClassName('');
      fetchClasses();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create class');
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest(`/classes/${selectedClassId}/sections`, {
        method: 'POST',
        body: JSON.stringify({ name: newSecName, roomNo: newRoomNo }),
      });
      showToast('success', 'Section added successfully');
      setIsAddSectionOpen(false);
      fetchClasses();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add section');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-600" />
            Classes & Sections Setup
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Configure academic classes, section capacities, and room allocations for Jaipur Public School.
          </p>
        </div>
        <button
          onClick={() => setIsAddClassOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class</span>
        </button>
      </div>

      {/* Class Cards */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading academic classes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                  <p className="text-xs text-gray-400">Academic Year {cls.academicYear?.yearName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full font-bold text-xs">
                    {cls._count?.students || 0} Total Students
                  </span>
                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setIsAddSectionOpen(true);
                    }}
                    className="p-1.5 bg-gray-100 hover:bg-brand-50 hover:text-brand-600 rounded-lg text-gray-600 transition-colors"
                    title="Add Section"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sections list */}
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Sections</p>
                <div className="grid grid-cols-2 gap-3">
                  {cls.sections?.map((sec: any) => (
                    <div key={sec.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">Section {sec.name}</span>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <DoorOpen className="w-3 h-3 text-brand-600" /> {sec.roomNo || 'Unassigned'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-brand-700 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {sec._count?.students || 0}
                        </span>
                        <span className="text-[10px] text-gray-400">Cap: {sec.capacity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Class Modal */}
      <Modal isOpen={isAddClassOpen} onClose={() => setIsAddClassOpen(false)} title="Create New Class">
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Class Name *</label>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Class 11"
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Numeric Grade Level *</label>
            <input
              type="number"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddClassOpen(false)} className="px-4 py-2 border rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-md">
              Create Class
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal isOpen={isAddSectionOpen} onClose={() => setIsAddSectionOpen(false)} title="Add Section to Class">
        <form onSubmit={handleAddSection} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Section Name *</label>
            <input
              type="text"
              value={newSecName}
              onChange={(e) => setNewSecName(e.target.value)}
              placeholder="e.g. C"
              className="w-full p-2.5 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Room Allocation</label>
            <input
              type="text"
              value={newRoomNo}
              onChange={(e) => setNewRoomNo(e.target.value)}
              placeholder="e.g. Room 303"
              className="w-full p-2.5 border rounded-xl"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddSectionOpen(false)} className="px-4 py-2 border rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-md">
              Add Section
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
