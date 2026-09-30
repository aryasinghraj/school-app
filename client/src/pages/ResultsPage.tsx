import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { ReportCardPrint } from '../components/ReportCardPrint';
import { Award, Plus, Printer, CheckCircle, Save, FileSpreadsheet } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Printable Report Card
  const [reportCardData, setReportCardData] = useState<any | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Modal State for Marks Entry
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [entryExamSubjectId, setEntryExamSubjectId] = useState('');
  const [entryClassId, setEntryClassId] = useState('');
  const [entrySectionId, setEntrySectionId] = useState('');
  const [entryStudents, setEntryStudents] = useState<any[]>([]);
  const [entryMarksMap, setEntryMarksMap] = useState<Record<string, number>>({});

  const isStaff = user?.role === 'TEACHER' || user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchMarks(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const data = await apiRequest('/exams');
      setExams(data);
      if (data.length > 0) {
        setSelectedExamId(data[0].id);
      }
    } catch (err) {
      showToast('error', 'Failed to fetch exam schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async (examId: string) => {
    try {
      let query = `?examId=${examId}`;
      if (user?.role === 'STUDENT' && user.studentId) {
        query += `&studentId=${user.studentId}`;
      }
      const data = await apiRequest(`/results${query}`);
      setMarks(data);
    } catch (err) {
      showToast('error', 'Failed to fetch exam results');
    }
  };

  const openReportCard = async (studentId: string, examId: string) => {
    try {
      const data = await apiRequest(`/results/report-card/${studentId}/${examId}`);
      setReportCardData(data);
      setIsReportOpen(true);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to generate report card');
    }
  };

  const activeExam = exams.find((e) => e.id === selectedExamId);

  const handleOpenMarksEntry = async (examSubjectId: string, classId: string) => {
    try {
      setEntryExamSubjectId(examSubjectId);
      setEntryClassId(classId);
      // Fetch students for class
      const studentList = await apiRequest(`/students?classId=${classId}`);
      setEntryStudents(studentList);

      // Pre-fill existing marks
      const map: Record<string, number> = {};
      studentList.forEach((s: any) => {
        const existing = marks.find((m) => m.studentId === s.id && m.examSubjectId === examSubjectId);
        map[s.id] = existing ? existing.obtainedMarks : 85;
      });
      setEntryMarksMap(map);
      setIsEntryOpen(true);
    } catch (err) {
      showToast('error', 'Failed to prepare marks entry matrix');
    }
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const marksList = Object.entries(entryMarksMap).map(([studentId, obtainedMarks]) => ({
        studentId,
        obtainedMarks,
      }));

      await apiRequest('/results', {
        method: 'POST',
        body: JSON.stringify({
          examSubjectId: entryExamSubjectId,
          marksList,
        }),
      });

      showToast('success', 'Exam marks submitted successfully!');
      setIsEntryOpen(false);
      fetchMarks(selectedExamId);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save marks');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-brand-600" />
            Exams, Marks & Report Cards
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Exam schedules, subject score entry, grade evaluations, and official printable report cards for Jaipur Public School.
          </p>
        </div>
      </div>

      {/* Exam Selector Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs text-xs">
        <label className="font-bold text-gray-700">Select Examination Session:</label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-brand-800 text-sm focus:outline-none"
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name} ({exam.examType})
            </option>
          ))}
        </select>
      </div>

      {/* Staff Scheduled Subjects Matrix */}
      {isStaff && activeExam && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">Scheduled Exam Subjects for Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeExam.examSubjects?.map((es: any) => (
              <div key={es.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block text-sm">{es.subject?.name}</span>
                  <span className="text-gray-500 font-medium">Class: {es.class?.name} | Max Marks: {es.maxMarks}</span>
                </div>
                <button
                  onClick={() => handleOpenMarksEntry(es.id, es.classId)}
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Marks
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Exam Score Records</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading exam results...</div>
        ) : marks.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No marks recorded yet for this examination.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-center">Grade</th>
                  <th className="p-4">Remarks</th>
                  <th className="p-4 text-right">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {marks.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">{m.student?.user?.name}</td>
                    <td className="p-4 text-gray-700 font-semibold">{m.examSubject?.subject?.name}</td>
                    <td className="p-4 text-center font-extrabold text-brand-900">
                      {m.obtainedMarks} / {m.examSubject?.maxMarks}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
                        {m.grade}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{m.remarks || 'Satisfactory'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openReportCard(m.studentId, selectedExamId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> Report Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Marks Entry Modal */}
      <Modal isOpen={isEntryOpen} onClose={() => setIsEntryOpen(false)} title="Enter Student Subject Marks">
        <form onSubmit={handleSaveMarks} className="space-y-4 text-xs">
          <p className="text-gray-500 font-medium">Enter obtained scores out of maximum marks.</p>

          <div className="max-h-60 overflow-y-auto space-y-2 border rounded-xl p-3">
            {entryStudents.map((st) => (
              <div key={st.id} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border">
                <div>
                  <span className="font-bold text-gray-900 block">{st.user.name}</span>
                  <span className="text-gray-400 font-mono text-[10px]">Roll #{st.rollNo} | {st.admissionNo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    max={100}
                    min={0}
                    value={entryMarksMap[st.id] ?? ''}
                    onChange={(e) => setEntryMarksMap({ ...entryMarksMap, [st.id]: Number(e.target.value) })}
                    className="w-20 p-2 border rounded-lg font-bold text-center text-sm"
                    required
                  />
                  <span className="text-gray-400 font-semibold">/ 100</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsEntryOpen(false)} className="px-4 py-2 border rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-md">
              Submit Marks
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Report Card Modal */}
      {reportCardData && (
        <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Student Official Report Card" maxWidth="max-w-4xl">
          <ReportCardPrint data={reportCardData} />
        </Modal>
      )}
    </div>
  );
};
