import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import { StatCard, Badge, Spinner } from '../components/common/index';
import {
  ClipboardDocumentListIcon, ShoppingCartIcon, CreditCardIcon,
  WrenchScrewdriverIcon, BellAlertIcon, ExclamationTriangleIcon,
  CheckCircleIcon, ClockIcon
} from '@heroicons/react/24/outline';
import { format, isToday, isPast } from 'date-fns';

const priorityColor = { low: 'text-blue-400', medium: 'text-yellow-400', high: 'text-orange-400', urgent: 'text-red-400' };

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.get();
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  if (!user?.family_id) return (
    <div className="max-w-lg mx-auto mt-16 text-center">
      <div className="text-5xl mb-4">🏠</div>
      <h2 className="font-display text-xl font-bold text-white mb-2">No Family Linked</h2>
      <p className="text-slate-400 text-sm mb-5">You need to create or join a family to use MaBot features.</p>
      <button onClick={() => navigate('/profile')} className="btn-primary">Set Up Family →</button>
    </div>
  );

  const { tasksDueToday = [], pendingBills = [], groceryNeeded = [], upcomingServices = [],
    taskSummary = {}, totalUnpaidBills = 0, overdueTaskCount = 0, familyMembers = [],
    unreadNotifications = 0 } = data || {};

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {format(new Date(), 'EEEE, MMMM d')} · {user?.family_id?.family_name}
          </p>
        </div>
        {unreadNotifications > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-sm">
            <BellAlertIcon className="w-4 h-4" />
            {unreadNotifications} new alert{unreadNotifications > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardDocumentListIcon} label="Tasks Today" value={tasksDueToday.length}
          sub={overdueTaskCount > 0 ? `${overdueTaskCount} overdue` : 'On track'} color="blue"
          onClick={() => navigate('/tasks')} />
        <StatCard icon={CreditCardIcon} label="Unpaid Bills"
          value={pendingBills.length}
          sub={`₹${totalUnpaidBills.toLocaleString('en-IN')}`} color="orange"
          onClick={() => navigate('/bills')} />
        <StatCard icon={ShoppingCartIcon} label="Grocery Items"
          value={groceryNeeded.length} sub="Pending purchase" color="teal"
          onClick={() => navigate('/groceries')} />
        <StatCard icon={WrenchScrewdriverIcon} label="Services"
          value={upcomingServices.length} sub="Upcoming" color="purple"
          onClick={() => navigate('/services')} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tasks due today */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Tasks Due Today</h2>
            <button onClick={() => navigate('/tasks')} className="text-xs text-teal-400 hover:text-teal-300">View all →</button>
          </div>
          {tasksDueToday.length === 0 ? (
            <div className="flex items-center gap-3 py-6 text-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-slate-300 font-medium text-sm">All clear!</p>
                <p className="text-slate-500 text-xs">No tasks due today</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {tasksDueToday.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-xl hover:bg-slate-700/60 transition-all">
                  <div className={`w-1.5 h-1.5 rounded-full ${priorityColor[task.priority]?.replace('text-', 'bg-')}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{task.title}</p>
                    {task.assigned_to && (
                      <p className="text-xs text-slate-500">Assigned to {task.assigned_to.name}</p>
                    )}
                  </div>
                  <Badge label={task.priority} variant={task.priority} />
                </div>
              ))}
            </div>
          )}
          {overdueTaskCount > 0 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{overdueTaskCount} overdue task{overdueTaskCount > 1 ? 's' : ''} need attention</p>
            </div>
          )}
        </div>

        {/* Pending bills */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Upcoming Bills</h2>
            <button onClick={() => navigate('/bills')} className="text-xs text-teal-400 hover:text-teal-300">View all →</button>
          </div>
          {pendingBills.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No pending bills 🎉</p>
          ) : (
            <div className="space-y-2">
              {pendingBills.slice(0, 4).map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-200 font-medium">{bill.bill_name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <ClockIcon className="w-3 h-3" />
                      {format(new Date(bill.due_date), 'MMM d')}
                      {isPast(new Date(bill.due_date)) && <span className="text-red-400 ml-1">Overdue!</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">₹{bill.amount.toLocaleString('en-IN')}</p>
                    <Badge label={bill.status} variant={bill.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grocery needed */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Shopping Needed</h2>
            <button onClick={() => navigate('/groceries')} className="text-xs text-teal-400 hover:text-teal-300">View all →</button>
          </div>
          {groceryNeeded.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">All stocked up! ✅</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {groceryNeeded.slice(0, 12).map(item => (
                <span key={item.id} className="inline-flex items-center px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-full text-xs text-slate-200">
                  {item.item_name} <span className="text-slate-400 ml-1">· {item.quantity} {item.unit}</span>
                </span>
              ))}
              {groceryNeeded.length > 12 && (
                <span className="inline-flex items-center px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs text-teal-400">
                  +{groceryNeeded.length - 12} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Upcoming services + family */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Upcoming Services</h2>
            <button onClick={() => navigate('/services')} className="text-xs text-teal-400 hover:text-teal-300">View all →</button>
          </div>
          {upcomingServices.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No upcoming services</p>
          ) : (
            <div className="space-y-2">
              {upcomingServices.map(svc => (
                <div key={svc.id} className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-xl">
                  <div className="text-lg">
                    {svc.service_type === 'cleaning' ? '🧹' : svc.service_type === 'plumber' ? '🔧' : svc.service_type === 'maid' ? '🧺' : '🔨'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200 capitalize">{svc.service_type}</p>
                    <p className="text-xs text-slate-500">{format(new Date(svc.date), 'MMM d')} · {svc.time}</p>
                  </div>
                  <Badge label={svc.status} variant={svc.status} />
                </div>
              ))}
            </div>
          )}

          {/* Family members */}
          {familyMembers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400 mb-2">Family Members</p>
              <div className="flex gap-2 flex-wrap">
                {familyMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/50 rounded-full">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-300">{m.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task progress summary */}
      <div className="card">
        <h2 className="section-title mb-4">Task Overview</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Pending', value: taskSummary.pending || 0, color: 'text-yellow-400', bg: 'bg-yellow-400' },
            { label: 'In Progress', value: taskSummary.in_progress || 0, color: 'text-blue-400', bg: 'bg-blue-400' },
            { label: 'Completed', value: taskSummary.completed || 0, color: 'text-green-400', bg: 'bg-green-400' },
          ].map(s => (
            <div key={s.label}>
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${s.bg} rounded-full transition-all`}
                  style={{ width: `${Math.min(100, (s.value / Math.max(1, (taskSummary.pending || 0) + (taskSummary.in_progress || 0) + (taskSummary.completed || 0))) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
