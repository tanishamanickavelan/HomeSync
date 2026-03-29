import React from 'react';

export const Badge = ({ label, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    pending: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
    in_progress: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
    completed: 'bg-green-400/10 text-green-400 border border-green-400/20',
    unpaid: 'bg-orange-400/10 text-orange-400 border border-orange-400/20',
    paid: 'bg-green-400/10 text-green-400 border border-green-400/20',
    overdue: 'bg-red-400/10 text-red-400 border border-red-400/20',
    low: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
    medium: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
    high: 'bg-orange-400/10 text-orange-400 border border-orange-400/20',
    urgent: 'bg-red-400/10 text-red-400 border border-red-400/20',
    scheduled: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
    confirmed: 'bg-teal-400/10 text-teal-400 border border-teal-400/20',
    cancelled: 'bg-red-400/10 text-red-400 border border-red-400/20',
    success: 'bg-teal-400/10 text-teal-400 border border-teal-400/20',
  };

  const sizes = { xs: 'text-xs px-2 py-0.5', sm: 'text-xs px-2.5 py-1', md: 'text-sm px-3 py-1' };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant] || variants.default} ${sizes[size]}`}>
      {label}
    </span>
  );
};

export const StatCard = ({ icon: Icon, label, value, sub, color = 'teal', onClick }) => {
  const colors = {
    teal: 'bg-teal-500/10 text-teal-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
    red: 'bg-red-500/10 text-red-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
  };

  return (
    <div
      onClick={onClick}
      className={`card-hover animate-in ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-display font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-14 h-14 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-500" />
      </div>
    )}
    <h3 className="text-slate-300 font-medium mb-1">{title}</h3>
    <p className="text-slate-500 text-sm mb-4 max-w-xs">{description}</p>
    {action}
  </div>
);

export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`${sizes[size]} border-2 border-slate-600 border-t-teal-400 rounded-full animate-spin`} />
  );
};

export const Toast = ({ message, type = 'info', onClose }) => {
  const colors = {
    success: 'bg-green-500/15 border-green-500/30 text-green-400',
    error: 'bg-red-500/15 border-red-500/30 text-red-400',
    info: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
    warning: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl animate-in ${colors[type]}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 text-current">✕</button>
    </div>
  );
};
