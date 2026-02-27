import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function FloatingBuyButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-full shadow-2xl shadow-cyan-500/30 flex items-center gap-2 transition-all hover:scale-105 animate-pulse hover:animate-none"
    >
      <ShoppingCart className="w-5 h-5" />
      <span>Comprar</span>
    </button>
  );
}
