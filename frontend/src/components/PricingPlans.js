import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Diamond from './Diamond';
import { Check, Sparkles, Star, Zap } from 'lucide-react';

export default function PricingPlans({ plans, onSelectPlan, symbolType = 'diamond' }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const SymbolIcon = symbolType === 'star' ? Star : Diamond;
  const symbolName = symbolType === 'star' ? 'estrellas' : 'diamantes';

  const planStyles = {
    basico: {
      gradient: 'from-slate-600 to-slate-700',
      buttonGradient: 'from-slate-500 to-slate-600',
      border: 'border-slate-600/50',
      glow: '',
      popular: false
    },
    medio: {
      gradient: 'from-cyan-500 to-blue-600',
      buttonGradient: 'from-cyan-500 to-blue-600',
      border: 'border-cyan-500',
      glow: 'shadow-lg shadow-cyan-500/20',
      popular: true
    },
    premium: {
      gradient: 'from-purple-500 to-pink-600',
      buttonGradient: 'from-purple-500 to-pink-600',
      border: 'border-purple-500',
      glow: 'shadow-lg shadow-purple-500/20',
      popular: false
    }
  };

  return (
    <section id="planes" className="py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Elige tu Plan
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            Más {symbolName}, más oportunidades de ganar
          </p>
        </div>

        {/* Mobile: Vertical scroll, Desktop: Grid */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
            const style = planStyles[plan.id] || planStyles.basico;
            const pricePerNumber = plan.price / (plan.diamonds_count || plan.numbers_count || 1);
            
            return (
              <Card 
                key={plan.id}
                className={`relative bg-gradient-to-b from-slate-900 to-slate-800 border-2 ${style.border} ${style.glow} overflow-hidden transition-all duration-300 active:scale-[0.98] ${style.popular ? 'md:scale-105' : ''}`}
                data-testid={`plan-card-${plan.id}`}
              >
                {/* Popular Badge */}
                {style.popular && (
                  <div className="absolute -top-0 left-0 right-0">
                    <div className={`bg-gradient-to-r ${style.gradient} text-white text-xs font-bold py-1.5 text-center`}>
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      MÁS POPULAR
                    </div>
                  </div>
                )}
                
                <CardHeader className={`text-center pb-2 ${style.popular ? 'pt-10' : 'pt-6'}`}>
                  {/* Icon */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                    <SymbolIcon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  
                  {/* Plan Name */}
                  <CardTitle className="text-lg md:text-xl text-white">{plan.name}</CardTitle>
                  
                  {/* Numbers Count - Prominent */}
                  <div className="mt-2">
                    <span className={`text-3xl md:text-4xl font-black bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
                      {plan.diamonds_count || plan.numbers_count}
                    </span>
                    <span className="text-white/50 text-sm ml-1">{symbolName}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="text-center pt-0">
                  {/* Price */}
                  <div className="mb-4 py-3 px-4 bg-slate-800/50 rounded-xl">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-white/40 text-xs">{formatCurrency(pricePerNumber)} por número</span>
                    </div>
                  </div>
                  
                  {/* Features - Compact for mobile */}
                  <ul className="space-y-2 mb-5 text-left">
                    <li className="flex items-center gap-2 text-white/70 text-sm">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span>{plan.diamonds_count || plan.numbers_count} números para sorteos</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/70 text-sm">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span>Participación en todos los premios</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/70 text-sm">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span>Confirmación inmediata por email</span>
                    </li>
                  </ul>
                  
                  {/* CTA Button - Large touch target */}
                  <Button 
                    className={`w-full py-6 text-base font-semibold bg-gradient-to-r ${style.buttonGradient} hover:opacity-90 text-white rounded-xl transition-all active:scale-95`}
                    onClick={() => onSelectPlan(plan)}
                    data-testid={`select-plan-${plan.id}`}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Comprar Ahora
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
