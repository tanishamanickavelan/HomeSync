import React, { useState, useEffect, useCallback } from 'react';
import { billsAPI } from '../services/api';
import Modal from '../components/common/Modal';
import { Badge, EmptyState, Spinner, Toast } from '../components/common/index';
import useToast from '../hooks/useToast';
import { PlusIcon, TrashIcon, CreditCardIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format, isPast, differenceInDays } from 'date-fns';

const BILL_CATEGORIES = ['electricity', 'water', 'internet', 'phone', 'gas', 'rent', 'insurance', 'emi', 'subscription', 'other'];
const CAT_ICONS = { electricity: '⚡', water: '💧', internet: '🌐', phone: '📱', gas: '🔥', rent: '🏠', insurance: '🛡️', emi: '🏦', subscription: '📺', other: '💳' };

const BillForm = ({ bill, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    bill_name: bill?.bill_name || '',
    amount: bill?.amount || '',
    due_date: bill?.due_date ? bill.due_date.split('T')[0] : '',
    category: bill?.category || 'other',
    status: bill?.status || 'unpaid',
    recurring: bill?.recurring || false,
    recurring_cycle: bill?.recurring_cycle || 'monthly',
    notes: bill?.notes || '',
  });
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? +e.target.value : e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Bill Name *</label>
          <input name="bill_name" value={form.bill_name} onChange={handleChange} className="input" placeholder="e.g. TNEB Electricity" required />
        </div>
        <div>
          <label className="label">Amount (₹) *</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className="input" placeholder="0" min="0" required />
        </div>
        <div>
          <label className="label">Due Date *</label>
          <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input">
            {BILL_CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
          </select>
        </div>
        {bill && (
          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input">
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" name="recurring" checked={form.recurring} onChange={handleChange}
          className="w-4 h-4 rounded bg-slate-700 border-slate-500 text-teal-500" />
        <label className="text-sm text-slate-300">Recurring bill</label>
        {form.recurring && (
          <select name="recurring_cycle" value={form.recurring_cycle} onChange={handleChange} className="input !w-auto text-sm py-1">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        )}
      </div>
      <div>
        <label className="label">Notes</label>
        <input name="notes" value={form.notes} onChange={handleChange} className="input" placeholder="Optional..." />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">{bill ? 'Update Bill' : 'Add Bill'}</button>
      </div>
    </form>
  );
};

const BillCard = ({ bill, onEdit, onDelete, onMarkPaid }) => {
  const daysLeft = differenceInDays(new Date(bill.due_date), new Date());
  const isOverdueStatus = bill.status === 'overdue' || (bill.status !== 'paid' && isPast(new Date(bill.due_date)));

  return (
    <div className={`card-hover group animate-in ${bill.status === 'paid' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{CAT_ICONS[bill.category] || '💳'}</div>
          <div>
            <p className="font-medium text-slate-100 text-sm">{bill.bill_name}</p>
            <div className="flex flex-wrap gap-2 mt-1.5 items-center">
              <Badge label={bill.status} variant={bill.status} />
              {bill.recurring && <span className="text-xs text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">🔄 {bill.recurring_cycle}</span>}
            </div>
            <p className={`text-xs mt-1 flex items-center gap-1 ${isOverdueStatus ? 'text-red-400' : daysLeft <= 3 ? 'text-orange-400' : 'text-slate-400'}`}>
              📅 {format(new Date(bill.due_date), 'MMM d, yyyy')}
              {bill.status !== 'paid' && daysLeft >= 0 && <span>· {daysLeft}d left</span>}
              {isOverdueStatus && bill.status !== 'paid' && <span className="font-medium"> · OVERDUE</span>}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-display font-bold text-white">₹{bill.amount.toLocaleString('en-IN')}</p>
          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all justify-end">
            {bill.status !== 'paid' && (
              <button onClick={() => onMarkPaid(bill.id)} title="Mark paid"
                className="p-1.5 bg-green-500/15 hover:bg-green-500/25 rounded-lg text-green-400 transition-all">
                <CheckCircleIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => onEdit(bill)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all">
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(bill.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all">
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillsPage = () => {
  const { toast, showToast, hideToast } = useToast();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({});

  const fetchBills = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const [bRes, sRes] = await Promise.all([billsAPI.getAll(params), billsAPI.getStats()]);
      setBills(bRes.data.bills);
      setStats(sRes.data.stats);
    } catch { showToast('Failed to load bills', 'error'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleSubmit = async (data) => {
    try {
      if (editBill) { await billsAPI.update(editBill.id, data); showToast('Bill updated!', 'success'); }
      else { await billsAPI.create(data); showToast('Bill added!', 'success'); }
      setModalOpen(false); setEditBill(null); fetchBills();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error'); }
  };

  const handleMarkPaid = async (id) => {
    console.log('Bill ID received:', id);
    try { await billsAPI.update(id, { status: 'paid' }); showToast('Bill marked as paid! ✅', 'success'); fetchBills(); }
    catch { showToast('Failed to update', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try { await billsAPI.delete(id); showToast('Bill deleted', 'info'); fetchBills(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  return (
    <div className="space-y-5 animate-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Bill Reminders</h1>
          <p className="text-slate-400 text-sm mt-0.5">Finance tracking · Finance Agent</p>
        </div>
        <button onClick={() => { setEditBill(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Bill
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-orange-400">{stats.unpaid || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Unpaid</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-red-400">{stats.overdue || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Overdue</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-green-400">{stats.paid || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Paid</p>
        </div>
        <div className="card">
          <p className="text-xl font-display font-bold text-white">₹{(stats.totalUnpaidAmount || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-1">Total Due</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'unpaid', 'overdue', 'paid'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize
              ${filterStatus === s ? 'bg-teal-500/15 border-teal-500/30 text-teal-400' : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Spinner size="lg" /></div>
      ) : bills.length === 0 ? (
        <EmptyState icon={CreditCardIcon} title="No bills found" description="Track your household bills and never miss a payment"
          action={<button onClick={() => { setEditBill(null); setModalOpen(true); }} className="btn-primary">+ Add Bill</button>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {bills.map(bill => (
            <BillCard key={bill.id} bill={bill} onEdit={b => { setEditBill(b); setModalOpen(true); }}
              onDelete={handleDelete} onMarkPaid={handleMarkPaid} />
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditBill(null); }}
        title={editBill ? 'Edit Bill' : 'Add New Bill'}>
        <BillForm bill={editBill} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditBill(null); }} />
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default BillsPage;
