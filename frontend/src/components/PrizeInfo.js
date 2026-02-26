import React from 'react';
import Diamond from './Diamond';
import { Trophy, Gift, Calendar } from 'lucide-react';

export default function PrizeInfo({ event }) {
  const defaultPrizes = [
    { name: 'Premio Principal', amount: 100000000, description: 'Gran premio - Lotería de Medellín' },
    { name: 'Repechaje', amount: 50000000, description: 'Número inverso del ganador' },
    { name: 'Premios Diarios', amount: 3000000, description: '8 días - $1.5M derecho + $1.5M inverso', isDaily: true }
  ];

  const prizes = event?.prizes || defaultPrizes;
  
  // Soportar múltiples imágenes de premios
  const prizeImages = event?.prize_images || (event?.image_url ? [event.image_url] : []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <section id="premios" className="py-16 px-4 bg-slate-950/50">
      <div className="max-w-6xl mx-auto">
        {/* Prize Images FIRST - Arriba */}
        {prizeImages.length > 0 && (
          <div className="mb-12">
            <div className={`grid gap-6 ${
              prizeImages.length === 1 ? 'max-w-2xl mx-auto' : 
              prizeImages.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 
              'md:grid-cols-3'
            }`}>
              {prizeImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={img} 
                    alt={`Premio ${idx + 1}`}
                    className="w-full h-64 object-cover rounded-2xl shadow-2xl border-2 border-cyan-500/20 group-hover:border-cyan-500/50 transition-all"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-2xl">
                    <span className="text-white font-semibold">Premio {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Premios Increíbles
          </h2>
          <p className="text-white/60">
            Participa y gana en efectivo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {prizes.map((prize, index) => (
            <div 
              key={index}
              className={`relative p-6 rounded-2xl border ${
                index === 0 
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/30' 
                  : index === 2
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              {index === 0 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                    GRAN PREMIO
                  </span>
                </div>
              )}
              {prize.isDaily && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-green-500 text-black text-xs font-bold rounded-full">
                    8 DÍAS
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  index === 0 ? 'bg-yellow-500/20' : index === 2 ? 'bg-green-500/20' : 'bg-cyan-500/10'
                }`}>
                  {index === 0 ? (
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  ) : index === 2 ? (
                    <Calendar className="w-6 h-6 text-green-400" />
                  ) : (
                    <Gift className="w-6 h-6 text-cyan-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {prize.name}
                  </h3>
                  <p className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-400' : index === 2 ? 'text-green-400' : 'text-cyan-400'
                  }`}>
                    {formatCurrency(prize.amount)}
                    {prize.isDaily && <span className="text-sm font-normal text-white/50"> /día</span>}
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    {prize.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
