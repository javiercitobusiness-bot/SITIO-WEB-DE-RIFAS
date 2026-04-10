import React from 'react';
import { Trophy, Gift, Calendar, Star, Car, Smartphone } from 'lucide-react';

export default function PrizeInfo({ event }) {
  const prizes = event?.prizes || [];

  // Si está deshabilitada la sección o no hay premios, no mostrar nada
  if (event?.show_prizes_section === false || prizes.length === 0) {
    return null;
  }

  const sectionTitle = event?.prizes_section_title || 'Premios Increíbles';

  const getPrizeStyle = (index, prize) => {
    if (prize.prize_type === 'main' || index === 0) {
      return {
        gradient: 'from-yellow-500/20 via-orange-500/10 to-yellow-500/5',
        border: 'border-yellow-500/40',
        iconBg: 'bg-yellow-500/20',
        iconColor: 'text-yellow-400',
        amountColor: 'text-yellow-400',
        badgeBg: 'bg-yellow-500'
      };
    } else if (prize.prize_type === 'daily') {
      return {
        gradient: 'from-green-500/20 via-emerald-500/10 to-green-500/5',
        border: 'border-green-500/40',
        iconBg: 'bg-green-500/20',
        iconColor: 'text-green-400',
        amountColor: 'text-green-400',
        badgeBg: 'bg-green-500'
      };
    } else if (prize.prize_type === 'object') {
      return {
        gradient: 'from-cyan-500/20 via-blue-500/10 to-cyan-500/5',
        border: 'border-cyan-500/40',
        iconBg: 'bg-cyan-500/20',
        iconColor: 'text-cyan-400',
        amountColor: 'text-cyan-400',
        badgeBg: 'bg-cyan-500'
      };
    } else {
      return {
        gradient: 'from-purple-500/20 via-cyan-500/10 to-purple-500/5',
        border: 'border-purple-500/40',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-400',
        amountColor: 'text-purple-400',
        badgeBg: 'bg-purple-500'
      };
    }
  };

  const getPrizeIcon = (prize) => {
    if (prize.prize_type === 'object') return Gift;
    if (prize.prize_type === 'main') return Trophy;
    if (prize.prize_type === 'daily') return Calendar;
    return Star;
  };

  return (
    <section id="premios" className="py-12 md:py-16 px-4 bg-gradient-to-b from-slate-950/50 to-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">Premios</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {sectionTitle.split(' ').map((word, i) => 
              i === sectionTitle.split(' ').length - 1 
                ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">{word}</span>
                : <span key={i}>{word} </span>
            )}
          </h2>
        </div>

        <div className="space-y-6 md:space-y-8">
          {prizes.map((prize, index) => {
            const style = getPrizeStyle(index, prize);
            const Icon = getPrizeIcon(prize);

            return (
              <div 
                key={index}
                className={`relative overflow-hidden rounded-2xl md:rounded-3xl border-2 ${style.border} bg-gradient-to-br ${style.gradient}`}
              >
                <div className="flex flex-col md:flex-row">
                  {prize.image_url ? (
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img 
                        src={prize.image_url} 
                        alt={prize.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/90 hidden md:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent md:hidden" />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 ${style.badgeBg} text-black text-xs font-bold rounded-full shadow-lg`}>
                          {prize.name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={`md:w-1/3 h-48 md:h-auto ${style.iconBg} flex items-center justify-center relative`}>
                      <Icon className={`w-20 h-20 ${style.iconColor} opacity-30`} />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 ${style.badgeBg} text-black text-xs font-bold rounded-full shadow-lg`}>
                          {prize.name}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
                        <Icon className={`w-6 h-6 ${style.iconColor}`} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        {prize.name}
                      </h3>
                    </div>
                    
                    {/* Mostrar el valor personalizado (dinero o texto) */}
                    <p className={`text-3xl md:text-4xl font-black ${style.amountColor} mb-3`}>
                      {prize.display_value || (prize.amount ? `$${prize.amount.toLocaleString()}` : '')}
                    </p>
                    
                    {prize.description && (
                      <p className="text-white/60 text-sm md:text-base max-w-lg">
                        {prize.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
