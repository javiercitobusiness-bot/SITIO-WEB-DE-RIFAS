import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Home, Diamond, Loader2, Download } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState(null);
  const diamondsRef = useRef(null);

  useEffect(() => {
    const processPayment = async () => {
      const reference = searchParams.get('reference') || localStorage.getItem('lastPurchaseReference');
      
      if (reference) {
        try {
          const response = await axios.post(`${API_URL}/api/verify-and-process/${reference}`);
          setResult(response.data);
          localStorage.removeItem('lastPurchaseReference');
        } catch (error) {
          console.error('Error processing:', error);
          setResult({ status: 'error' });
        }
      }
      setProcessing(false);
    };

    processPayment();
  }, [searchParams]);

  const downloadAsImage = async () => {
    if (diamondsRef.current) {
      try {
        const canvas = await html2canvas(diamondsRef.current, {
          backgroundColor: '#1e293b',
          scale: 2
        });
        const link = document.createElement('a');
        link.download = `mis-diamantes-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error downloading:', error);
      }
    }
  };

  const diamonds = result?.diamonds || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="max-w-4xl w-full bg-slate-900/80 border-slate-800 shadow-2xl">
          <CardContent className="pt-10 pb-10">
            {processing ? (
              <div className="py-12 text-center">
                <Loader2 className="w-16 h-16 mx-auto text-cyan-400 animate-spin" />
                <p className="mt-4 text-white/70">Procesando tu compra...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">¡Compra Exitosa!</h1>
                  {result?.customer_name && (
                    <p className="text-white/70">Gracias, {result.customer_name}</p>
                  )}
                  {diamonds.length > 0 && (
                    <p className="text-lg text-cyan-400 font-semibold mt-2">
                      ¡Tienes {diamonds.length} diamantes!
                    </p>
                  )}
                </div>

                {/* Diamantes */}
                {diamonds.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Diamond className="w-5 h-5 text-cyan-400" />
                        Tus Diamantes Numerados
                      </h2>
                      <Button onClick={downloadAsImage} variant="outline" className="border-cyan-500 text-cyan-400">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Imagen
                      </Button>
                    </div>
                    
                    <div 
                      ref={diamondsRef}
                      className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                    >
                      <div className="text-center mb-4">
                        <p className="text-white/60 text-sm">MARZO LLENO DE DIAMANTES</p>
                        <p className="text-cyan-400 font-semibold">{result?.customer_name}</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {diamonds.map((num, idx) => (
                          <div 
                            key={idx}
                            className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center border-2 border-cyan-400 shadow-lg shadow-cyan-500/20"
                          >
                            <div className="text-center">
                              <Diamond className="w-4 h-4 text-white/80 mx-auto mb-1" />
                              <span className="text-white font-bold text-sm">{num}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-4 text-white/40 text-xs">
                        Guarda esta imagen - Estos son tus números para los sorteos
                      </div>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-5 mb-6 border border-cyan-500/20 text-center">
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
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
