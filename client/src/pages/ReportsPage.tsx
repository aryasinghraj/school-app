import React, { useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { BarChart3, Download, GraduationCap, CalendarCheck, IndianRupee } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('students');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchReport = async (type: string) => {
    setReportType(type);
    setLoading(true);
    try {
      const res = await apiRequest(`/reports/${type}`);
      setData(res);
    } catch (err) {
      showToast('error', 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      showToast('error', 'No data to export');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).map((v) => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JPS_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'CSV Report downloaded successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            Institutional Reports & CSV Export Center
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Generate and export comprehensive reports for students, attendance percentages, and fee collections.
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={data.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export as CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => fetchReport('students')}
          className={`p-5 rounded-2xl border flex items-center gap-4 transition-all text-left ${
            reportType === 'students'
              ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-500/20'
              : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Student Roster Report</h3>
            <p className="text-xs text-gray-500 mt-0.5">Admissions & parent contact directory</p>
          </div>
        </button>

        <button
          onClick={() => fetchReport('attendance')}
          className={`p-5 rounded-2xl border flex items-center gap-4 transition-all text-left ${
            reportType === 'attendance'
              ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-500/20'
              : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Attendance Summary Report</h3>
            <p className="text-xs text-gray-500 mt-0.5">Class attendance breakdown %</p>
          </div>
        </button>

        <button
          onClick={() => fetchReport('fees')}
          className={`p-5 rounded-2xl border flex items-center gap-4 transition-all text-left ${
            reportType === 'fees'
              ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-500/20'
              : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Fee Collection Ledger</h3>
            <p className="text-xs text-gray-500 mt-0.5">Paid vs pending fee records</p>
          </div>
        </button>
      </div>

      {/* Table Data Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Generating report data...</div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Click one of the report tabs above to generate data.</div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider sticky top-0 border-b">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="p-3">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="p-3 font-semibold text-gray-800">
                        {String(val)}
                      </td>
                    ))}
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
