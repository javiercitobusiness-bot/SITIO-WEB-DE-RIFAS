import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import Diamond from './Diamond';
import { CheckCircle2, Mail, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function NumbersModal({ open, onClose, result }) {
  const copyNumbers = () => {
    if (result?.diamonds) {
      navigator.clipboard.writeText(result.diamonds.join(', '));
      toast.success('Números copiados al portapapeles');
    }
  };

  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            ¡Compra Exitosa!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-center text-white/60">
            Tus diamantes han sido asignados correctamente.
          </p>

          {result.diamonds && result.diamonds.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/60">Tus números:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-400 hover:text-cyan-300"
                  onClick={copyNumbers}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.diamonds.slice(0, 10).map((num, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded border border-cyan-500/30"
                  >
                    <Diamond className="w-3 h-3 text-cyan-400" />
                    <span className="text-sm font-mono">{num}</span>
                  </div>
                ))}
                {result.diamonds.length > 10 && (
                  <div className="px-2 py-1 text-white/50 text-sm">
                    +{result.diamonds.length - 10} más
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Mail className="w-5 h-5 text-cyan-400" />
            <p className="text-sm text-white/70">
              Hemos enviado todos tus números a tu correo electrónico.
            </p>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
            onClick={onClose}
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
