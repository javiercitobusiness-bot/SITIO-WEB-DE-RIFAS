import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Diamond from '../components/Diamond';
import PricingPlans from '../components/PricingPlans';
import PrizeInfo from '../components/PrizeInfo';
import Testimonials from '../components/Testimonials';
import HowItWorks from '../components/HowItWorks';
import FloatingBuyButton from '../components/FloatingBuyButton';
import CheckoutModal from '../components/CheckoutModal';
import NumbersModal from '../components/NumbersModal';
import { Progress } from '../components/ui/progress';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, Bell, ChevronRight, Star } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Home() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [plans, setPlans] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, plansRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/events/available`).catch(() => ({ data: { events: [] } })),
        axios.get(`${API_URL}/api/plans`),
        axios.get(`${API_URL}/api/inventory/stats`)
      ]);
      
      const availableEvents = eventsRes.data.events || [];
      setEvents(availableEvents);
      
      // Always show list view first, let user choose event
      setViewMode('list');
      
      setPlans(plansRes.data);
      setInventoryStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedEvent(null);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePurchaseComplete = (result) => {
    setPurchaseResult(result);
    setShowCheckout(false);
    if (result.payment_link) {
      window.location.href = result.payment_link;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getSymbolIcon = (symbolType) => {
    return symbolType === 'star' ? Star : Diamond;
  };

  const soldPercentage = inventoryStats 
    ? ((inventoryStats.sold_diamonds / inventoryStats.total_diamonds) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Diamond className="w-20 h-20 mx-auto animate-pulse text-cyan-400" />
          <p className="mt-4 text-white/70">Cargando...</p>
        </div>
      </div>
    );
  }

  // No events available
  if (events.length === 0 && !selectedEvent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-lg w-full bg-slate-900/80 border-slate-800">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Bell className="w-10 h-10 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                No hay eventos disponibles
              </h2>
              <p className="text-white/60 mb-6">
                Actualmente no tenemos dinámicas activas. ¡Vuelve pronto para participar en nuestros próximos eventos con increíbles premios!
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className="border-cyan-500/50 text-cyan-400"
                  onClick={() => window.location.reload()}
                >
                  Verificar nuevamente
                </Button>
                <p className="text-sm text-white/40">
                  Síguenos en redes sociales para enterarte de nuevos eventos
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Show events list (always, even with 1 event)
  if (viewMode === 'list' && events.length >= 1) {
    return (
      <div 
        className="min-h-screen flex flex-col relative"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_505a1cf0-f386-4557-82ed-0a2645c1e05e/artifacts/2586drue_image.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />
        
        <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-6 md:py-12 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Hero Section - Optimizado para móvil */}
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
                <Diamond className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-xs font-medium">Dinámica de Diamantes</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                Eventos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Disponibles</span>
              </h1>
              <p className="text-white/60 text-sm md:text-lg max-w-xl mx-auto px-4">
                Elige el evento en el que deseas participar
              </p>
            </div>

            {/* Events Grid - Diseño móvil mejorado */}
            <div className="grid gap-4 md:gap-6">
              {events.map((event) => {
                const SymbolIcon = getSymbolIcon(event.symbol_type);
                const mainPrize = event.prizes?.find(p => p.prize_type === 'main');
                const totalPrizes = event.prizes?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
                const isActive = event.status === 'active';
                
                return (
                  <Card 
                    key={event.id}
                    data-testid={`event-card-${event.id}`}
                    className={`relative overflow-hidden border-2 transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                      isActive 
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 hover:border-cyan-400' 
                        : 'bg-slate-900/50 border-slate-700/50 opacity-80'
                    }`}
                    onClick={() => handleSelectEvent(event)}
                  >
                    {/* Glow effect for active events */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
                    )}
                    
                    <CardContent className="p-0 relative">
                      {/* Mobile-first layout */}
                      <div className="flex flex-col">
                        {/* Image/Icon Header */}
                        <div className="relative h-40 md:h-48 overflow-hidden">
                          {event.image_url ? (
                            <img 
                              src={event.image_url} 
                              alt={event.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-slate-900 flex items-center justify-center">
                              <div className="relative">
                                <div className="absolute inset-0 blur-2xl bg-cyan-400/30 rounded-full scale-150" />
                                <SymbolIcon className="w-16 h-16 md:w-20 md:h-20 text-cyan-400 relative z-10 animate-pulse" />
                              </div>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge className={`px-3 py-1 text-xs font-semibold shadow-lg ${
                              event.status === 'active' ? 'bg-green-500 text-white' :
                              event.status === 'paused' ? 'bg-yellow-500 text-black' :
                              event.status === 'finished' ? 'bg-slate-600 text-white' :
                              'bg-blue-500 text-white'
                            }`}>
                              {event.status === 'active' ? '🟢 ACTIVO' :
                               event.status === 'paused' ? '⏸️ PAUSADO' :
                               event.status === 'finished' ? 'FINALIZADO' :
                               'BORRADOR'}
                            </Badge>
                          </div>
                          
                          {/* Prize overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent p-4 pt-8">
                            <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Premio Principal</p>
                            <p className="text-3xl md:text-4xl font-black text-white">
                              ${mainPrize?.amount?.toLocaleString() || totalPrizes.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 md:p-6">
                          {/* Title */}
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                            {event.name}
                          </h3>
                          <p className="text-white/60 text-sm mb-4 line-clamp-2">
                            {event.description}
                          </p>
                          
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Total Premios</p>
                              <p className="text-lg font-bold text-yellow-400">${(totalPrizes/1000000).toFixed(0)}M</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Números</p>
                              <p className="text-lg font-bold text-cyan-400">{(event.total_numbers/1000).toFixed(0)}K</p>
                            </div>
                          </div>
                          
                          {/* Dates */}
                          <div className="flex items-center gap-2 text-white/50 text-xs mb-4">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                          </div>
                          
                          {/* CTA Button */}
                          <Button 
                            className={`w-full py-6 text-base font-semibold rounded-xl transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg shadow-cyan-500/25'
                                : 'bg-slate-700 text-white/70'
                            }`}
                            disabled={!isActive}
                          >
                            {isActive ? (
                              <>
                                <span>Participar Ahora</span>
                                <ChevronRight className="w-5 h-5 ml-2" />
                              </>
                            ) : (
                              <span>Evento {event.status === 'finished' ? 'Finalizado' : 'No Disponible'}</span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <p className="text-white/40 text-sm">
                Haz clic en un evento para ver los detalles y participar
              </p>
            </div>
          </div>
        </main>
        <Footer />
        </div>
      </div>
    );
  }

  // Single event detail view
  const event = selectedEvent || events[0];
  const SymbolIcon = getSymbolIcon(event?.symbol_type);
  const mainPrize = event?.prizes?.find(p => p.prize_type === 'main');
  const totalPrizes = event?.prizes?.reduce((sum, p) => sum + (p.amount || 0), 0) || 150000000;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="flex-1">
        {/* Back button if multiple events */}
        {events.length > 1 && (
          <div className="sticky top-16 z-40 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <Button 
                variant="ghost" 
                className="text-white/60 hover:text-white text-sm"
                onClick={handleBackToList}
              >
                ← Ver todos los eventos
              </Button>
            </div>
          </div>
        )}

        {/* Hero Section - Mobile Optimized */}
        <section className="relative py-8 md:py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center">
              {/* Event Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
                <SymbolIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-xs font-medium uppercase tracking-wider">
                  {event?.name || 'EVENTO ACTIVO'}
                </span>
              </div>
              
              {/* Main Prize */}
              <h1 className="text-4xl md:text-6xl font-black text-white mb-2">
                Gana
              </h1>
              <p className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 mb-4">
                ${(mainPrize?.amount || totalPrizes).toLocaleString()}
              </p>
              
              <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto mb-6 px-4">
                {event?.description || 'Compra tus diamantes y participa por increíbles premios'}
              </p>

              {/* Date Badge */}
              {event?.start_date && event?.end_date && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 text-white/60 text-sm mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="max-w-sm mx-auto mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Vendidos</span>
                  <span className="text-cyan-400 font-bold">{soldPercentage}%</span>
                </div>
                <div className="relative">
                  <Progress value={parseFloat(soldPercentage)} className="h-4 bg-slate-800 rounded-full" />
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2 text-center">
                  {inventoryStats?.sold_diamonds?.toLocaleString() || 0} de {inventoryStats?.total_diamonds?.toLocaleString() || '1,000,000'} números
                </p>
              </div>

              {/* Floating Symbols */}
              <div className="flex justify-center gap-3 md:gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s`, animationDuration: '2.5s' }}
                  >
                    <SymbolIcon className="w-8 h-8 md:w-12 md:h-12 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Prizes Section - con imágenes integradas */}
        <PrizeInfo event={event} />

        {/* Pricing Plans */}
        <PricingPlans plans={event?.plans || plans} onSelectPlan={handleSelectPlan} symbolType={event?.symbol_type} />

        {/* Testimonials */}
        <Testimonials />

        {/* Simple Steps */}
        <section className="py-12 md:py-16 px-4 bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 md:mb-12">
              ¿Cómo Participar?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: 1, title: 'Elige tu Plan', desc: 'Selecciona la cantidad de números que deseas', icon: '🎯' },
                { step: 2, title: 'Paga Seguro', desc: 'Usa BOLD o Mercado Pago', icon: '💳' },
                { step: 3, title: 'Recibe tus Números', desc: 'Te llegará un email con tus diamantes', icon: '💎' }
              ].map((item) => (
                <div key={item.step} className="text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modals */}
      <CheckoutModal
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        plan={selectedPlan}
        onComplete={handlePurchaseComplete}
        event={event}
      />

      <NumbersModal
        open={showNumbers}
        onClose={() => setShowNumbers(false)}
        result={purchaseResult}
      />

      {/* Botón flotante de comprar */}
      <FloatingBuyButton onClick={() => {
        document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' });
      }} />
    </div>
  );
}
