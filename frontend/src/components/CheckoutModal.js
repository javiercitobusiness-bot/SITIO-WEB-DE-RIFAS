import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import Diamond from './Diamond';
import { Loader2, CreditCard, Mail, User, Phone } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CheckoutModal({ open, onClose, plan, onComplete }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    discount_code: '',
    influencer_code: '',
    payment_method: 'bold'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [discountApplied, setDiscountApplied] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const [extraDiamonds, setExtraDiamonds] = useState(0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const validateDiscount = async () => {
    if (!formData.discount_code) return;
    try {
      const response = await axios.post(`${API_URL}/api/validate-discount`, {
        code: formData.discount_code
      });
      if (response.data.valid) {
        setDiscountApplied(response.data.discount_percent);
        setFinalPrice(Math.round(plan.price * (100 - response.data.discount_percent) / 100));
        toast.success(`¡Descuento del ${response.data.discount_percent}% aplicado!`);
      } else {
        setDiscountApplied(null);
        setFinalPrice(null);
        toast.error('Código inválido');
      }
    } catch (error) {
      toast.error('Error al validar código');
    }
  };

  const validateInfluencerCode = async () => {
    if (!formData.influencer_code) return;
    try {
      const response = await axios.post(`${API_URL}/api/validate-influencer-code`, {
        code: formData.influencer_code
      });
      if (response.data.valid) {
        setExtraDiamonds(response.data.extra_diamonds);
        toast.success(`¡Código de ${response.data.influencer_name || 'influencer'} aplicado! +${response.data.extra_diamonds} diamantes extra`);
      } else {
        setExtraDiamonds(0);
        toast.error(response.data.message || 'Código inválido');
      }
    } catch (error) {
      toast.error('Error al validar código');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_name || formData.customer_name.length < 2) {
      newErrors.customer_name = 'Nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email inválido';
    }
    
    if (!formData.customer_phone || formData.customer_phone.length < 7) {
      newErrors.customer_phone = 'Teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Si es código de prueba TESTDEMO, usar endpoint especial
      const isTestMode = formData.discount_code?.toUpperCase() === 'TESTDEMO';
      const endpoint = isTestMode ? `${API_URL}/api/purchase/test` : `${API_URL}/api/purchase`;
      
      const response = await axios.post(endpoint, {
        plan: plan.id,
        ...formData
      });
      
      // Si es modo prueba, mostrar resultados directamente
      if (isTestMode && response.data.status === 'test_completed') {
        toast.success('¡Compra de PRUEBA completada! Email enviado.');
        // Redirigir a página de éxito con los diamantes de prueba
        localStorage.setItem('lastPurchaseReference', response.data.reference);
        window.location.href = `/compra-exitosa?reference=${response.data.reference}`;
        return;
      }
      
      // Guardar referencia para procesar después del pago
      if (response.data.payment_reference) {
        localStorage.setItem('lastPurchaseReference', response.data.payment_reference);
      }
      
      toast.success('Redirigiendo al pago...');
      onComplete(response.data);
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.detail || 'Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md max-h-[90vh] overflow-y-auto mx-4 rounded-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Diamond className="w-5 h-5 text-cyan-400" />
            Completar Compra
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Completa tus datos para continuar
          </DialogDescription>
        </DialogHeader>

        {/* Plan Summary - Compact */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 mb-4 border border-cyan-500/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-white">{plan.name}</p>
              <p className="text-sm text-cyan-400">{plan.diamonds_count || plan.numbers_count} diamantes</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{formatCurrency(plan.price)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="customer_name"
                name="customer_name"
                type="text"
                placeholder="Tu nombre"
                value={formData.customer_name}
                onChange={handleChange}
                className={`pl-10 bg-slate-800 border-slate-700 text-white ${errors.customer_name ? 'border-red-500' : ''}`}
                data-testid="checkout-name-input"
              />
            </div>
            {errors.customer_name && (
              <p className="text-red-400 text-xs">{errors.customer_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="customer_email"
                name="customer_email"
                type="email"
                placeholder="tu@email.com"
                value={formData.customer_email}
                onChange={handleChange}
                className={`pl-10 bg-slate-800 border-slate-700 text-white ${errors.customer_email ? 'border-red-500' : ''}`}
                data-testid="checkout-email-input"
              />
            </div>
            {errors.customer_email && (
              <p className="text-red-400 text-xs">{errors.customer_email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="customer_phone"
                name="customer_phone"
                type="tel"
                placeholder="+57 300 123 4567"
                value={formData.customer_phone}
                onChange={handleChange}
                className={`pl-10 bg-slate-800 border-slate-700 text-white ${errors.customer_phone ? 'border-red-500' : ''}`}
                data-testid="checkout-phone-input"
              />
            </div>
            {errors.customer_phone && (
              <p className="text-red-400 text-xs">{errors.customer_phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_code">Código de descuento (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="discount_code"
                name="discount_code"
                type="text"
                placeholder="CODIGO"
                value={formData.discount_code}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white uppercase"
              />
              <Button type="button" onClick={validateDiscount} variant="outline" className="border-cyan-500 text-cyan-400">
                Aplicar
              </Button>
            </div>
            {discountApplied && (
              <p className="text-green-400 text-sm">✓ Descuento {discountApplied}% aplicado - Pagas: {formatCurrency(finalPrice)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="influencer_code">Código de influencer (diamantes extra)</Label>
            <div className="flex gap-2">
              <Input
                id="influencer_code"
                name="influencer_code"
                type="text"
                placeholder="INFLUENCER"
                value={formData.influencer_code}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white uppercase"
              />
              <Button type="button" onClick={validateInfluencerCode} variant="outline" className="border-green-500 text-green-400">
                Aplicar
              </Button>
            </div>
            {extraDiamonds > 0 && (
              <p className="text-green-400 text-sm">✓ ¡+{extraDiamonds} diamantes extra! Total: {plan?.diamonds + extraDiamonds} diamantes</p>
            )}
          </div>

          {/* Selección de método de pago */}
          <div className="space-y-3">
            <Label>Método de pago</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, payment_method: 'bold'})}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.payment_method === 'bold' 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">💳</div>
                  <p className="text-white font-semibold text-sm">BOLD</p>
                  <p className="text-white/50 text-xs">Tarjeta, PSE, Nequi</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, payment_method: 'mercadopago'})}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.payment_method === 'mercadopago' 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🔵</div>
                  <p className="text-white font-semibold text-sm">Mercado Pago</p>
                  <p className="text-white/50 text-xs">Todas las opciones</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-slate-700 text-white hover:bg-slate-800"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              disabled={loading}
              data-testid="checkout-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pagar {formatCurrency(plan.price)}
                </>
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-white/40 text-center mt-4">
          Al continuar, serás redirigido a BOLD para completar tu pago de forma segura.
        </p>
      </DialogContent>
    </Dialog>
  );
}
