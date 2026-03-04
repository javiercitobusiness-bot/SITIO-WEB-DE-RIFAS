import React from 'react';
import Diamond from './Diamond';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Diamond className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
          <span className="text-lg sm:text-xl font-bold text-white">
            Dinámica de Diamantes
          </span>
        </a>

        <nav className="flex items-center gap-2 sm:gap-4">
          <a 
            href="#premios" 
            className="text-white/70 hover:text-white text-xs sm:text-sm transition-colors px-2 py-1"
          >
            Premios
          </a>
          <a 
            href="#planes" 
            className="text-white/70 hover:text-white text-xs sm:text-sm transition-colors px-2 py-1"
          >
            Planes
          </a>
          <a 
            href="#como-funciona" 
            className="text-white/70 hover:text-white text-xs sm:text-sm transition-colors px-2 py-1"
          >
            Cómo Funciona
          </a>
        </nav>
      </div>
    </header>
  );
}
