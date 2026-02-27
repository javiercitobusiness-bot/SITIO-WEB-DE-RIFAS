import React from 'react';
import Diamond from './Diamond';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Diamond className="w-8 h-8 text-cyan-400" />
          <span className="text-xl font-bold text-white hidden sm:block">
            Dinámica de Diamantes
          </span>
        </a>

        <nav className="flex items-center gap-4">
          <a 
            href="#premios" 
            className="text-white/70 hover:text-white text-sm hidden md:block transition-colors"
          >
            Premios
          </a>
          <a 
            href="#planes" 
            className="text-white/70 hover:text-white text-sm hidden md:block transition-colors"
          >
            Planes
          </a>
        </nav>
      </div>
    </header>
  );
}
