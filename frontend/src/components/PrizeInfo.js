import React from 'react';
import Diamond from './Diamond';
import { Trophy, Gift, Calendar, Star } from 'lucide-react';

export default function PrizeInfo({ event }) {
  const defaultPrizes = [
    { name: 'Premio Principal', amount: 100000000, description: 'Gran premio - Lotería de Medellín', prize_type: 'main' },
    { name: 'Repechaje', amount: 50000000, description: 'Número inverso del ganador', prize_type: 'secondary' },
    { name: 'Premios Diarios', amount: 3000000, description: '8 días - $1.5M derecho + $1.5M inverso', prize_type: 'daily', isDaily: true }
  ];

  const prizes = event?.prizes?.length > 0 ? event.prizes : defaultPrizes;
  
  // Imágenes de premios del evento
  const prizeImages = event?.prize_images || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPrizeStyle = (index, prize) => {
    if (prize.prize_type === 'main' || index === 0) {
      return {
        gradient: 'from-yellow-500/20 via-orange-500/10 to-yellow-500/5',
        border: 'border-yellow-500/40',
        iconBg: 'bg-yellow-500/20',
        iconColor: 'text-yellow-400',
        amountColor: 'text-yellow-400',
        badge: 'GRAN PREMIO',
        badgeBg: 'bg-yellow-500'
      };
    } else if (prize.isDaily || prize.prize_type === 'daily') {
      return {
        gradient: 'from-green-500/20 via-emerald-500/10 to-green-500/5',
        border: 'border-green-500/40',
        iconBg: 'bg-green-500/20',
        iconColor: 'text-green-400',
        amountColor: 'text-green-400',
        badge: 'DIARIO',
        badgeBg: 'bg-green-500'
      };
    } else {
      return {
        gradient: 'from-purple-500/20 via-cyan-500/10 to-purple-500/5',
        border: 'border-purple-500/40',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-400',
        amountColor: 'text-purple-400',
        badge: 'REPECHAJE',
        badgeBg: 'bg-purple-500'
      };
    }
  };

  const getPrizeIcon = (index, prize) => {
    if (prize.prize_type === 'main' || index === 0) return Trophy;
    if (prize.isDaily || prize.prize_type === 'daily') return Calendar;
    return Star;
  };

  return (
    <section id="premios" className="py-12 md:py-16 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">Premios en Efectivo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Premios <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Increíbles</span>
          </h2>
          <p className="text-white/60 max-w-lg mx-auto">
            Cada diamante te da la oportunidad de ganar en los sorteos diarios y el gran premio final
          </p>
        </div>

        {/* Prizes Grid - Cada premio con su imagen */}
        <div className="space-y-6 md:space-y-8">
          {prizes.map((prize, index) => {
            const style = getPrizeStyle(index, prize);
            const Icon = getPrizeIcon(index, prize);
            const prizeImage = prizeImages[index];

            return (
              <div 
                key={index}
                className={`relative overflow-hidden rounded-2xl md:rounded-3xl border-2 ${style.border} bg-gradient-to-br ${style.gradient}`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Imagen del premio */}
                  {prizeImage ? (
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img 
                        src={prizeImage} 
                        alt={prize.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/90 hidden md:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent md:hidden" />
                      
                      {/* Badge sobre la imagen */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 ${style.badgeBg} text-black text-xs font-bold rounded-full shadow-lg`}>
                          {style.badge}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={`md:w-1/3 h-48 md:h-auto ${style.iconBg} flex items-center justify-center relative`}>
                      <Icon className={`w-20 h-20 ${style.iconColor} opacity-30`} />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 ${style.badgeBg} text-black text-xs font-bold rounded-full shadow-lg`}>
                          {style.badge}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Contenido del premio */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
                        <Icon className={`w-6 h-6 ${style.iconColor}`} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        {prize.name}
                      </h3>
                    </div>
                    
                    <p className={`text-4xl md:text-5xl font-black ${style.amountColor} mb-3`}>
                      {formatCurrency(prize.amount)}
                      {prize.isDaily && (
                        <span className="text-lg font-normal text-white/50 ml-2">por día</span>
                      )}
                    </p>
                    
                    <p className="text-white/60 text-sm md:text-base max-w-lg">
                      {prize.description}
                    </p>

                    {/* Extra info for daily prizes */}
                    {prize.isDaily && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs">
                          $1.5M número derecho
                        </span>
                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs">
                          $1.5M número inverso
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total de premios */}
        <div className="mt-10 md:mt-14 text-center">
          <div className="inline-block p-6 md:p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
            <p className="text-white/50 text-sm mb-2">Total en premios</p>
            <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              {formatCurrency(prizes.reduce((sum, p) => sum + (p.amount || 0), 0))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
