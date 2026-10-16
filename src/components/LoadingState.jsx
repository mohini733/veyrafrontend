'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export const LoadingState = ({ message = 'Loading Veyra Chat...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <div className="relative mb-6">
        {/* Pulsing violet background glow */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-violet-600/30 blur-xl"
        />
        {/* Animated spinning gradient ring */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#111827] border border-violet-500/30 shadow-lg shadow-violet-900/20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute inset-[-3px] rounded-2xl border-2 border-transparent border-t-violet-500 border-r-indigo-500"
          />
          <MessageSquare className="w-8 h-8 text-violet-400" />
        </div>
      </div>
      <p className="text-sm font-medium tracking-wide text-slate-300 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
