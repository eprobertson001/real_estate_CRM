"use client";

import { useEffect, useState } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Simple toast implementation
let toastCounter = 0;
const toastListeners = new Set<(toasts: Toast[]) => void>();
let currentToasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener([...currentToasts]));
}

function addToast(toast: Omit<Toast, "id">) {
  const newToast: Toast = {
    ...toast,
    id: `toast-${++toastCounter}`,
  };
  
  currentToasts = [newToast, ...currentToasts].slice(0, 5);
  notifyListeners();
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    dismissToast(newToast.id);
  }, 5000);
  
  return newToast.id;
}

function dismissToast(id: string) {
  currentToasts = currentToasts.filter(toast => toast.id !== id);
  notifyListeners();
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(currentToasts);

  useEffect(() => {
    toastListeners.add(setToasts);
    return () => {
      toastListeners.delete(setToasts);
    };
  }, []);

  return {
    toasts,
    toast: addToast,
    dismiss: dismissToast,
  };
}

function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`relative flex w-full items-start justify-between rounded-lg border p-4 shadow-lg transition-all ${
            toast.variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <div className="flex-1">
            {toast.title && (
              <div className="text-sm font-semibold mb-1">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm">{toast.description}</div>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// Convenience function to create toasts
const toast = {
  success: (message: string, title?: string) => addToast({ 
    title, 
    description: message, 
    variant: "default" 
  }),
  error: (message: string, title?: string) => addToast({ 
    title, 
    description: message, 
    variant: "destructive" 
  }),
  info: (message: string, title?: string) => addToast({ 
    title, 
    description: message, 
    variant: "default" 
  }),
};

export { useToast, toast, Toaster };
