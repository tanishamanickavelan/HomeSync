import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-6">
    <div>
      <div className="text-6xl mb-4">🏠</div>
      <h1 className="font-display text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-slate-400 mb-6">Page not found</p>
      <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
        <SparklesIcon className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
