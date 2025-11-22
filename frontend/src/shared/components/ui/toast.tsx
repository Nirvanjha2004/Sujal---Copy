import * as React from 'react';
import { Icon } from '@iconify/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white text-gray-900",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900",
        error: "border-red-200 bg-red-50 text-red-900",
        warning: "border-amber-200 bg-amber-50 text-amber-900",
        info: "border-blue-200 bg-blue-50 text-blue-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const toastIconVariants = cva(
  "flex-shrink-0",
  {
    variants: {
      variant: {
        default: "text-gray-600",
        success: "text-emerald-600",
        error: "text-red-600",
        warning: "text-amber-600",
        info: "text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  icon?: string;
  showIcon?: boolean;
  duration?: number;
  onDismiss?: () => void;
  action?: React.ReactNode;
  showProgress?: boolean;
}

const getDefaultIcon = (variant: string) => {
  switch (variant) {
    case 'success':
      return 'solar:check-circle-bold';
    case 'error':
      return 'solar:close-circle-bold';
    case 'warning':
      return 'solar:danger-triangle-bold';
    case 'info':
      return 'solar:info-circle-bold';
    default:
      return 'solar:bell-bold';
  }
};

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({
    className,
    variant = "default",
    title,
    description,
    icon,
    showIcon = true,
    duration = 5000,
    onDismiss,
    action,
    showProgress = true,
    children,
    ...props
  }, ref) => {
    const [progress, setProgress] = React.useState(100);
    const [isPaused, setIsPaused] = React.useState(false);
    const intervalRef = React.useRef<NodeJS.Timeout>();
    const startTimeRef = React.useRef<number>();

    React.useEffect(() => {
      if (duration <= 0) return;

      const startProgress = () => {
        startTimeRef.current = Date.now();
        intervalRef.current = setInterval(() => {
          if (!isPaused) {
            const elapsed = Date.now() - (startTimeRef.current || 0);
            const remaining = Math.max(0, duration - elapsed);
            const newProgress = (remaining / duration) * 100;
            
            setProgress(newProgress);
            
            if (remaining <= 0) {
              onDismiss?.();
            }
          }
        }, 50);
      };

      startProgress();

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [duration, isPaused, onDismiss]);

    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);

    const iconToShow = icon || getDefaultIcon(variant || 'default');

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1">
          {showIcon && (
            <div className="mt-0.5">
              <Icon 
                icon={iconToShow} 
                className={cn(toastIconVariants({ variant }), "size-5")} 
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {title && (
              <div className="font-semibold text-sm leading-tight">
                {title}
              </div>
            )}
            
            {description && (
              <div className={cn(
                "text-sm leading-relaxed opacity-90",
                title && "mt-1"
              )}>
                {description}
              </div>
            )}
            
            {children && !title && !description && (
              <div className="text-sm leading-relaxed">
                {children}
              </div>
            )}
            
            {action && (
              <div className="mt-2">
                {action}
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className={cn(
            "absolute right-2 top-2 h-6 w-6 p-0 hover:bg-black/5 transition-colors",
            variant === 'success' && "hover:bg-emerald-200/50",
            variant === 'error' && "hover:bg-red-200/50",
            variant === 'warning' && "hover:bg-amber-200/50",
            variant === 'info' && "hover:bg-blue-200/50"
          )}
        >
          <Icon 
            icon="solar:close-linear" 
            className={cn(
              "size-4 transition-colors",
              variant === 'success' && "text-emerald-600 hover:text-emerald-700",
              variant === 'error' && "text-red-600 hover:text-red-700",
              variant === 'warning' && "text-amber-600 hover:text-amber-700",
              variant === 'info' && "text-blue-600 hover:text-blue-700",
              variant === 'default' && "text-gray-600 hover:text-gray-700"
            )}
          />
        </Button>
        
        {showProgress && duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-75 ease-linear",
                variant === 'success' && "bg-emerald-500",
                variant === 'error' && "bg-red-500",
                variant === 'warning' && "bg-amber-500",
                variant === 'info' && "bg-blue-500",
                variant === 'default' && "bg-gray-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  }
);
Toast.displayName = "Toast";

const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    altText?: string;
  }
>(({ className, altText, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    size="sm"
    className={cn(
      "h-7 px-3 text-xs font-medium transition-colors",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export { Toast, ToastAction, type ToastProps };