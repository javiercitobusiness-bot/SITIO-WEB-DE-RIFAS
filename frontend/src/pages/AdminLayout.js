import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';
import Diamond from '../components/Diamond';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  TrendingUp,
  DollarSign,
  Package,
  RefreshCw,
  Image,
  Mail,
  Instagram,
  Facebook,
  Phone,
  Globe,
  Save,
  ChevronRight
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// API helper
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Dashboard View
function DashboardView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const statCards = [
    { title: 'Ventas Hoy', value: formatCurrency(stats?.today_revenue), icon: TrendingUp, color: 'text-green-400' },
    { title: 'Total Ingresos', value: formatCurrency(stats?.total_revenue), icon: DollarSign, color: 'text-cyan-400' },
    { title: 'Compras Aprobadas', value: stats?.approved_purchases || 0, icon: Package, color: 'text-purple-400' },
    { title: 'Diamantes Vendidos', value: stats?.inventory?.sold_diamonds?.toLocaleString() || 0, icon: Diamond, color: 'text-yellow-400' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Ventas por Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.plan_stats?.length > 0 ? (
              <div className="space-y-4">
                {stats.plan_stats.map((plan) => (
                  <div key={plan._id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium capitalize">{plan._id}</p>
                      <p className="text-sm text-white/60">{plan.count} ventas</p>
                    </div>
                    <p className="text-cyan-400 font-semibold">{formatCurrency(plan.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-8">Sin ventas aún</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Estado del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">Total Diamantes</span>
                <span className="text-white font-medium">{stats?.inventory?.total_diamonds?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Vendidos</span>
                <span className="text-green-400 font-medium">{stats?.inventory?.sold_diamonds?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Disponibles</span>
                <span className="text-cyan-400 font-medium">{stats?.inventory?.available_diamonds?.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 mt-4">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-3 rounded-full"
                  style={{ width: `${stats?.inventory?.sold_percentage || 0}%` }}
                />
              </div>
              <p className="text-center text-sm text-white/60">
                {stats?.inventory?.sold_percentage?.toFixed(2)}% vendido
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Events View
function EventsView() {
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, templatesRes] = await Promise.all([
        api.get('/api/admin/events'),
        api.get('/api/admin/events/templates')
      ]);
      setEvents(eventsRes.data.events || []);
      setTemplates(templatesRes.data.templates || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (eventId) => {
    try {
      await api.post(`/api/admin/events/${eventId}/activate`);
      toast.success('Evento activado');
      fetchData();
    } catch (error) {
      toast.error('Error al activar evento');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
    
    try {
      await api.delete(`/api/admin/events/${eventId}`);
      toast.success('Evento eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar evento');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/50',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      paused: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      finished: 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    };
    return styles[status] || styles.draft;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-cyan-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Eventos</h2>
        <Button 
          className="bg-gradient-to-r from-cyan-500 to-purple-500"
          onClick={() => setShowCreateModal(true)}
          data-testid="create-event-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Evento
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-white/30 mb-4" />
            <p className="text-white/60">No hay eventos creados</p>
            <Button className="mt-4" variant="outline" onClick={() => setShowCreateModal(true)}>
              Crear primer evento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.event_id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                      <Badge className={getStatusBadge(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-white/60 text-sm mb-3">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-white/50">
                        Números: {event.sold_numbers?.toLocaleString() || 0} / {event.total_numbers?.toLocaleString()}
                      </span>
                      <span className="text-white/50">
                        Premios: {event.prizes?.length || 0}
                      </span>
                      <span className="text-white/50">
                        Planes: {event.plans?.length || 0}
                      </span>
                    </div>
                  </div>

                  {event.image_url && (
                    <img 
                      src={event.image_url} 
                      alt={event.name}
                      className="w-24 h-24 object-cover rounded-lg ml-4"
                    />
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                  {event.status !== 'active' && (
                    <Button
                      size="sm"
                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      onClick={() => handleActivate(event.event_id)}
                      data-testid={`activate-event-${event.event_id}`}
                    >
                      <Power className="w-4 h-4 mr-1" />
                      Activar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-white"
                    onClick={() => handleEdit(event)}
                    data-testid={`edit-event-${event.event_id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(event.event_id)}
                    data-testid={`delete-event-${event.event_id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEventModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        templates={templates}
        onSuccess={() => { setShowCreateModal(false); fetchData(); }}
      />

      <EditEventModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        event={editingEvent}
        onSuccess={() => { setShowEditModal(false); fetchData(); }}
      />
    </div>
  );
}

// Create Event Modal
function CreateEventModal({ open, onClose, templates, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: '',
    total_numbers: 1000000,
    price_per_number: 500,
    start_date: '',
    end_date: '',
    image_url: '',
    symbol_type: 'diamond',
    lottery_name: 'Lotería de Medellín'
  });
  const [loading, setLoading] = useState(false);

  const totalNumbersOptions = [
    { value: 100, label: '100 números' },
    { value: 1000, label: '1,000 números' },
    { value: 10000, label: '10,000 números' },
    { value: 100000, label: '100,000 números' },
    { value: 1000000, label: '1,000,000 números' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/admin/events', {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      });
      toast.success('Evento creado exitosamente');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <DialogDescription className="text-white/60">
            Configura los detalles de tu nueva dinámica
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Plantilla</Label>
            <Select 
              value={formData.template_id} 
              onValueChange={(value) => setFormData({...formData, template_id: value, symbol_type: value === 'estrellas' ? 'star' : 'diamond'})}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Selecciona una plantilla" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.icon} {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nombre del evento *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-slate-800 border-slate-700"
              placeholder="Ej: Marzo Lleno de Diamantes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-800 border-slate-700"
              placeholder="Descripción del evento..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha inicio *</Label>
              <Input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha fin *</Label>
              <Input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total de números</Label>
              <Select 
                value={formData.total_numbers.toString()} 
                onValueChange={(value) => setFormData({...formData, total_numbers: parseInt(value)})}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {totalNumbersOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Precio por número (COP)</Label>
              <Input
                type="number"
                value={formData.price_per_number}
                onChange={(e) => setFormData({...formData, price_per_number: parseInt(e.target.value)})}
                className="bg-slate-800 border-slate-700"
                min="100"
                max="10000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de símbolo</Label>
              <Select 
                value={formData.symbol_type} 
                onValueChange={(value) => setFormData({...formData, symbol_type: value})}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="diamond">💎 Diamantes</SelectItem>
                  <SelectItem value="star">⭐ Estrellas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lotería</Label>
              <Input
                value={formData.lottery_name}
                onChange={(e) => setFormData({...formData, lottery_name: e.target.value})}
                className="bg-slate-800 border-slate-700"
                placeholder="Lotería de Medellín"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              URL de imagen del premio
            </Label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="bg-slate-800 border-slate-700"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700">
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-purple-500" disabled={loading}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Crear Evento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Event Modal
function EditEventModal({ open, onClose, event, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const totalNumbersOptions = [
    { value: 100, label: '100 números' },
    { value: 1000, label: '1,000 números' },
    { value: 10000, label: '10,000 números' },
    { value: 100000, label: '100,000 números' },
    { value: 1000000, label: '1,000,000 números' }
  ];

  const prizeTypes = [
    { value: 'main', label: 'Premio Principal' },
    { value: 'repechaje', label: 'Repechaje' },
    { value: 'daily', label: 'Premio Diario (Derecho)' },
    { value: 'daily_inverse', label: 'Premio Diario (Inverso)' }
  ];

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        status: event.status || 'draft',
        image_url: event.image_url || '',
        prizes: event.prizes || [],
        plans: event.plans || [],
        price_per_number: event.price_per_number || 500,
        total_numbers: event.total_numbers || 1000000,
        symbol_type: event.symbol_type || 'diamond',
        lottery_name: event.lottery_name || ''
      });
    }
  }, [event]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/api/admin/events/${event.event_id}`, formData);
      toast.success('Evento actualizado');
      onSuccess();
    } catch (error) {
      toast.error('Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const addPrize = () => {
    setFormData({
      ...formData,
      prizes: [...(formData.prizes || []), { name: '', amount: 0, description: '', prize_type: 'main' }]
    });
  };

  const updatePrize = (index, field, value) => {
    const newPrizes = [...formData.prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setFormData({ ...formData, prizes: newPrizes });
  };

  const removePrize = (index) => {
    setFormData({
      ...formData,
      prizes: formData.prizes.filter((_, i) => i !== index)
    });
  };

  const addPlan = () => {
    setFormData({
      ...formData,
      plans: [...(formData.plans || []), { id: `plan_${Date.now()}`, name: '', price: 0, numbers_count: 0, description: '' }]
    });
  };

  const updatePlan = (index, field, value) => {
    const newPlans = [...formData.plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setFormData({ ...formData, plans: newPlans });
  };

  const removePlan = (index) => {
    setFormData({
      ...formData,
      plans: formData.plans.filter((_, i) => i !== index)
    });
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription className="text-white/60">{event.name}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="bg-slate-800 w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="config" className="flex-1">Configuración</TabsTrigger>
            <TabsTrigger value="prizes" className="flex-1">Premios</TabsTrigger>
            <TabsTrigger value="plans" className="flex-1">Planes</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="general" className="space-y-4 m-0">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="finished">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  URL de imagen del premio
                </Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="bg-slate-800 border-slate-700"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="w-full max-h-48 object-cover rounded-lg mt-2" />
                )}
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4 m-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total de números</Label>
                  <Select 
                    value={formData.total_numbers?.toString()} 
                    onValueChange={(value) => setFormData({...formData, total_numbers: parseInt(value)})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {totalNumbersOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Precio por número (COP)</Label>
                  <Input
                    type="number"
                    value={formData.price_per_number}
                    onChange={(e) => setFormData({...formData, price_per_number: parseInt(e.target.value)})}
                    className="bg-slate-800 border-slate-700"
                    min="100"
                    max="10000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de símbolo</Label>
                  <Select 
                    value={formData.symbol_type} 
                    onValueChange={(value) => setFormData({...formData, symbol_type: value})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="diamond">💎 Diamantes</SelectItem>
                      <SelectItem value="star">⭐ Estrellas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lotería para sorteo</Label>
                  <Input
                    value={formData.lottery_name}
                    onChange={(e) => setFormData({...formData, lottery_name: e.target.value})}
                    className="bg-slate-800 border-slate-700"
                    placeholder="Lotería de Medellín"
                  />
                </div>
              </div>

              <Card className="bg-slate-800/30 border-slate-700">
                <CardContent className="p-4">
                  <p className="text-sm text-white/60">
                    <strong>Cálculo automático:</strong> Con {formData.total_numbers?.toLocaleString()} números a ${formData.price_per_number?.toLocaleString()} COP cada uno, 
                    el total potencial de ventas es: <span className="text-green-400 font-semibold">${((formData.total_numbers || 0) * (formData.price_per_number || 0)).toLocaleString()} COP</span>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prizes" className="space-y-4 m-0">
              <div className="flex justify-between items-center">
                <Label>Premios del evento</Label>
                <Button size="sm" variant="outline" onClick={addPrize}>
                  <Plus className="w-4 h-4 mr-1" /> Agregar
                </Button>
              </div>

              {formData.prizes?.map((prize, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/60">Premio {index + 1}</span>
                      <Button size="sm" variant="ghost" className="text-red-400 h-6" onClick={() => removePrize(index)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Nombre del premio"
                      value={prize.name}
                      onChange={(e) => updatePrize(index, 'name', e.target.value)}
                      className="bg-slate-900 border-slate-700"
                    />
                    <Input
                      type="number"
                      placeholder="Valor"
                      value={prize.amount}
                      onChange={(e) => updatePrize(index, 'amount', parseInt(e.target.value) || 0)}
                      className="bg-slate-900 border-slate-700"
                    />
                    <Input
                      placeholder="Descripción"
                      value={prize.description}
                      onChange={(e) => updatePrize(index, 'description', e.target.value)}
                      className="bg-slate-900 border-slate-700"
                    />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="plans" className="space-y-4 m-0">
              <div className="flex justify-between items-center">
                <Label>Planes de compra</Label>
                <Button size="sm" variant="outline" onClick={addPlan}>
                  <Plus className="w-4 h-4 mr-1" /> Agregar
                </Button>
              </div>

              {formData.plans?.map((plan, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/60">Plan {index + 1}</span>
                      <Button size="sm" variant="ghost" className="text-red-400 h-6" onClick={() => removePlan(index)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Nombre del plan"
                      value={plan.name}
                      onChange={(e) => updatePlan(index, 'name', e.target.value)}
                      className="bg-slate-900 border-slate-700"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Precio"
                        value={plan.price}
                        onChange={(e) => updatePlan(index, 'price', parseInt(e.target.value) || 0)}
                        className="bg-slate-900 border-slate-700"
                      />
                      <Input
                        type="number"
                        placeholder="Cantidad de números"
                        value={plan.numbers_count}
                        onChange={(e) => updatePlan(index, 'numbers_count', parseInt(e.target.value) || 0)}
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                    <Input
                      placeholder="Descripción"
                      value={plan.description}
                      onChange={(e) => updatePlan(index, 'description', e.target.value)}
                      className="bg-slate-900 border-slate-700"
                    />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="border-slate-700">Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-cyan-500 to-purple-500" disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Purchases View
function PurchasesView() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await api.get('/api/admin/purchases');
      setPurchases(response.data.purchases || []);
    } catch (error) {
      toast.error('Error al cargar compras');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-cyan-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Compras</h2>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-white/60">Referencia</TableHead>
                <TableHead className="text-white/60">Cliente</TableHead>
                <TableHead className="text-white/60">Plan</TableHead>
                <TableHead className="text-white/60">Monto</TableHead>
                <TableHead className="text-white/60">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-white/60 py-8">
                    No hay compras registradas
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.reference} className="border-slate-700">
                    <TableCell className="font-mono text-sm text-white">{purchase.reference}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white">{purchase.customer_name}</p>
                        <p className="text-sm text-white/60">{purchase.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-white capitalize">{purchase.plan}</TableCell>
                    <TableCell className="text-cyan-400">{formatCurrency(purchase.amount)}</TableCell>
                    <TableCell>
                      <Badge className={purchase.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Customers View
function CustomersView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/admin/customers');
      setCustomers(response.data.customers || []);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-cyan-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Clientes</h2>

      <div className="grid gap-4">
        {customers.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-white/30 mb-4" />
              <p className="text-white/60">No hay clientes registrados</p>
            </CardContent>
          </Card>
        ) : (
          customers.map((customer) => (
            <Card key={customer._id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{customer.name}</p>
                    <p className="text-sm text-white/60">{customer._id}</p>
                    {customer.phone && <p className="text-sm text-white/50">{customer.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-semibold">{formatCurrency(customer.total_spent)}</p>
                    <p className="text-sm text-white/60">{customer.total_diamonds} diamantes</p>
                    <p className="text-xs text-white/50">{customer.total_purchases} compras</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Site Settings View
function SiteSettingsView() {
  const [settings, setSettings] = useState({
    contact_email: 'soportedinamicadiamantes@gmail.com',
    contact_phone: '+57 300 123 4567',
    instagram_url: '',
    facebook_url: '',
    whatsapp_number: '',
    site_name: 'Dinámica de Diamantes'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings');
      if (response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {
      // Settings may not exist yet, use defaults
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/api/admin/settings', settings);
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Configuración del Sitio</h2>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del sitio</Label>
            <Input
              value={settings.site_name}
              onChange={(e) => setSettings({...settings, site_name: e.target.value})}
              className="bg-slate-900 border-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email de contacto</Label>
            <Input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
              className="bg-slate-900 border-slate-700"
              placeholder="contacto@tudominio.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={settings.contact_phone}
              onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
              className="bg-slate-900 border-slate-700"
              placeholder="+57 300 123 4567"
            />
          </div>

          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
              className="bg-slate-900 border-slate-700"
              placeholder="+573001234567"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Redes Sociales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Instagram URL</Label>
            <Input
              value={settings.instagram_url}
              onChange={(e) => setSettings({...settings, instagram_url: e.target.value})}
              className="bg-slate-900 border-slate-700"
              placeholder="https://instagram.com/tucuenta"
            />
          </div>

          <div className="space-y-2">
            <Label>Facebook URL</Label>
            <Input
              value={settings.facebook_url}
              onChange={(e) => setSettings({...settings, facebook_url: e.target.value})}
              className="bg-slate-900 border-slate-700"
              placeholder="https://facebook.com/tupagina"
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
        disabled={loading}
        data-testid="save-settings-button"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Guardar Configuración
      </Button>
    </div>
  );
}

// Payment Gateways View
function PaymentGatewaysView() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const response = await api.get('/api/admin/payment-gateways');
      setGateways(response.data.gateways || []);
    } catch (error) {
      toast.error('Error al cargar pasarelas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-cyan-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Pasarelas de Pago</h2>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">BOLD</h3>
              <p className="text-sm text-white/60">Pasarela de pagos principal</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400">Activo</Badge>
          </div>
          <p className="text-sm text-white/50 mt-4">
            Las credenciales de BOLD están configuradas en las variables de entorno del servidor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Admin Layout
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/dashboard/events', icon: Calendar, label: 'Eventos' },
    { path: '/admin/dashboard/purchases', icon: CreditCard, label: 'Compras' },
    { path: '/admin/dashboard/customers', icon: Users, label: 'Clientes' },
    { path: '/admin/dashboard/payments', icon: DollarSign, label: 'Pasarelas' },
    { path: '/admin/dashboard/settings', icon: Settings, label: 'Configuración' }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <Diamond className="w-8 h-8 text-cyan-400" />
          <span className="text-lg font-bold text-white">Admin</span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/admin/dashboard' && location.pathname === '/admin/dashboard');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-white/60 hover:text-white hover:bg-slate-800'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-950 border-b border-slate-800 p-4 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Diamond className="w-6 h-6 text-cyan-400" />
            <span className="font-bold text-white">Admin</span>
          </div>
          <Button size="sm" variant="ghost" onClick={handleLogout} className="text-red-400">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="mt-4">
          <div className="flex gap-2 pb-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  location.pathname === item.path
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-800 text-white/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 mt-24 md:mt-0 overflow-auto">
        <Routes>
          <Route index element={<DashboardView />} />
          <Route path="events" element={<EventsView />} />
          <Route path="purchases" element={<PurchasesView />} />
          <Route path="customers" element={<CustomersView />} />
          <Route path="payments" element={<PaymentGatewaysView />} />
          <Route path="settings" element={<SiteSettingsView />} />
        </Routes>
      </main>
    </div>
  );
}
