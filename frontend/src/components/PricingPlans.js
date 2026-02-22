import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Diamond from './Diamond';
import { Check, Sparkles, Star } from 'lucide-react';

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
      border: 'border-slate-600',
      popular: false
    },
    medio: {
      gradient: 'from-cyan-500 to-blue-600',
      border: 'border-cyan-500',
      popular: true
    },
    premium: {
      gradient: 'from-purple-500 to-pink-600',
      border: 'border-purple-500',
      popular: false
    }
  };

  return (
    <section id="planes" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Elige tu Plan
          </h2>
          <p className="text-white/60">
            Más diamantes, más oportunidades de ganar
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const style = planStyles[plan.id] || planStyles.basico;
            
            return (
              <Card 
                key={plan.id}
                className={`relative bg-slate-900/80 border-2 ${style.border} overflow-hidden transition-transform hover:scale-105`}
                data-testid={`plan-card-${plan.id}`}
              >
                {style.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-cyan-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                    <Diamond className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-white/50">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-white/50 text-sm block mt-1">COP</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6 text-left">
                    <li className="flex items-center gap-2 text-white/70">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>{plan.diamonds_count} diamantes numerados</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/70">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Participación automática</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/70">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Confirmación por email</span>
                    </li>
                  </ul>
                  
                  <Button 
                    className={`w-full bg-gradient-to-r ${style.gradient} hover:opacity-90 text-white`}
                    onClick={() => onSelectPlan(plan)}
                    data-testid={`select-plan-${plan.id}`}
                  >
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
