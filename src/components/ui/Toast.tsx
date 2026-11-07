'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

interface ToastOptions {
  message: string;
  type?: 'success' | 'info' | 'error';
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void;
  copyText: (text: string, successMessage?: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((options: ToastOptions | string) => {
    const opts: ToastOptions =
      typeof options === 'string'
        ? { message: options, type: 'success', duration: 3000 }
        : { duration: 3000, type: 'success', ...options };

    // Clear existing timer to debounce rapid clicks
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast(opts);

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, opts.duration || 3000);
  }, []);

  const copyText = useCallback(
    async (text: string, successMessage = 'Tersalin ke clipboard!'): Promise<boolean> => {
      if (!text || text.trim() === '') return false;

      let success = false;
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          success = true;
        } else if (typeof document !== 'undefined') {
          // Fallback strategy for older or non-HTTPS contexts
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          success = document.execCommand('copy');
          document.body.removeChild(textarea);
        }
      } catch {
        success = false;
      }

      if (success) {
        showToast({ message: successMessage, type: 'success' });
        return true;
      } else {
        showToast({ message: `Gagal menyalin: ${text}`, type: 'error' });
        return false;
      }
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, copyText }}>
      {children}

      {/* Floating Neo-Brutalist Toast Rendered at Bottom Right */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-paper text-ink border-2 border-ink shadow-[4px_4px_0px_#1E1E1E] rounded-xl px-4 py-3 font-mono text-sm font-bold transition-all duration-150"
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-coral shrink-0" />
          ) : (
            <Check className="w-5 h-5 text-mint shrink-0 stroke-[3]" />
          )}

          <span className="pr-1">{toast.message}</span>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:bg-ink/10 rounded ml-1 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

