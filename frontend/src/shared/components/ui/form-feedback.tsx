import * as React from "react"
import { Icon } from "@iconify/react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const feedbackVariants = cva(
  "flex items-center gap-2 p-3 rounded-md border text-sm font-medium transition-all duration-300",
  {
    variants: {
      variant: {
        success: "bg-success/10 border-success/20 text-success animate-slide-down",
        error: "bg-destructive/10 border-destructive/20 text-destructive animate-shake",
        warning: "bg-warning/10 border-warning/20 text-warning animate-slide-down",
        info: "bg-info/10 border-info/20 text-info animate-slide-down",
      },
      size: {
        sm: "text-xs p-2",
        default: "text-sm p-3",
        lg: "text-base p-4",
      },
    },
    defaultVariants: {
      variant: "success",
      size: "default",
    },
  }
)

export interface FormFeedbackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof feedbackVariants> {
  message: string
  icon?: string
  dismissible?: boolean
  onDismiss?: () => void
  autoHide?: boolean
  autoHideDelay?: number
}

const FormFeedback = React.forwardRef<HTMLDivElement, FormFeedbackProps>(
  ({ 
    className, 
    variant, 
    size, 
    message, 
    icon, 
    dismissible = false, 
    onDismiss,
    autoHide = false,
    autoHideDelay = 5000,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    const getDefaultIcon = () => {
      switch (variant) {
        case 'success':
          return 'solar:check-circle-bold'
        case 'error':
          return 'solar:close-circle-bold'
        case 'warning':
          return 'solar:danger-triangle-bold'
        case 'info':
          return 'solar:info-circle-bold'
        default:
          return 'solar:check-circle-bold'
      }
    }

    const handleDismiss = () => {
      setIsVisible(false)
      setTimeout(() => {
        onDismiss?.()
      }, 300) // Wait for animation to complete
    }

    // Auto-hide functionality
    React.useEffect(() => {
      if (autoHide && autoHideDelay > 0) {
        const timer = setTimeout(() => {
          handleDismiss()
        }, autoHideDelay)

        return () => clearTimeout(timer)
      }
    }, [autoHide, autoHideDelay])

    if (!isVisible) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(feedbackVariants({ variant, size }), className)}
        {...props}
      >
        <Icon 
          icon={icon || getDefaultIcon()} 
          className={cn(
            "flex-shrink-0",
            size === 'sm' ? 'size-3' : size === 'lg' ? 'size-5' : 'size-4'
          )} 
        />
        <span className="flex-1">{message}</span>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <Icon 
              icon="solar:close-linear" 
              className={cn(
                size === 'sm' ? 'size-3' : size === 'lg' ? 'size-5' : 'size-4'
              )} 
            />
          </button>
        )}
      </div>
    )
  }
)
FormFeedback.displayName = "FormFeedback"

// Specific feedback components
export function SuccessFeedback({ 
  message, 
  ...props 
}: Omit<FormFeedbackProps, 'variant' | 'message'> & { message: string }) {
  return <FormFeedback variant="success" message={message} {...props} />
}

export function ErrorFeedback({ 
  message, 
  ...props 
}: Omit<FormFeedbackProps, 'variant' | 'message'> & { message: string }) {
  return <FormFeedback variant="error" message={message} {...props} />
}

export function WarningFeedback({ 
  message, 
  ...props 
}: Omit<FormFeedbackProps, 'variant' | 'message'> & { message: string }) {
  return <FormFeedback variant="warning" message={message} {...props} />
}

export function InfoFeedback({ 
  message, 
  ...props 
}: Omit<FormFeedbackProps, 'variant' | 'message'> & { message: string }) {
  return <FormFeedback variant="info" message={message} {...props} />
}

// Form submission feedback component
export function FormSubmissionFeedback({
  isSubmitting,
  isSuccess,
  isError,
  successMessage = "Form submitted successfully!",
  errorMessage = "There was an error submitting the form.",
  submittingMessage = "Submitting...",
  className
}: {
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  successMessage?: string
  errorMessage?: string
  submittingMessage?: string
  className?: string
}) {
  if (isSubmitting) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Icon icon="solar:refresh-bold" className="size-4 animate-spin" />
        <span>{submittingMessage}</span>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <SuccessFeedback 
        message={successMessage} 
        className={className}
        autoHide
        autoHideDelay={3000}
      />
    )
  }

  if (isError) {
    return (
      <ErrorFeedback 
        message={errorMessage} 
        className={className}
        dismissible
      />
    )
  }

  return null
}

export { FormFeedback, feedbackVariants }