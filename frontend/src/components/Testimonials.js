import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Star, Quote } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/testimonials`);
      setTestimonials(response.data.testimonials || []);
    } catch (error) {
      console.log('No testimonials available');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Ganadores Reales
          </h2>
          <p className="text-white/60">
            Conoce a quienes ya ganaron con nosotros
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/30 transition-all">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-cyan-400/30 mb-4" />
                
                <p className="text-white/80 text-sm mb-4 italic">
                  "{testimonial.message}"
                </p>
                
                <div className="flex items-center gap-3">
                  {testimonial.image_url ? (
                    <img 
                      src={testimonial.image_url} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {testimonial.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-white/50 text-xs">{testimonial.location}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">
                      {formatCurrency(testimonial.prize_amount)}
                    </p>
                    <p className="text-white/40 text-xs">Ganado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
