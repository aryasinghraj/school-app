import React from 'react';
import { Printer } from 'lucide-react';

interface ReportCardData {
  student: {
    user: { name: string };
    admissionNo: string;
    rollNo: number;
    fatherName: string;
    class: { name: string };
    section: { name: string };
    school: { name: string; location: string; logoUrl?: string };
  };
  exam: {
    name: string;
    academicYear: { yearName: string };
  };
  marks: Array<{
    subjectName: string;
    subjectCode: string;
    maxMarks: number;
    passMarks: number;
    obtainedMarks: number;
    grade: string;
    remarks?: string;
  }>;
  summary: {
    totalMax: number;
    totalObtained: number;
    percentage: number;
    overallGrade: string;
    status: string;
  };
}

export const ReportCardPrint: React.FC<{ data: ReportCardData }> = ({ data }) => {
  const { student, exam, marks, summary } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex justify-end mb-4 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Download PDF Report Card</span>
        </button>
      </div>

      <div id="printable-report-card" className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-4xl mx-auto font-sans">
        {/* Header */}
        <div className="text-center pb-6 border-b-2 border-brand-600">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-14 h-14 bg-brand-700 text-white font-extrabold text-2xl rounded-2xl flex items-center justify-center shadow-md">
              JPS
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                {student.school.name}
              </h2>
              <p className="text-xs font-semibold text-gray-600">
                {student.school.location} • Affiliated Academic Institute
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Session {exam.academicYear.yearName}</p>
            </div>
          </div>
          <div className="mt-3 inline-block px-6 py-1 bg-brand-50 text-brand-800 font-bold text-sm rounded-full border border-brand-200 uppercase tracking-wide">
            {exam.name} - Progress Report Card
          </div>
        </div>

        {/* Student Information Grid */}
        <div className="my-6 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
          <div>
            <span className="text-gray-500 block font-medium">Student Name:</span>
            <span className="font-bold text-gray-900 text-sm">{student.user.name}</span>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Admission No:</span>
            <span className="font-bold text-gray-900 text-sm">{student.admissionNo}</span>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Class & Section:</span>
            <span className="font-bold text-gray-900 text-sm">{student.class.name} - {student.section.name}</span>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Roll Number:</span>
            <span className="font-bold text-gray-900 text-sm">{student.rollNo}</span>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Father's Name:</span>
            <span className="font-bold text-gray-900 text-sm">{student.fatherName}</span>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Result Status:</span>
            <span className={`font-bold text-sm ${summary.status === 'PASSED' ? 'text-emerald-700' : 'text-red-700'}`}>
              {summary.status}
            </span>
          </div>
        </div>

        {/* Marks Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-900 text-white font-semibold">
              <tr>
                <th className="p-3">Subject Name</th>
                <th className="p-3">Code</th>
                <th className="p-3 text-center">Max Marks</th>
                <th className="p-3 text-center">Pass Marks</th>
                <th className="p-3 text-center">Marks Obtained</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium">
              {marks.map((m, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="p-3 font-semibold text-gray-900">{m.subjectName}</td>
                  <td className="p-3 text-gray-500">{m.subjectCode}</td>
                  <td className="p-3 text-center text-gray-600">{m.maxMarks}</td>
                  <td className="p-3 text-center text-gray-600">{m.passMarks}</td>
                  <td className="p-3 text-center font-bold text-gray-900">{m.obtainedMarks}</td>
                  <td className="p-3 text-center font-bold text-brand-700">{m.grade}</td>
                  <td className="p-3 text-gray-500 text-[11px]">{m.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-brand-50 border border-brand-200 text-center mb-8">
          <div>
            <span className="text-xs text-brand-800 font-medium block">Total Marks</span>
            <span className="text-lg font-bold text-brand-950">{summary.totalObtained} / {summary.totalMax}</span>
          </div>
          <div>
            <span className="text-xs text-brand-800 font-medium block">Percentage</span>
            <span className="text-lg font-bold text-brand-950">{summary.percentage}%</span>
          </div>
          <div>
            <span className="text-xs text-brand-800 font-medium block">Overall Grade</span>
            <span className="text-lg font-bold text-brand-950">{summary.overallGrade}</span>
          </div>
          <div>
            <span className="text-xs text-brand-800 font-medium block">Final Outcome</span>
            <span className={`text-lg font-extrabold ${summary.status === 'PASSED' ? 'text-emerald-700' : 'text-red-700'}`}>
              {summary.status}
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex items-end justify-between pt-12 text-xs text-gray-600 border-t border-gray-200">
          <div className="text-center">
            <div className="w-36 border-b border-gray-400 mb-1"></div>
            <p className="font-semibold text-gray-800">Class Teacher Signature</p>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-gray-400 mb-1"></div>
            <p className="font-semibold text-gray-800">Exam Incharge</p>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-gray-400 mb-1"></div>
            <p className="font-semibold text-gray-800">Principal Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};
