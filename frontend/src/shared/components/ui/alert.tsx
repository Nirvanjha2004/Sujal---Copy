import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Icon } from '@iconify/react'
import { Button } from './button'
import { cn } from "@/shared/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl border transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-gray-50 border-gray-200 text-gray-900",
        info: "bg-blue-50 border-blue-200 text-blue-900",
        success: "bg-emerald-50 border-emerald-200 text-emerald-900",
        warning: "bg-amber-50 border-amber-200 text-amber-900",
        error: "bg-red-50 border-red-200 text-red-900",
        destructive: "bg-red-50 border-red-200 text-red-900",
      },
      size: {
        default: "p-4",
        sm: "p-3",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const alertIconVariants = cva(
  "flex-shrink-0 transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-gray-600",
        info: "text-blue-600",
        success: "text-emerald-600",
        warning: "text-amber-600",
        error: "text-red-600",
        destructive: "text-red-600",
      },
      size: {
        default: "size-5",
        sm: "size-4",
        lg: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: string;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
}

const getDefaultIcon = (variant: string) => {
  switch (variant) {
    case 'info':
      return 'solar:info-circle-bold';
    case 'success':
      return 'solar:check-circle-bold';
    case 'warning':
      return 'solar:danger-triangle-bold';
    case 'error':
    case 'destructive':
      return 'solar:close-circle-bold';
    default:
      return 'solar:info-circle-bold';
  }
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default",
    title,
    description,
    icon,
    showIcon = true,
    dismissible = false,
    onDismiss,
    actions,
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [isExiting, setIsExiting] = React.useState(false);

    const handleDismiss = () => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 200);
    };

    if (!isVisible) return null;

    const iconToShow = icon || getDefaultIcon(variant || 'default');

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          alertVariants({ variant, size }),
          isExiting && "opacity-0 scale-95 translate-y-2",
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {showIcon && (
            <div className="mt-0.5">
              <Icon 
                icon={iconToShow} 
                className={alertIconVariants({ variant, size })} 
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {title && (
              <AlertTitle className={cn(
                size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
              )}>
                {title}
              </AlertTitle>
            )}
            
            {description && (
              <AlertDescription className={cn(
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
                title && 'mt-1'
              )}>
                {description}
              </AlertDescription>
            )}
            
            {children && !title && !description && (
              <div className={cn(
                size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'
              )}>
                {children}
              </div>
            )}
            
            {actions && (
              <div className="mt-3 flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
          
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className={cn(
                "h-6 w-6 p-0 hover:bg-black/5 transition-colors",
                variant === 'info' && "hover:bg-blue-200/50",
                variant === 'success' && "hover:bg-emerald-200/50",
                variant === 'warning' && "hover:bg-amber-200/50",
                (variant === 'error' || variant === 'destructive') && "hover:bg-red-200/50"
              )}
            >
              <Icon 
                icon="solar:close-linear" 
                className={cn(
                  "size-4 transition-colors",
                  variant === 'info' && "text-blue-600 hover:text-blue-700",
                  variant === 'success' && "text-emerald-600 hover:text-emerald-700",
                  variant === 'warning' && "text-amber-600 hover:text-amber-700",
                  (variant === 'error' || variant === 'destructive') && "text-red-600 hover:text-red-700",
                  variant === 'default' && "text-gray-600 hover:text-gray-700"
                )}
              />
            </Button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("leading-relaxed opacity-90 [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Enhanced Alert Action Button Component
const AlertAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    variant?: 'default' | 'outline' | 'ghost';
  }
>(({ className, variant = 'outline', size = 'sm', ...props }, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size={size}
    className={cn(
      "h-8 px-3 text-xs font-medium transition-colors",
      className
    )}
    {...props}
  />
))
AlertAction.displayName = "AlertAction"

export { Alert, AlertTitle, AlertDescription, AlertAction, type AlertProps }