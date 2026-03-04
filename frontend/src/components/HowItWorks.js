import React from 'react';
import { Card, CardContent } from './ui/card';
import { 
  Calendar, 
  Calculator, 
  RefreshCw, 
  Gift, 
  Trophy, 
  Sun, 
  Star,
  Award,
  Clock,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import Diamond from './Diamond';

export default function HowItWorks() {
  const lotteryCalendar = [
    { date: '9 MAR', lottery: 'Quindío' },
    { date: '10 MAR', lottery: 'Boyacá' },
    { date: '11 MAR', lottery: 'Risaralda' },
    { date: '12 MAR', lottery: 'Manizales' },
    { date: '13 MAR', lottery: 'Meta' },
    { date: '14 MAR', lottery: 'Tolima' },
    { date: '15 MAR', lottery: 'Bogotá' },
    { date: '16 MAR', lottery: 'Quindío' },
    { date: '17 MAR', lottery: 'Boyacá' },
    { date: '18 MAR', lottery: 'Medellín', isFinal: true },
  ];

  const sorteoTypes = [
    {
      icon: Sun,
      title: 'Sorteo Diario',
      subtitle: 'Todos los días hay ganadores',
      color: 'cyan',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30',
      description: 'Cada día se premian DOS diamantes basados en los resultados de la lotería del día.',
      details: [
        { icon: CheckCircle, text: 'Un diamante al DERECHO (número tal cual sale)' },
        { icon: RefreshCw, text: 'Un diamante al INVERSO (número al revés)' },
      ],
      prize: '$1.500.000',
      prizeLabel: 'Premio por número',
      highlight: 'Los ganadores se publican diariamente en nuestras redes sociales'
    },
    {
      icon: Star,
      title: 'Repechaje',
      subtitle: 'Segunda oportunidad de ganar',
      color: 'purple',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      description: 'Si no ganaste durante los días anteriores, tienes una segunda oportunidad con el sorteo de repechaje.',
      details: [
        { icon: CheckCircle, text: 'Participan todos los diamantes que no ganaron antes' },
        { icon: Award, text: 'Se sortea con la lotería de Medellín' },
      ],
      prize: '$50.000.000',
      prizeLabel: 'Premio repechaje',
      highlight: 'Solo participan quienes no han ganado en sorteos diarios'
    },
    {
      icon: Trophy,
      title: 'Gran Premio Final',
      subtitle: 'El sorteo más esperado',
      color: 'yellow',
      bgGradient: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      description: 'El sorteo final con el premio más grande. Todos los diamantes participan automáticamente.',
      details: [
        { icon: CheckCircle, text: 'TODOS los diamantes participan (incluso si ya ganaste)' },
        { icon: Calendar, text: 'Se realiza el 18 de marzo con la Lotería de Medellín' },
      ],
      prize: '$100.000.000',
      prizeLabel: 'Gran premio',
      highlight: 'Aunque hayas ganado antes, tu diamante sigue participando'
    }
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Header con estilo landing page */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Transparencia Total</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            ¿Cómo Funciona el <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Sorteo?</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-base md:text-lg">
            Tres formas de ganar con un solo diamante. Conoce las reglas claras y transparentes de nuestra dinámica.
          </p>
        </div>

        {/* 3 TIPOS DE SORTEO - Cards principales */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 md:mb-24">
          {sorteoTypes.map((sorteo, idx) => (
            <Card 
              key={idx} 
              className={`bg-gradient-to-br ${sorteo.bgGradient} ${sorteo.borderColor} border-2 hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
            >
              <CardContent className="p-6 md:p-8">
                {/* Icon y título */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-${sorteo.color}-500/20`}>
                    <sorteo.icon className={`w-7 h-7 text-${sorteo.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{sorteo.title}</h3>
                    <p className={`text-${sorteo.color}-400 text-sm`}>{sorteo.subtitle}</p>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-white/70 mb-6 text-sm md:text-base leading-relaxed">
                  {sorteo.description}
                </p>

                {/* Detalles */}
                <div className="space-y-3 mb-6">
                  {sorteo.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <detail.icon className={`w-5 h-5 text-${sorteo.color}-400 shrink-0 mt-0.5`} />
                      <span className="text-white/80 text-sm">{detail.text}</span>
                    </div>
                  ))}
                </div>

                {/* Premio */}
                <div className={`bg-slate-900/50 rounded-xl p-4 border ${sorteo.borderColor}`}>
                  <p className="text-white/50 text-xs mb-1">{sorteo.prizeLabel}</p>
                  <p className={`text-2xl md:text-3xl font-bold text-${sorteo.color}-400`}>{sorteo.prize}</p>
                </div>

                {/* Highlight */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className={`text-${sorteo.color}-400/80 text-xs md:text-sm flex items-start gap-2`}>
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    {sorteo.highlight}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SECCION: Cómo se calcula el número ganador */}
        <div className="mb-16 md:mb-24">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500/20 rounded-xl w-fit">
              <Calculator className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">¿Cómo se Calcula el Número Ganador?</h3>
              <p className="text-white/60 text-sm md:text-base">El método es simple y 100% verificable</p>
            </div>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 md:p-10">
              {/* Pasos */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                {[
                  { step: 1, title: 'Lotería del día', desc: 'Se toma el número ganador de 4 cifras' },
                  { step: 2, title: 'Últimos 2 de serie', desc: 'Se agregan los 2 últimos números de la serie' },
                  { step: 3, title: 'Número final', desc: 'Se forma el diamante ganador de 6 cifras' },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{item.step}</span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Ejemplo visual mejorado */}
              <div className="bg-slate-900/70 rounded-2xl p-6 md:p-8 border border-slate-700">
                <p className="text-white/50 text-sm mb-6 text-center uppercase tracking-wider">Ejemplo práctico</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                  <div className="text-center bg-slate-800/50 rounded-xl p-4 w-full md:w-auto">
                    <p className="text-white/50 text-xs mb-2">Número ganador</p>
                    <p className="text-3xl md:text-4xl font-bold text-white font-mono">5264</p>
                  </div>
                  <span className="text-3xl text-purple-400 font-light hidden md:block">+</span>
                  <span className="text-2xl text-purple-400 md:hidden">+</span>
                  <div className="text-center bg-slate-800/50 rounded-xl p-4 w-full md:w-auto">
                    <p className="text-white/50 text-xs mb-2">Serie (últimos 2)</p>
                    <p className="text-3xl md:text-4xl font-bold text-white font-mono">2<span className="text-cyan-400">31</span></p>
                  </div>
                  <span className="text-3xl text-purple-400 font-light hidden md:block">=</span>
                  <span className="text-2xl text-purple-400 md:hidden">=</span>
                  <div className="text-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl p-4 border border-cyan-500/30 w-full md:w-auto">
                    <p className="text-cyan-400 text-xs mb-2">Diamante ganador</p>
                    <p className="text-3xl md:text-4xl font-bold text-cyan-400 font-mono">526431</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECCION: Número Inverso */}
        <div className="mb-16 md:mb-24">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="p-3 bg-green-500/20 rounded-xl w-fit">
              <RefreshCw className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">El Número Inverso</h3>
              <p className="text-white/60 text-sm md:text-base">Duplica tus oportunidades de ganar cada día</p>
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 border-2">
            <CardContent className="p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-white/80 text-base md:text-lg mb-6 leading-relaxed">
                    En cada sorteo diario, <span className="text-green-400 font-semibold">dos personas ganan</span>: 
                    quien tiene el número al derecho y quien tiene el número al revés.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/70">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Ambos ganan el mismo premio</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Se anuncian diariamente en redes</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Resultados 100% verificables</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-2xl p-6 border border-green-500/20">
                  <p className="text-white/50 text-sm mb-4 text-center uppercase tracking-wider">Ejemplo</p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-center">
                      <p className="text-white/50 text-xs mb-2">Número derecho</p>
                      <div className="flex items-center gap-2">
                        <Diamond className="w-6 h-6 text-cyan-400" />
                        <p className="text-3xl font-bold text-cyan-400 font-mono">526431</p>
                      </div>
                    </div>
                    <RefreshCw className="w-8 h-8 text-green-400 animate-spin-slow" />
                    <div className="text-center">
                      <p className="text-white/50 text-xs mb-2">Número inverso</p>
                      <div className="flex items-center gap-2">
                        <Diamond className="w-6 h-6 text-green-400" />
                        <p className="text-3xl font-bold text-green-400 font-mono">134625</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-green-400/80 text-sm mt-4 pt-4 border-t border-green-500/20">
                    Ambos ganan $1.500.000
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CALENDARIO DE SORTEOS */}
        <div className="mb-16 md:mb-24">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="p-3 bg-cyan-500/20 rounded-xl w-fit">
              <Calendar className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">Calendario de Sorteos</h3>
              <p className="text-white/60 text-sm md:text-base">Loterías oficiales que determinan los ganadores</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {lotteryCalendar.map((day, idx) => (
              <Card 
                key={idx} 
                className={`border transition-all hover:scale-105 ${
                  day.isFinal 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30' 
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <CardContent className="p-3 md:p-4 text-center">
                  <p className={`font-bold text-xs md:text-sm mb-1 ${day.isFinal ? 'text-yellow-400' : 'text-cyan-400'}`}>
                    {day.date}
                  </p>
                  <p className={`text-xs ${day.isFinal ? 'text-yellow-400/80' : 'text-white/70'}`}>
                    {day.lottery}
                  </p>
                  {day.isFinal && (
                    <div className="mt-2 pt-2 border-t border-yellow-500/20">
                      <Trophy className="w-4 h-4 text-yellow-400 mx-auto" />
                      <p className="text-yellow-400 text-[10px] font-semibold">FINAL</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Premios Inmediatos */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="p-3 bg-yellow-500/20 rounded-xl w-fit">
              <Gift className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">Premios Inmediatos</h3>
              <p className="text-white/60 text-sm md:text-base">Números especiales que ganan al instante</p>
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 border-2">
            <CardContent className="p-6 md:p-10">
              <p className="text-white/80 text-center mb-8 text-base md:text-lg">
                Si al comprar te aparece uno de estos números, <span className="text-yellow-400 font-bold">¡ganas automáticamente!</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                {['000000', '200803', '351520', '291001', '170702'].map((num, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900/50 border border-yellow-500/30 rounded-xl p-3 md:p-4 text-center hover:bg-yellow-500/10 transition-colors"
                  >
                    <Diamond className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                    <p className="text-xl md:text-2xl font-bold text-yellow-400 font-mono">{num}</p>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/20 rounded-xl p-6 text-center border border-yellow-500/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-lg">Premio Inmediato</span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-white mb-1">$400.000</p>
                <p className="text-white/50">pesos colombianos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Final */}
        <div className="mt-16 md:mt-24 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-cyan-500/10 border border-cyan-500/20">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Diamond 
                  key={i} 
                  className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 animate-bounce" 
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">¿Listo para participar?</h3>
            <p className="text-white/60 max-w-md">
              Compra tus diamantes ahora y participa en los sorteos diarios, repechaje y el gran premio final.
            </p>
            <a 
              href="#planes"
              className="mt-4 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-full text-white font-semibold transition-all hover:scale-105"
            >
              Ver Planes de Diamantes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
