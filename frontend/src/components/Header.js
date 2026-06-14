import React, { useState, useEffect } from 'react';
import Diamond from './Diamond';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Header() {
  const [appearance, setAppearance] = useState({
    site_name: 'Dinámica de Diamantes',
    logo_url: '',
    primary_color: '#06b6d4'
  });

  useEffect(() => {
    fetch(`${API_URL}/api/appearance`)
      .then(res => res.json())
      .then(data => {
        if (data && data.site_name) {
          setAppearance(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.log('Using default appearance'));
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          {appearance.logo_url ? (
            <img src={appearance.logo_url} alt={appearance.site_name} className="h-8 sm:h-10 object-contain" />
          ) : (
            <Diamond className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: appearance.primary_color }} />
          )}
          <span className="text-lg sm:text-xl font-bold text-white">
            {appearance.site_name}
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
        </nav>
      </div>
    </header>
  );
}
