import React from 'react';
import Diamond from './Diamond';
import { Mail, Phone, Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
  // Datos de contacto
  const socialLinks = {
    instagram: 'https://www.instagram.com/soyjaviercito___',
    facebook: 'https://www.facebook.com/JavierAlvarezTV70/',
    whatsapp: 'https://wa.me/573018177278',
    phone: '+573018177278',
    email: 'soportedinamicadiamantes@gmail.com'
  };

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
                href={`mailto:${socialLinks.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-cyan-400 text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                {socialLinks.email}
              </a>
              <a 
                href={`tel:${socialLinks.phone}`}
                className="flex items-center gap-2 text-white/60 hover:text-cyan-400 text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                +57 301 817 7278
              </a>
              <a 
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-green-400 text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Síguenos</h3>
            <div className="flex gap-4">
              <a 
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-110 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white hover:scale-110 transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
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
