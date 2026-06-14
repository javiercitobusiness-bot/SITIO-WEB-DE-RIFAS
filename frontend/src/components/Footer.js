import React, { useState, useEffect } from 'react';
import Diamond from './Diamond';
import { Mail, Phone, Instagram, Facebook, MessageCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Footer() {
  const [appearance, setAppearance] = useState({
    site_name: 'Dinámica de Diamantes',
    primary_color: '#06b6d4',
    footer_email: 'soportedinamicadiamantes@gmail.com',
    footer_phone: '+57 301 817 7278',
    footer_whatsapp: '573018177278',
    footer_instagram: 'https://www.instagram.com/soyjaviercito___',
    footer_facebook: 'https://www.facebook.com/JavierAlvarezTV70/',
    footer_tiktok: ''
  });

  useEffect(() => {
    fetch(`${API_URL}/api/appearance`)
      .then(res => res.json())
      .then(data => {
        if (data && data.site_name) {
          setAppearance(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.log('Using default appearance'));
  }, []);

  const whatsappLink = appearance.footer_whatsapp 
    ? `https://wa.me/${appearance.footer_whatsapp.replace(/[^0-9]/g, '')}`
    : '';

  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Diamond className="w-8 h-8" style={{ color: appearance.primary_color }} />
              <span className="text-xl font-bold text-white">{appearance.site_name}</span>
            </div>
            <p className="text-white/60 text-sm">
              Participa en nuestras dinámicas y gana increíbles premios en efectivo.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              {appearance.footer_email && (
                <a 
                  href={`mailto:${appearance.footer_email}`}
                  className="flex items-center gap-2 text-white/60 hover:text-cyan-400 text-sm transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {appearance.footer_email}
                </a>
              )}
              {appearance.footer_phone && (
                <a 
                  href={`tel:${appearance.footer_phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-white/60 hover:text-cyan-400 text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {appearance.footer_phone}
                </a>
              )}
              {whatsappLink && (
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-green-400 text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Síguenos</h3>
            <div className="flex gap-4">
              {appearance.footer_instagram && (
                <a 
                  href={appearance.footer_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-110 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {appearance.footer_facebook && (
                <a 
                  href={appearance.footer_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {whatsappLink && (
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white hover:scale-110 transition-all"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} {appearance.site_name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
