import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI, familyAPI } from '../services/api';
import Modal from '../components/common/Modal';
import { Badge, EmptyState, Spinner, Toast } from '../components/common/index';
import useToast from '../hooks/useToast';
import { PlusIcon, PencilIcon, TrashIcon, ClipboardDocumentListIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['pending', 'in_progress', 'completed'];

const TaskForm = ({ task, members, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assigned_to: task?.assigned_to?.id || task?.assigned_to || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
  });

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ ...form, assigned_to: form.assigned_to || null, due_date: form.due_date || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <input name="title" value={form.title} onChange={handleChange}
          className="input" placeholder="e.g. Buy groceries" required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange}
          className="input resize-none" rows={3} placeholder="Optional details..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Assign To</label>
          <select name="assigned_to" value={form.assigned_to} onChange={handleChange} className="input">
            <option value="">Unassigned</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="input">
            {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
        </div>
        {task && (
          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input">
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">{task ? 'Update Task' : 'Add Task'}</button>
      </div>
    </form>
  );
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => (
  <div className={`card-hover group animate-in ${task.status === 'completed' ? 'opacity-60' : ''}`}>
    <div className="flex items-start gap-3">
      <input type="checkbox" checked={task.status === 'completed'}
        onChange={() => onStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
        className="mt-1 w-4 h-4 rounded border-slate-500 bg-slate-700 text-teal-500 cursor-pointer flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
          {task.title}
        </p>
        {task.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge label={task.priority} variant={task.priority} />
          <Badge label={task.status.replace('_', ' ')} variant={task.status} />
          {task.assigned_to && (
            <span className="text-xs text-slate-400">👤 {task.assigned_to.name}</span>
          )}
          {task.due_date && (
            <span className={`text-xs flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-400' : 'text-slate-400'}`}>
              📅 {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={() => onEdit(task)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all">
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all">
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);

const TasksPage = () => {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [stats, setStats] = useState({});

  const fetchTasks = useCallback(async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        tasksAPI.getAll(filter),
        tasksAPI.getStats()
      ]);
      setTasks(tasksRes.data.tasks);
      setStats(statsRes.data.stats);
    } catch {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
    familyAPI.get().then(r => setMembers(r.data.family?.members || [])).catch(() => {});
  }, [fetchTasks]);

  const handleSubmit = async (data) => {
    try {
      if (editTask) {
        await tasksAPI.update(editTask.id, data);
        showToast('Task updated!', 'success');
      } else {
        await tasksAPI.create(data);
        showToast('Task created!', 'success');
      }
      setModalOpen(false);
      setEditTask(null);
      fetchTasks();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save task', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      showToast('Task deleted', 'info');
      fetchTasks();
    } catch {
      showToast('Failed to delete task', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await tasksAPI.update(id, { status });
      fetchTasks();
    } catch {}
  };

  const openAdd = () => { setEditTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditTask(task); setModalOpen(true); };

  const grouped = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Task Manager</h1>
          <p className="text-slate-400 text-sm mt-0.5">Family task coordination · Task Agent</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total || 0, color: 'text-slate-300' },
          { label: 'Pending', value: stats.pending || 0, color: 'text-yellow-400' },
          { label: 'In Progress', value: stats.inProgress || 0, color: 'text-blue-400' },
          { label: 'Completed', value: stats.completed || 0, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <FunnelIcon className="w-4 h-4 text-slate-400" />
        <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
          className="input !w-auto text-sm py-1.5">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={filter.priority} onChange={e => setFilter(p => ({ ...p, priority: e.target.value }))}
          className="input !w-auto text-sm py-1.5">
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filter.status || filter.priority) && (
          <button onClick={() => setFilter({ status: '', priority: '' })}
            className="text-xs text-teal-400 hover:text-teal-300">Clear filters</button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Spinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={ClipboardDocumentListIcon} title="No tasks found"
          description="Add your first household task to get started"
          action={<button onClick={openAdd} className="btn-primary">+ Add Task</button>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {Object.entries(grouped).map(([status, items]) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-medium text-slate-300 capitalize text-sm">{status.replace('_', ' ')}</h3>
                <span className="w-5 h-5 bg-slate-700 rounded-full text-xs text-slate-400 flex items-center justify-center">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-slate-600 text-xs text-center py-6 border border-dashed border-slate-700 rounded-xl">No tasks</p>
                ) : items.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTask(null); }}
        title={editTask ? 'Edit Task' : 'Add New Task'}>
        <TaskForm task={editTask} members={members} onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditTask(null); }} />
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default TasksPage;
