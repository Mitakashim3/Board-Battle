'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Check, X, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onDismiss: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <Check className="w-5 h-5" />,
  error: <X className="w-5 h-5" />,
  warning: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const colors: Record<ToastType, string> = {
  success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
  warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
};

function Toast({ id, type, message, onDismiss }: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      toastRef.current,
      { opacity: 0, x: 50, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: 'power3.out' }
    );

    const timer = setTimeout(() => {
      gsap.to(toastRef.current, {
        opacity: 0,
        x: 50,
        duration: 0.2,
        onComplete: () => onDismiss(id),
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      ref={toastRef}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm ${colors[type]}`}
    >
      <span className="flex-shrink-0">{icons[type]}</span>
      <p className="text-sm font-medium text-white">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast container and store
interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];

export function toast(type: ToastType, message: string) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, message }];
  toastListeners.forEach((listener) => listener(toasts));
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastItem[]) => setItems(newToasts);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    setItems(toasts);
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {items.map((item) => (
        <Toast key={item.id} {...item} onDismiss={dismiss} />
      ))}
    </div>
  );
}
