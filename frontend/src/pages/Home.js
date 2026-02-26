import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Diamond from '../components/Diamond';
import PricingPlans from '../components/PricingPlans';
import PrizeInfo from '../components/PrizeInfo';
import Testimonials from '../components/Testimonials';
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
      
      // If only one event, select it automatically
      if (availableEvents.length === 1) {
        setSelectedEvent(availableEvents[0]);
        setViewMode('detail');
      }
      
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

  // Multiple events - show list
  if (viewMode === 'list' && events.length > 1) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Eventos Disponibles
              </h1>
              <p className="text-white/60">
                Elige el evento en el que deseas participar
              </p>
            </div>

            <div className="grid gap-6">
              {events.map((event) => {
                const SymbolIcon = getSymbolIcon(event.symbol_type);
                return (
                  <Card 
                    key={event.id}
                    className="bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
                    onClick={() => handleSelectEvent(event)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {event.image_url ? (
                          <img 
                            src={event.image_url} 
                            alt={event.name}
                            className="w-32 h-32 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                            <SymbolIcon className="w-16 h-16 text-cyan-400" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge className="mb-2 bg-green-500/20 text-green-400">
                                Activo
                              </Badge>
                              <h3 className="text-xl font-bold text-white mb-2">
                                {event.name}
                              </h3>
                              <p className="text-white/60 text-sm mb-3">
                                {event.description}
                              </p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-white/30 group-hover:text-cyan-400 transition-colors" />
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1 text-white/50">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.start_date)} - {formatDate(event.end_date)}
                            </span>
                            <span className="text-cyan-400 font-semibold">
                              {event.total_numbers?.toLocaleString()} números
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Single event detail view
  const event = selectedEvent || events[0];
  const SymbolIcon = getSymbolIcon(event?.symbol_type);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Back button if multiple events */}
        {events.length > 1 && (
          <div className="max-w-6xl mx-auto px-4 pt-4">
            <Button 
              variant="ghost" 
              className="text-white/60 hover:text-white"
              onClick={handleBackToList}
            >
              ← Ver todos los eventos
            </Button>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative py-12 md:py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <SymbolIcon className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">
                  {event?.name || 'MARZO LLENO DE DIAMANTES'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Gana <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">$150.000.000</span>
              </h1>
              
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-4">
                {event?.description || 'Compra tus diamantes numerados y participa por increíbles premios en efectivo.'}
              </p>

              {event?.start_date && event?.end_date && (
                <div className="flex items-center justify-center gap-2 text-white/50 mb-8">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">
                    {event?.symbol_type === 'star' ? 'Estrellas' : 'Diamantes'} vendidos
                  </span>
                  <span className="text-cyan-400 font-semibold">{soldPercentage}%</span>
                </div>
                <Progress value={parseFloat(soldPercentage)} className="h-3 bg-slate-800" />
                <p className="text-xs text-white/40 mt-2">
                  {inventoryStats?.sold_diamonds?.toLocaleString() || 0} de {inventoryStats?.total_diamonds?.toLocaleString() || '1,000,000'}
                </p>
              </div>
            </div>

            {/* Floating Symbols Animation */}
            <div className="flex justify-center gap-4 mb-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s`, animationDuration: '2s' }}
                >
                  <SymbolIcon className="w-10 h-10 md:w-14 md:h-14 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prizes Section */}
        <PrizeInfo event={event} />

        {/* Pricing Plans */}
        <PricingPlans plans={event?.plans || plans} onSelectPlan={handleSelectPlan} symbolType={event?.symbol_type} />

        {/* How it Works */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              ¿Cómo Participar?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: 'Elige tu Plan', desc: 'Selecciona el plan que mejor se adapte a ti' },
                { step: 2, title: 'Realiza el Pago', desc: 'Paga de forma segura con tu método preferido' },
                { step: 3, title: 'Recibe tus Números', desc: `Te enviaremos tus ${event?.symbol_type === 'star' ? 'estrellas' : 'diamantes'} numerados al correo` }
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
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
    </div>
  );
}
