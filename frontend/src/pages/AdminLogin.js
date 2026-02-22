import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import Diamond from '../components/Diamond';
import { Lock, User, Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
    
    // Check for reset token
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setMode('reset');
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        username,
        password
      });

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        toast.success('Bienvenido al panel de administración');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/admin/request-password-reset`, { email });
      toast.success('Si el correo es válido, recibirás instrucciones para restablecer tu contraseña');
      setMode('login');
    } catch (error) {
      toast.success('Si el correo es válido, recibirás instrucciones para restablecer tu contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    setLoading(true);

    try {
      const token = searchParams.get('token');
      await axios.post(`${API_URL}/api/admin/reset-password`, {
        token,
        new_password: newPassword
      });
      toast.success('Contraseña restablecida exitosamente');
      setMode('login');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Form
  if (mode === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Diamond className="w-16 h-16 text-cyan-400" />
            </div>
            <CardTitle className="text-2xl text-white">Nueva Contraseña</CardTitle>
            <CardDescription className="text-slate-400">
              Ingresa tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPwd"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="showPwd" className="text-sm text-white/60 cursor-pointer">
                  Mostrar contraseñas
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Restablecer Contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Forgot Password Form
  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Diamond className="w-16 h-16 text-cyan-400" />
            </div>
            <CardTitle className="text-2xl text-white">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-slate-400">
              Ingresa el correo de recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>

              <Button 
                type="button"
                variant="ghost"
                className="w-full text-white/60"
                onClick={() => setMode('login')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login Form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Diamond className="w-16 h-16 text-cyan-400" />
          </div>
          <CardTitle className="text-2xl text-white">Panel de Administración</CardTitle>
          <CardDescription className="text-slate-400">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  required
                  data-testid="admin-username-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  required
                  data-testid="admin-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              disabled={loading}
              data-testid="admin-login-button"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>

            <button 
              type="button"
              className="w-full text-sm text-cyan-400 hover:text-cyan-300"
              onClick={() => setMode('forgot')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-cyan-400 hover:text-cyan-300">
              Volver al sitio principal
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
