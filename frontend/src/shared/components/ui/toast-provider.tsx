import * as React from 'react';
import { createPortal } from 'react-dom';
import { Toast, type ToastProps } from './toast';
import { cn } from '@/shared/lib/utils';

interface ToastData extends Omit<ToastProps, 'onDismiss'> {
  id: string;
  createdAt: number;
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  gap?: number;
}

export function ToastProvider({ 
  children, 
  maxToasts = 5, 
  position = 'top-right',
  gap = 8 
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastData, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastData = {
      ...toast,
      id,
      createdAt: Date.now(),
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts]);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof window !== 'undefined' && createPortal(
        <div 
          className={cn(
            'fixed z-[100] flex flex-col pointer-events-none',
            getPositionClasses()
          )}
          style={{ gap: `${gap}px` }}
        >
          {toasts.map((toast, index) => (
            <div
              key={toast.id}
              className="pointer-events-auto animate-in slide-in-from-top-2 duration-300"
              style={{
                animationDelay: `${index * 100}ms`,
                zIndex: toasts.length - index,
              }}
            >
              <Toast
                {...toast}
                onDismiss={() => removeToast(toast.id)}
                className={cn(
                  'w-96 max-w-[calc(100vw-2rem)]',
                  toast.className
                )}
              />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

// Convenience hook for common toast types
export const useToastActions = () => {
  const { addToast } = useToast();

  return React.useMemo(() => ({
    success: (message: string, options?: Partial<ToastData>) => 
      addToast({ 
        variant: 'success', 
        title: 'Success',
        description: message,
        duration: 4000,
        ...options 
      }),
    
    error: (message: string, options?: Partial<ToastData>) => 
      addToast({ 
        variant: 'error', 
        title: 'Error',
        description: message,
        duration: 6000,
        ...options 
      }),
    
    warning: (message: string, options?: Partial<ToastData>) => 
      addToast({ 
        variant: 'warning', 
        title: 'Warning',
        description: message,
        duration: 5000,
        ...options 
      }),
    
    info: (message: string, options?: Partial<ToastData>) => 
      addToast({ 
        variant: 'info', 
        title: 'Info',
        description: message,
        duration: 4000,
        ...options 
      }),
    
    custom: (toast: Omit<ToastData, 'id' | 'createdAt'>) => 
      addToast(toast),
  }), [addToast]);
};

export type { ToastData, ToastContextValue };