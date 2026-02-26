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
    discount_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [discountApplied, setDiscountApplied] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);

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
      const response = await axios.post(`${API_URL}/api/purchase`, {
        plan: plan.id,
        ...formData
      });
      
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
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Diamond className="w-6 h-6 text-cyan-400" />
            Completar Compra
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Completa tus datos para continuar con el pago
          </DialogDescription>
        </DialogHeader>

        {/* Plan Summary */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{plan.name}</p>
              <p className="text-sm text-cyan-400">{plan.diamonds_count} diamantes</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{formatCurrency(plan.price)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
