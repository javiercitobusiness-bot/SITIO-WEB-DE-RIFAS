import React from 'react';
import { Card, CardContent } from './ui/card';
import { Calendar, Calculator, RefreshCw, Gift, Trophy } from 'lucide-react';

export default function HowItWorks() {
  const lotteryCalendar = [
    { date: '9 DE MARZO', lotteries: ['Lotería del Tolima'], hasLottery: true },
    { date: '10 DE MARZO', lotteries: ['Sin sorteo'], hasLottery: false },
    { date: '11 DE MARZO', lotteries: ['Lotería del Meta', 'Lotería de Manizales'], hasLottery: true },
    { date: '12 DE MARZO', lotteries: ['Lotería del Quindío', 'Lotería de Bogotá'], hasLottery: true },
    { date: '13 DE MARZO', lotteries: ['Lotería de Medellín', 'Lotería del Risaralda'], hasLottery: true },
    { date: '14 DE MARZO', lotteries: ['Lotería de Boyacá'], hasLottery: true },
    { date: '15 DE MARZO', lotteries: ['Sin sorteo'], hasLottery: false },
    { date: '16 DE MARZO', lotteries: ['Lotería del Tolima'], hasLottery: true },
    { date: '17 DE MARZO', lotteries: ['Sin sorteo'], hasLottery: false },
    { date: '18 DE MARZO', lotteries: ['Lotería de Medellín', 'Premio Final'], hasLottery: true, isFinal: true },
  ];

  const instantPrizeNumbers = ['000000', '200803', '351520', '291001', '170702'];

  return (
    <section id="como-funciona" className="py-20 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Cómo Funciona el Juego?
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Conoce las reglas, el calendario de sorteos y cómo se determinan los ganadores
          </p>
        </div>

        {/* SECCION 1: Calendario */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <Calendar className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Orden de las Loterías</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {lotteryCalendar.map((day, idx) => (
              <Card 
                key={idx} 
                className={`border ${
                  day.isFinal 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30' 
                    : day.hasLottery 
                    ? 'bg-slate-800/50 border-slate-700' 
                    : 'bg-slate-900/30 border-slate-800'
                }`}
              >
                <CardContent className="p-4 text-center">
                  <p className={`font-bold text-sm mb-2 ${day.isFinal ? 'text-yellow-400' : 'text-cyan-400'}`}>
                    {day.date}
                  </p>
                  {day.lotteries.map((lottery, i) => (
                    <p 
                      key={i} 
                      className={`text-xs ${
                        lottery === 'Sin sorteo' 
                          ? 'text-white/30' 
                          : lottery === 'Premio Final'
                          ? 'text-yellow-400 font-semibold'
                          : 'text-white/70'
                      }`}
                    >
                      {lottery}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SECCION 2: Cálculo del número */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Calculator className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Cómo se Calcula el Número Ganador</h3>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 md:p-8">
              <p className="text-white/80 mb-6">
                Los diamantes premiados tienen <span className="text-cyan-400 font-bold">6 cifras</span>. 
                El número ganador se obtiene así:
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0">1</span>
                  <p className="text-white/70">Se toma el número ganador de la lotería <span className="text-white">(4 cifras)</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0">2</span>
                  <p className="text-white/70">Se toman los últimos <span className="text-white">2 números de la serie</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0">3</span>
                  <p className="text-white/70">Se juntan para formar un <span className="text-white">número de 6 cifras</span></p>
                </div>
              </div>

              {/* Ejemplo visual */}
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <p className="text-white/50 text-sm mb-4 text-center">EJEMPLO</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                  <div className="text-center">
                    <p className="text-white/50 text-xs mb-1">Número ganador</p>
                    <p className="text-3xl font-bold text-white font-mono">5264</p>
                  </div>
                  <span className="text-2xl text-white/30">+</span>
                  <div className="text-center">
                    <p className="text-white/50 text-xs mb-1">Serie (últimos 2)</p>
                    <p className="text-3xl font-bold text-white font-mono">2<span className="text-cyan-400">31</span></p>
                  </div>
                  <span className="text-2xl text-white/30">=</span>
                  <div className="text-center">
                    <p className="text-white/50 text-xs mb-1">Número final</p>
                    <p className="text-3xl font-bold text-cyan-400 font-mono">526431</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECCION 3: Número Inverso */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <RefreshCw className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Número Inverso</h3>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 md:p-8">
              <p className="text-white/80 mb-6">
                ¡También gana el <span className="text-green-400 font-bold">número inverso</span>! 
                Si tienes cualquiera de los dos números, ganas el premio.
              </p>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <p className="text-white/50 text-sm mb-4 text-center">EJEMPLO</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                  <div className="text-center">
                    <p className="text-white/50 text-xs mb-2">Número ganador</p>
                    <p className="text-4xl font-bold text-cyan-400 font-mono">526431</p>
                  </div>
                  <div className="hidden md:block">
                    <RefreshCw className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/50 text-xs mb-2">Número inverso</p>
                    <p className="text-4xl font-bold text-green-400 font-mono">134625</p>
                  </div>
                </div>
                <p className="text-center text-white/50 text-sm mt-6">
                  Ambos números ganan el mismo premio
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECCION 4: Premios Inmediatos */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Gift className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Premios Inmediatos</h3>
          </div>
          
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="p-6 md:p-8">
              <p className="text-white/80 mb-6">
                Existen números con <span className="text-yellow-400 font-bold">premio inmediato</span>. 
                Si al comprar te aparece uno de estos números, ¡ganas automáticamente!
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {instantPrizeNumbers.map((num, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900/50 border border-yellow-500/30 rounded-xl p-4 text-center"
                  >
                    <p className="text-2xl font-bold text-yellow-400 font-mono">{num}</p>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/20 rounded-xl p-4 text-center border border-yellow-500/30">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">Premio Inmediato</span>
                </div>
                <p className="text-3xl font-bold text-white">$400.000</p>
                <p className="text-white/50 text-sm">pesos colombianos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
