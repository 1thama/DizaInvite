import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Heart } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'heart';
  colorScheme?: 'rose' | 'emerald' | 'brand' | 'gold' | 'slate';
}

const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'success',
  colorScheme = 'rose'
}) => {
  const colors = {
    rose: {
      bg: 'bg-rose-500',
      text: 'text-rose-500',
      border: 'border-rose-100',
      iconBg: 'bg-rose-50',
      button: 'bg-rose-500 hover:bg-rose-600',
      light: 'text-rose-400'
    },
    emerald: {
      bg: 'bg-emerald-500',
      text: 'text-emerald-500',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50',
      button: 'bg-emerald-500 hover:bg-emerald-600',
      light: 'text-emerald-400'
    },
    brand: {
      bg: 'bg-[#8D9B82]',
      text: 'text-[#5C6554]',
      border: 'border-[#F1F3EE]',
      iconBg: 'bg-[#F1F3EE]',
      button: 'bg-[#8D9B82] hover:bg-[#7A886F]',
      light: 'text-[#8D9B82]'
    },
    gold: {
      bg: 'bg-amber-500',
      text: 'text-amber-500',
      border: 'border-amber-100',
      iconBg: 'bg-amber-50',
      button: 'bg-amber-500 hover:bg-amber-600',
      light: 'text-amber-400'
    },
    slate: {
      bg: 'bg-slate-900',
      text: 'text-slate-900',
      border: 'border-slate-100',
      iconBg: 'bg-slate-50',
      button: 'bg-slate-900 hover:bg-slate-800',
      light: 'text-slate-400'
    }
  };

  const scheme = colors[colorScheme] || colors.rose;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border ${scheme.border} text-center`}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 12 }}
              className={`w-20 h-20 ${scheme.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              {type === 'heart' ? (
                <Heart className={`${scheme.text} fill-current`} size={32} />
              ) : (
                <Check className={scheme.text} size={32} />
              )}
            </motion.div>
            
            <h3 className={`text-2xl font-serif font-bold mb-2 ${scheme.text}`}>{title}</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">{message}</p>
            
            <button
              onClick={onClose}
              className={`w-full py-4 ${scheme.button} text-white rounded-2xl font-bold tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-black/5`}
            >
              TUTUP
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
