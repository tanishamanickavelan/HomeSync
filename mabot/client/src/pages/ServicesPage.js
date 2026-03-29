import React, { useState, useEffect, useCallback } from 'react';
import { servicesAPI } from '../services/api';
import Modal from '../components/common/Modal';
import { Badge, EmptyState, Spinner, Toast } from '../components/common/index';
import useToast from '../hooks/useToast';
import { PlusIcon, TrashIcon, WrenchScrewdriverIcon, PencilIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const SERVICE_TYPES = ['plumber', 'electrician', 'maid', 'laundry', 'cleaning', 'carpenter', 'pest_control', 'appliance_repair', 'other'];
const SERVICE_ICONS = { plumber: '🔧', electrician: '⚡', maid: '🧺', laundry: '👕', cleaning: '🧹', carpenter: '🪚', pest_control: '🐛', appliance_repair: '🔨', other: '🛠️' };

const TIME_SLOTS = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

const ServiceForm = ({ service, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    service_type: service?.service_type || 'cleaning',
    provider_name: service?.provider_name || '',
    date: service?.date ? service.date.split('T')[0] : '',
    time: service?.time || '10:00 AM',
    status: service?.status || 'scheduled',
    estimated_cost: service?.estimated_cost || '',
    actual_cost: service?.actual_cost || '',
    notes: service?.notes || '',
    rating: service?.rating || '',
  });
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Service Type *</label>
        <div className="grid grid-cols-3 gap-2">
          {SERVICE_TYPES.slice(0, 6).map(t => (
            <button type="button" key={t} onClick={() => setForm(p => ({ ...p, service_type: t }))}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all capitalize
                ${form.service_type === t ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>
              <div className="text-lg mb-0.5">{SERVICE_ICONS[t]}</div>
              {t}
            </button>
          ))}
        </div>
        <select name="service_type" value={form.service_type} onChange={handleChange} className="input mt-2">
          {SERVICE_TYPES.map(t => <option key={t} value={t} className="capitalize">{SERVICE_ICONS[t]} {t.replace('_', ' ')}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Provider Name</label>
        <input name="provider_name" value={form.provider_name} onChange={handleChange} className="input" placeholder="e.g. UrbanClap, Local provider..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Time *</label>
          <select name="time" value={form.time} onChange={handleChange} className="input" required>
            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Est. Cost (₹)</label>
          <input type="number" name="estimated_cost" value={form.estimated_cost} onChange={handleChange} className="input" placeholder="0" min="0" />
        </div>
        {service && (
          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input">
              {['scheduled', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>
      {service?.status === 'completed' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Actual Cost (₹)</label>
            <input type="number" name="actual_cost" value={form.actual_cost} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Rating (1-5)</label>
            <select name="rating" value={form.rating} onChange={handleChange} className="input">
              <option value="">No rating</option>
              {[1,2,3,4,5].map(r => <option key={r} value={r}>{'⭐'.repeat(r)} {r}</option>)}
            </select>
          </div>
        </div>
      )}
      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input resize-none" rows={2} placeholder="Additional instructions..." />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">{service ? 'Update Booking' : 'Book Service'}</button>
      </div>
    </form>
  );
};

const ServicesPage = () => {
  const { toast, showToast, hideToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await servicesAPI.getAll(params);
      setServices(res.data.services);
    } catch { showToast('Failed to load services', 'error'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleSubmit = async (data) => {
    try {
      if (editService) { await servicesAPI.update(editService.id, data); showToast('Booking updated!', 'success'); }
      else { await servicesAPI.create(data); showToast('Service booked!', 'success'); }
      setModalOpen(false); setEditService(null); fetchServices();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this service booking?')) return;
    try { await servicesAPI.delete(id); showToast('Booking cancelled', 'info'); fetchServices(); }
    catch { showToast('Failed to cancel', 'error'); }
  };

  const upcoming = services.filter(s => ['scheduled', 'confirmed'].includes(s.status));
  const past = services.filter(s => ['completed', 'cancelled'].includes(s.status));

  return (
    <div className="space-y-5 animate-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Service Bookings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Home services management · Service Agent</p>
        </div>
        <button onClick={() => { setEditService(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Book Service
        </button>
      </div>

      {/* Quick service type grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {SERVICE_TYPES.slice(0, 6).map(t => (
          <button key={t} onClick={() => { setEditService(null); setModalOpen(true); }}
            className="card text-center hover:border-teal-500/40 transition-all py-3">
            <div className="text-2xl mb-1">{SERVICE_ICONS[t]}</div>
            <p className="text-xs text-slate-400 capitalize">{t.replace('_', ' ')}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'scheduled', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize
              ${filterStatus === s ? 'bg-teal-500/15 border-teal-500/30 text-teal-400' : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Spinner size="lg" /></div>
      ) : services.length === 0 ? (
        <EmptyState icon={WrenchScrewdriverIcon} title="No services booked" description="Book home services like plumber, maid, cleaning and more"
          action={<button onClick={() => { setEditService(null); setModalOpen(true); }} className="btn-primary">+ Book Service</button>} />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="section-title mb-3">Upcoming ({upcoming.length})</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {upcoming.map(svc => (
                  <div key={svc.id} className="card-hover group animate-in">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{SERVICE_ICONS[svc.service_type] || '🛠️'}</div>
                        <div>
                          <p className="font-medium text-slate-100 capitalize">{svc.service_type.replace('_', ' ')}</p>
                          {svc.provider_name && <p className="text-xs text-slate-400 mt-0.5">{svc.provider_name}</p>}
                          <div className="flex flex-wrap gap-2 mt-2 items-center">
                            <Badge label={svc.status} variant={svc.status} />
                            <span className="text-xs text-slate-400">📅 {format(new Date(svc.date), 'MMM d')} · {svc.time}</span>
                            {svc.estimated_cost && <span className="text-xs text-slate-400">₹{svc.estimated_cost}</span>}
                          </div>
                          {svc.notes && <p className="text-xs text-slate-500 mt-1 truncate max-w-xs">{svc.notes}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditService(svc); setModalOpen(true); }} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(svc.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="section-title mb-3 text-slate-400">Past Services ({past.length})</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {past.map(svc => (
                  <div key={svc.id} className="card-hover group opacity-60 hover:opacity-80 animate-in">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-xl">{SERVICE_ICONS[svc.service_type] || '🛠️'}</div>
                        <div>
                          <p className="font-medium text-slate-200 capitalize text-sm">{svc.service_type.replace('_', ' ')}</p>
                          <div className="flex flex-wrap gap-2 mt-1 items-center">
                            <Badge label={svc.status} variant={svc.status} />
                            <span className="text-xs text-slate-500">{format(new Date(svc.date), 'MMM d')}</span>
                            {svc.actual_cost && <span className="text-xs text-slate-500">₹{svc.actual_cost}</span>}
                            {svc.rating && <span className="text-xs">{'⭐'.repeat(svc.rating)}</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(svc.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditService(null); }} title={editService ? 'Edit Booking' : 'Book a Service'} size="lg">
        <ServiceForm service={editService} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditService(null); }} />
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default ServicesPage;
