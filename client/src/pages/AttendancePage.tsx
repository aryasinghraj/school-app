import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, Check, X, Clock, AlertTriangle, Save } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; remarks: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Student & Parent role specific state
  const [mySummary, setMySummary] = useState<any | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<any[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'STUDENT' && user.studentId) {
      fetchMyAttendanceSummary(user.studentId);
    } else if (user?.role === 'PARENT') {
      fetchParentChildren();
    } else {
      fetchClasses();
    }
  }, []);

  const fetchParentChildren = async () => {
    try {
      const childrenList = await apiRequest<any[]>('/students');
      setLinkedChildren(childrenList);
      if (childrenList.length > 0) {
        const firstId = childrenList[0].id;
        setActiveChildId(firstId);
        fetchMyAttendanceSummary(firstId);
      }
    } catch (err) {
      showToast('error', 'Failed to load children records');
    }
  };

  const handleChildSelect = (childId: string) => {
    setActiveChildId(childId);
    fetchMyAttendanceSummary(childId);
  };

  useEffect(() => {
    if (selectedClassId && selectedSectionId) {
      fetchClassStudentsAndAttendance();
    }
  }, [selectedClassId, selectedSectionId, selectedDate]);

  const fetchMyAttendanceSummary = async (studentId: string) => {
    try {
      const summary = await apiRequest(`/attendance/summary/student/${studentId}`);
      setMySummary(summary);
    } catch (err) {
      showToast('error', 'Failed to fetch attendance summary');
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await apiRequest('/classes');
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(data[0].id);
        if (data[0].sections?.length > 0) {
          setSelectedSectionId(data[0].sections[0].id);
        }
      }
    } catch (err) {
      showToast('error', 'Failed to fetch classes');
    }
  };

  const fetchClassStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      const [studentList, existingAttendance] = await Promise.all([
        apiRequest(`/students?classId=${selectedClassId}&sectionId=${selectedSectionId}`),
        apiRequest(`/attendance?classId=${selectedClassId}&sectionId=${selectedSectionId}&date=${selectedDate}`),
      ]);

      setStudents(studentList);

      const map: Record<string, { status: string; remarks: string }> = {};
      studentList.forEach((s: any) => {
        const found = existingAttendance.find((a: any) => a.studentId === s.id);
        map[s.id] = {
          status: found ? found.status : 'PRESENT',
          remarks: found?.remarks || '',
        };
      });
      setAttendanceMap(map);
    } catch (err) {
      showToast('error', 'Failed to load attendance sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks,
      }));

      await apiRequest('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassId,
          sectionId: selectedSectionId,
          date: selectedDate,
          records,
        }),
      });

      showToast('success', 'Attendance records updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const activeClass = classes.find((c) => c.id === selectedClassId);

  if (user?.role === 'STUDENT' || user?.role === 'PARENT') {
    const isParent = user?.role === 'PARENT';
    const activeChildObj = linkedChildren.find((c) => c.id === activeChildId);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-brand-600" />
              {isParent ? `${activeChildObj?.user?.name || 'Child'}'s Attendance Record` : 'My Attendance Report'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isParent
                ? `Verified presence log for ${activeChildObj?.class?.name || ''} - Section ${activeChildObj?.section?.name || ''}`
                : 'Daily classroom presence and absence history'}
            </p>
          </div>

          {/* Parent Ward Selector */}
          {isParent && linkedChildren.length > 1 && (
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl self-start md:self-auto">
              {linkedChildren.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleChildSelect(c.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeChildId === c.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {c.user?.name} ({c.class?.name})
                </button>
              ))}
            </div>
          )}
        </div>

        {mySummary && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center shadow-2xs">
                <span className="text-xs text-emerald-800 font-semibold block">Attendance Ratio</span>
                <span className="text-3xl font-extrabold text-emerald-950 mt-1 block">{mySummary.percentage}%</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl text-center shadow-2xs">
                <span className="text-xs text-blue-800 font-semibold block">Days Present</span>
                <span className="text-3xl font-extrabold text-blue-950 mt-1 block">{mySummary.presentDays}</span>
              </div>
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl text-center shadow-2xs">
                <span className="text-xs text-red-800 font-semibold block">Days Absent</span>
                <span className="text-3xl font-extrabold text-red-950 mt-1 block">{mySummary.absentDays}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center shadow-2xs">
                <span className="text-xs text-amber-800 font-semibold block">Leave Taken</span>
                <span className="text-3xl font-extrabold text-amber-950 mt-1 block">{mySummary.leaveDays}</span>
              </div>
            </div>

            {/* Attendance Records Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-sm text-gray-800">Attendance Log History</h3>
              </div>
              {!mySummary.records || mySummary.records.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No attendance records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b">
                      <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {mySummary.records.map((r: any) => {
                        const dStr = new Date(r.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        });
                        return (
                          <tr key={r.id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-bold text-gray-900">{dStr}</td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                                  r.status === 'PRESENT'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.status === 'LATE'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-gray-500">{r.remarks || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-brand-600" />
            Daily Classroom Attendance Sheet
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Mark and update student attendance status (Present, Absent, Late, Leave) for Jaipur Public School.
          </p>
        </div>
        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
        </button>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Class *</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              const cId = e.target.value;
              setSelectedClassId(cId);
              const found = classes.find((c) => c.id === cId);
              if (found && found.sections?.length > 0) {
                setSelectedSectionId(found.sections[0].id);
              }
            }}
            className="w-full p-2.5 border rounded-xl font-medium"
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
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="w-full p-2.5 border rounded-xl font-medium"
          >
            {activeClass?.sections?.map((s: any) => (
              <option key={s.id} value={s.id}>
                Section {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Attendance Date *</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2.5 border rounded-xl font-medium"
          />
        </div>
      </div>

      {/* Sheet Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading student sheet...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No students registered in this class & section.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Roll</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Admission No</th>
                  <th className="p-4 text-center">Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {students.map((student) => {
                  const currentStatus = attendanceMap[student.id]?.status || 'PRESENT';
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-bold text-gray-900">{student.rollNo}</td>
                      <td className="p-4 font-semibold text-gray-800">{student.user.name}</td>
                      <td className="p-4 font-mono text-xs text-gray-500">{student.admissionNo}</td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" /> Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'ABSENT'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" /> Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'LEAVE')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'LEAVE'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Leave
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
