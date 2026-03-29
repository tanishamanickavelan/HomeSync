// LoadingScreen.js
import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

export const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
        <SparklesIcon className="w-6 h-6 text-white" />
      </div>
      <p className="text-slate-400 text-sm">Loading MaBot...</p>
    </div>
  </div>
);

export default LoadingScreen;
