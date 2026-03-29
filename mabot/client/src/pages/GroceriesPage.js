import React, { useState, useEffect, useCallback } from 'react';
import { groceriesAPI } from '../services/api';
import Modal from '../components/common/Modal';
import { Badge, EmptyState, Spinner, Toast } from '../components/common/index';
import useToast from '../hooks/useToast';
import { PlusIcon, TrashIcon, ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';

const CATEGORIES = ['dairy', 'vegetables', 'fruits', 'grains', 'snacks', 'beverages', 'meat', 'household_items', 'personal_care', 'other'];
const CATEGORY_ICONS = { dairy: '🥛', vegetables: '🥦', fruits: '🍎', grains: '🌾', snacks: '🍪', beverages: '🥤', meat: '🥩', household_items: '🧹', personal_care: '🧴', other: '📦' };

const GroceryForm = ({ item, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    item_name: item?.item_name || '',
    quantity: item?.quantity || 1,
    unit: item?.unit || 'pcs',
    category: item?.category || 'other',
    notes: item?.notes || '',
    low_stock_threshold: item?.low_stock_threshold || 1,
  });
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.type === 'number' ? +e.target.value : e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Item Name *</label>
        <input name="item_name" value={form.item_name} onChange={handleChange} className="input" placeholder="e.g. Aavin Milk" required />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Qty</label>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="input" min="0" step="0.1" required />
        </div>
        <div>
          <label className="label">Unit</label>
          <select name="unit" value={form.unit} onChange={handleChange} className="input">
            {['pcs', 'kg', 'g', 'L', 'ml', 'dozen', 'pack', 'bottle'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Low Alert</label>
          <input type="number" name="low_stock_threshold" value={form.low_stock_threshold} onChange={handleChange} className="input" min="0" />
        </div>
      </div>
      <div>
        <label className="label">Category</label>
        <select name="category" value={form.category} onChange={handleChange} className="input">
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.replace('_', ' ')}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Notes</label>
        <input name="notes" value={form.notes} onChange={handleChange} className="input" placeholder="Optional notes..." />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">{item ? 'Update' : 'Add Item'}</button>
      </div>
    </form>
  );
};

const GroceriesPage = () => {
  const { toast, showToast, hideToast } = useToast();
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [showPurchased, setShowPurchased] = useState(false);
  const [stats, setStats] = useState({});

  const fetchGroceries = useCallback(async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (!showPurchased) params.purchased = 'false';
      const [gRes, sRes] = await Promise.all([groceriesAPI.getAll(params), groceriesAPI.getStats()]);
      setGroceries(gRes.data.groceries);
      setStats(sRes.data.stats);
    } catch { showToast('Failed to load groceries', 'error'); }
    finally { setLoading(false); }
  }, [filterCategory, showPurchased]);

  useEffect(() => { fetchGroceries(); }, [fetchGroceries]);

  const handleSubmit = async (data) => {
    try {
      if (editItem) { await groceriesAPI.update(editItem.id, data); showToast('Item updated!', 'success'); }
      else { await groceriesAPI.create(data); showToast('Item added!', 'success'); }
      setModalOpen(false); setEditItem(null); fetchGroceries();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error'); }
  };

  const handleTogglePurchased = async (item) => {
    try {
      await groceriesAPI.update(item.id, { purchased: !item.purchased });
      fetchGroceries();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await groceriesAPI.delete(id); showToast('Item deleted', 'info'); fetchGroceries(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  const handleMarkAll = async () => {
    try { await groceriesAPI.markAllPurchased(); showToast('All items marked as purchased!', 'success'); fetchGroceries(); }
    catch {}
  };

  // Group by category
  const grouped = groceries.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Grocery Tracker</h1>
          <p className="text-slate-400 text-sm mt-0.5">Shopping list management · Grocery Agent</p>
        </div>
        <div className="flex gap-2">
          {groceries.some(g => !g.purchased) && (
            <button onClick={handleMarkAll} className="btn-secondary flex items-center gap-2">
              <CheckIcon className="w-4 h-4" /> Mark All Done
            </button>
          )}
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-white">{stats.total || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Total Items</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-orange-400">{stats.pending || 0}</p>
          <p className="text-xs text-slate-500 mt-1">To Buy</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-display font-bold text-green-400">{stats.purchased || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Purchased</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input !w-auto text-sm py-1.5">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.replace('_', ' ')}</option>)}
        </select>
        <button onClick={() => setShowPurchased(!showPurchased)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${showPurchased ? 'bg-teal-500/15 border-teal-500/30 text-teal-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
          {showPurchased ? '✓ Showing Purchased' : 'Show Purchased'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Spinner size="lg" /></div>
      ) : groceries.length === 0 ? (
        <EmptyState icon={ShoppingCartIcon} title="No grocery items" description="Add items to your shopping list"
          action={<button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn-primary">+ Add Item</button>} />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <span>{CATEGORY_ICONS[cat] || '📦'}</span>
                <span className="capitalize">{cat.replace('_', ' ')}</span>
                <span className="w-5 h-5 bg-slate-700 rounded-full text-xs text-slate-400 flex items-center justify-center">{items.length}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map(item => (
                  <div key={item.id}
                    className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                      ${item.purchased
                        ? 'bg-slate-800/30 border-slate-700/30 opacity-50'
                        : 'bg-slate-800 border-slate-700 hover:border-teal-500/30'}`}
                    onClick={() => handleTogglePurchased(item)}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${item.purchased ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                      {item.purchased && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${item.purchased ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {item.item_name}
                      </p>
                      <p className="text-xs text-slate-500">{item.quantity} {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditItem(item); setModalOpen(true); }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white text-xs">✏️</button>
                      <button onClick={() => handleDelete(item.id)}
                        className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400">
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }}
        title={editItem ? 'Edit Item' : 'Add Grocery Item'}>
        <GroceryForm item={editItem} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditItem(null); }} />
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default GroceriesPage;
