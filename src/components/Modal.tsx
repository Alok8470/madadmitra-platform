import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string;
}

export default function Modal({ open, isOpen, onClose, children, title, maxWidth = 'max-w-lg' }: ModalProps) {
  const isVisible = open ?? isOpen ?? false;

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar`}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur px-5 py-4 rounded-t-3xl">
            <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
