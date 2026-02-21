import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Diamond from '../components/Diamond';
import PricingPlans from '../components/PricingPlans';
import PrizeInfo from '../components/PrizeInfo';
import CheckoutModal from '../components/CheckoutModal';
import NumbersModal from '../components/NumbersModal';
import { Progress } from '../components/ui/progress';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Home() {
  const [event, setEvent] = useState(null);
  const [plans, setPlans] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventRes, plansRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/event/active`),
        axios.get(`${API_URL}/api/plans`),
        axios.get(`${API_URL}/api/inventory/stats`)
      ]);
      
      setEvent(eventRes.data.event);
      setPlans(plansRes.data);
      setInventoryStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Diamond className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">
                  {event?.name || 'MARZO LLENO DE DIAMANTES'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Gana <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">$150.000.000</span>
              </h1>
              
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
                Compra tus diamantes numerados y participa por increíbles premios en efectivo.
                Cada diamante es una oportunidad de ganar.
              </p>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Diamantes vendidos</span>
                  <span className="text-cyan-400 font-semibold">{soldPercentage}%</span>
                </div>
                <Progress value={parseFloat(soldPercentage)} className="h-3 bg-slate-800" />
                <p className="text-xs text-white/40 mt-2">
                  {inventoryStats?.sold_diamonds?.toLocaleString() || 0} de {inventoryStats?.total_diamonds?.toLocaleString() || '1,000,000'} diamantes
                </p>
              </div>
            </div>

            {/* Floating Diamonds Animation */}
            <div className="flex justify-center gap-4 mb-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s`, animationDuration: '2s' }}
                >
                  <Diamond className="w-10 h-10 md:w-14 md:h-14 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prizes Section */}
        <PrizeInfo event={event} />

        {/* Pricing Plans */}
        <PricingPlans plans={plans} onSelectPlan={handleSelectPlan} />

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
                { step: 3, title: 'Recibe tus Números', desc: 'Te enviaremos tus diamantes numerados al correo' }
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
      />

      <NumbersModal
        open={showNumbers}
        onClose={() => setShowNumbers(false)}
        result={purchaseResult}
      />
    </div>
  );
}
