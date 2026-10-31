import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export default function Modal({
  open,
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
}: ModalProps) {
  const isVisible = open ?? isOpen ?? false;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Background backdrop overlay with click-to-close */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering container that allows vertical scrolling if modal exceeds screen height */}
      <div
        className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center"
        onClick={onClose}
      >
        {/* Modal card - stops propagation so clicking inside card does not close it */}
        <div
          className={`relative w-full ${maxWidth} my-auto transform rounded-2xl sm:rounded-3xl bg-white text-left shadow-2xl transition-all overflow-hidden flex flex-col max-h-[90vh]`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header with Title and Close Button */}
          {title ? (
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur px-5 py-3.5 sm:py-4">
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 pr-8 truncate">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2.5 -mr-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
            </div>
          ) : (
            /* Floating Close Button when no header title is supplied */
            showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 z-30 inline-flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-100/80 backdrop-blur-sm text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5 sm:h-5 sm:w-5" />
              </button>
            )
          )}

          {/* Scrollable Modal Content */}
          <div className="overflow-y-auto p-4 sm:p-6 flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  if (mounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
