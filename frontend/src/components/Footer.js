import React from 'react';
import Diamond from './Diamond';
import { Mail, Phone, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Diamond className="w-8 h-8 text-cyan-400" />
              <span className="text-xl font-bold text-white">Dinámica de Diamantes</span>
            </div>
            <p className="text-white/60 text-sm">
              Participa en nuestras dinámicas y gana increíbles premios en efectivo.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <a 
                href="mailto:soportedinamicadiamantes@gmail.com" 
                className="flex items-center gap-2 text-white/60 hover:text-cyan-400 text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                soportedinamicadiamantes@gmail.com
              </a>
              <a 
                href="tel:+573001234567" 
                className="flex items-center gap-2 text-white/60 hover:text-cyan-400 text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                +57 300 123 4567
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Síguenos</h3>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white/60 hover:text-cyan-400 hover:bg-slate-700 transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white/60 hover:text-cyan-400 hover:bg-slate-700 transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Dinámica de Diamantes. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
