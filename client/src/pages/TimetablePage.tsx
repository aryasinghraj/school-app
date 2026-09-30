import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Clock, BookOpen, User } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSectionId) {
      fetchTimetable();
    }
  }, [selectedClassId, selectedSectionId]);

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
      showToast('error', 'Failed to load classes');
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let query = `?classId=${selectedClassId}&sectionId=${selectedSectionId}`;
      const data = await apiRequest(`/timetable${query}`);
      setTimetable(data);
    } catch (err) {
      showToast('error', 'Failed to fetch weekly timetable');
    } finally {
      setLoading(false);
    }
  };

  const activeClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-600" />
            Classroom Weekly Timetable
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Weekly subject period schedule and assigned teachers for Jaipur Public School.
          </p>
        </div>
      </div>

      {/* Selector Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs text-xs">
        <div>
          <label className="font-bold text-gray-700 mr-2">Class:</label>
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
            className="p-2 bg-gray-50 border rounded-xl font-semibold"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-gray-700 mr-2">Section:</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="p-2 bg-gray-50 border rounded-xl font-semibold"
          >
            {activeClass?.sections?.map((s: any) => (
              <option key={s.id} value={s.id}>
                Section {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Timetable Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading weekly timetable...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-brand-900 text-white font-semibold">
                  <th className="p-3 border-b border-brand-800 w-28">Day / Period</th>
                  {periods.map((p) => (
                    <th key={p} className="p-3 border-b border-brand-800 text-center">
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-900 bg-gray-50/80 border-r">{day}</td>
                    {periods.map((p) => {
                      const slot = timetable.find((t) => t.dayOfWeek === day && t.periodNo === p);
                      return (
                        <td key={p} className="p-2 border-r border-gray-100 text-center">
                          {slot ? (
                            <div className="p-2 bg-brand-50/80 rounded-xl border border-brand-100">
                              <p className="font-bold text-brand-900 text-xs">{slot.subject?.name}</p>
                              <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                                <User className="w-3 h-3 text-brand-600" /> {slot.teacher?.user?.name}
                              </p>
                              <span className="text-[9px] font-mono text-gray-400 mt-1 block">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300 font-light text-[11px]">- Free -</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
