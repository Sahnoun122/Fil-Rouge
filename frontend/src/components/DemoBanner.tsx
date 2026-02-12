'use client';

// components/DemoBanner.tsx - Banner pour indiquer le mode demo

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <AlertTriangle className="w-4 h-4 mr-2" />
        <span>
          🎭 <strong>Mode Demo</strong> - Vous êtes connecté automatiquement pour tester l'application
        </span>
        <AlertTriangle className="w-4 h-4 ml-2" />
      </div>
    </div>
  );
}