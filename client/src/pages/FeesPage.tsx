import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { IndianRupee, Plus, CreditCard, Receipt, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const FeesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const isStaff = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  // Payment Form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payRef, setPayRef] = useState('');

  // Add Fee Record Form
  const [addForm, setAddForm] = useState({
    studentId: '',
    feeCategoryId: '',
    totalAmount: '12000',
    discountAmount: '0',
    fineAmount: '0',
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchFeeRecords();
    if (isStaff) {
      fetchCategoriesAndStudents();
    }
  }, []);

  const fetchFeeRecords = async () => {
    try {
      const data = await apiRequest('/fees/records');
      setRecords(data);
    } catch (err) {
      showToast('error', 'Failed to fetch fee records');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndStudents = async () => {
    try {
      const [catList, studentList] = await Promise.all([apiRequest('/fees/categories'), apiRequest('/students')]);
      setCategories(catList);
      setStudents(studentList);
      if (studentList.length > 0 && catList.length > 0) {
        setAddForm((prev) => ({
          ...prev,
          studentId: studentList[0].id,
          feeCategoryId: catList[0].id,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/fees/records', {
        method: 'POST',
        body: JSON.stringify(addForm),
      });
      showToast('success', 'Fee bill generated successfully');
      setIsAddOpen(false);
      fetchFeeRecords();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to generate fee record');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const res = await apiRequest('/fees/pay', {
        method: 'POST',
        body: JSON.stringify({
          feeRecordId: selectedRecord.id,
          amountPaid: Number(payAmount),
          paymentMethod: payMethod,
          transactionRef: payRef || `PAY-${Date.now()}`,
        }),
      });

      showToast('success', 'Payment recorded successfully!');
      setReceiptData(res.receipt);
      setIsPayOpen(false);
      setPayAmount('');
      setPayRef('');
      fetchFeeRecords();
    } catch (err: any) {
      showToast('error', err.message || 'Payment recording failed');
    }
  };

  const openPayModal = (rec: any) => {
    setSelectedRecord(rec);
    setPayAmount(String(rec.dueAmount));
    setIsPayOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-brand-600" />
            Fees Management & Payment Ledger
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Track student fee structures, tuition bills, payments, and print transaction receipts for Jaipur Public School.
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Fee Bill</span>
          </button>
        )}
      </div>

      {/* Fee Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading fee ledger...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No fee records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Net Bill</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Due Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{rec.student?.user?.name}</p>
                      <p className="text-xs text-gray-400">
                        {rec.student?.class?.name}-{rec.student?.section?.name} | {rec.student?.admissionNo}
                      </p>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{rec.feeCategory?.name}</td>
                    <td className="p-4 font-bold text-gray-900">₹{rec.netAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-bold text-emerald-700">₹{rec.paidAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-extrabold text-amber-700">₹{rec.dueAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      {rec.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : rec.status === 'PARTIAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {rec.dueAmount > 0 ? (
                        <button
                          onClick={() => openPayModal(rec)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Record Payment
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedRecord && (
        <Modal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} title="Record Fee Payment">
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-xl border text-gray-800">
              <p className="font-bold text-sm">{selectedRecord.student?.user?.name}</p>
              <p className="text-xs text-gray-500">{selectedRecord.feeCategory?.name} | Outstanding Due: ₹{selectedRecord.dueAmount}</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Amount Paying (₹) *</label>
              <input
                type="number"
                max={selectedRecord.dueAmount}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full p-2.5 border rounded-xl font-bold text-sm"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Payment Method *</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full p-2.5 border rounded-xl font-medium"
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="Cash">Cash Counter</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Transaction Ref / Receipt No</label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. UPI/619283019283/JPS"
                className="w-full p-2.5 border rounded-xl font-mono text-xs"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setIsPayOpen(false)} className="px-4 py-2 border rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-md">
                Confirm & Print Receipt
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Generated Receipt Popup */}
      {receiptData && (
        <Modal isOpen={!!receiptData} onClose={() => setReceiptData(null)} title="Official Payment Receipt">
          <div className="p-6 bg-white border rounded-xl space-y-4 text-xs font-sans">
            <div className="text-center pb-4 border-b">
              <h3 className="text-lg font-black text-gray-900">JAIPUR PUBLIC SCHOOL</h3>
              <p className="text-gray-500">Shri Dungargarh, Rajasthan • Fee Payment Receipt</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-gray-700">
              <div><span className="text-gray-400 block">Receipt No:</span><span className="font-mono font-bold">{receiptData.receiptNo}</span></div>
              <div><span className="text-gray-400 block">Date:</span><span className="font-bold">{new Date(receiptData.date).toLocaleDateString('en-IN')}</span></div>
              <div><span className="text-gray-400 block">Student:</span><span className="font-bold">{receiptData.studentName}</span></div>
              <div><span className="text-gray-400 block">Fee Category:</span><span className="font-bold">{receiptData.feeCategory}</span></div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
              <p className="text-emerald-800 font-medium">Amount Paid</p>
              <p className="text-2xl font-black text-emerald-950">₹{receiptData.amountPaid.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-emerald-700 mt-1">Paid via {receiptData.paymentMethod}</p>
            </div>

            <div className="text-center pt-2">
              <button onClick={() => window.print()} className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl">
                Print Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Fee Bill Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Generate Fee Bill">
        <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Select Student *</label>
            <select
              value={addForm.studentId}
              onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.name} ({s.admissionNo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Fee Category *</label>
            <select
              value={addForm.feeCategoryId}
              onChange={(e) => setAddForm({ ...addForm, feeCategoryId: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Total Fee Amount (₹) *</label>
              <input
                type="number"
                value={addForm.totalAmount}
                onChange={(e) => setAddForm({ ...addForm, totalAmount: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={addForm.dueDate}
                onChange={(e) => setAddForm({ ...addForm, dueDate: e.target.value })}
                className="w-full p-2.5 border rounded-xl"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-md">
              Create Fee Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
