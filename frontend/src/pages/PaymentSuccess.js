import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Mail, Home, Diamond } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full bg-slate-900/80 border-slate-800 shadow-2xl">
          <CardContent className="pt-10 pb-10 text-center">
            {/* Success Icon */}
            <div className="relative mx-auto mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
                <CheckCircle className="w-14 h-14 text-green-400" />
              </div>
              <div className="absolute -top-2 -right-4 animate-bounce">
                <Diamond className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-3">
              ¡Compra Exitosa!
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg text-green-400 font-medium mb-6">
              Tu pago ha sido procesado correctamente
            </p>
            
            {/* Info Box */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-cyan-400" />
                <span className="text-white font-medium">Revisa tu correo electrónico</span>
              </div>
              <p className="text-white/70 text-sm">
                Te hemos enviado un correo con tus <span className="text-cyan-400 font-semibold">diamantes numerados</span>. 
                Guarda este email, ya que contiene tus números para participar en todos los sorteos.
              </p>
            </div>
            
            {/* Participation Info */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-5 mb-8 border border-cyan-500/20">
              <h3 className="text-white font-semibold mb-2">✨ Participación Automática</h3>
              <p className="text-white/60 text-sm">
                Tus diamantes participan automáticamente en los sorteos diarios y en el gran sorteo final. ¡Mucha suerte!
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link to="/">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-6">
                  <Home className="w-5 h-5 mr-2" />
                  Volver al Inicio
                </Button>
              </Link>
              
              <p className="text-white/40 text-xs mt-4">
                Si no recibes el email en los próximos minutos, revisa tu carpeta de spam o contáctanos.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
