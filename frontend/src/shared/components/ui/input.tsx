import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { useId } from "@/shared/hooks/useAccessibility"

const inputVariants = cva(
  "input-enhanced flex w-full rounded-md border bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible-enhanced disabled:cursor-not-allowed disabled:opacity-50 touch-target",
  {
    variants: {
      variant: {
        default: "border-input hover:border-ring/50 focus-visible:border-ring",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
      },
      size: {
        sm: "h-8 px-2 py-1 text-xs",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: boolean
  success?: boolean
  description?: string
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant, 
    size, 
    loading, 
    leftIcon, 
    rightIcon, 
    error,
    success,
    description,
    errorMessage,
    ...props 
  }, ref) => {
    const loadingId = useId('loading')
    const descriptionId = useId('description')
    const errorId = useId('error')
    
    // Determine variant based on state
    const inputVariant = error ? 'error' : success ? 'success' : variant
    
    // Build aria-describedby
    const describedBy = [
      loading ? loadingId : null,
      description ? descriptionId : null,
      errorMessage ? errorId : null
    ].filter(Boolean).join(' ') || undefined
    
    return (
      <div className="relative">
        {leftIcon && (
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          >
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant: inputVariant, size }),
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            loading && "pr-10",
            className
          )}
          ref={ref}
          disabled={loading || props.disabled}
          aria-invalid={error}
          aria-describedby={describedBy}
          {...props}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 animate-spin text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span id={loadingId} className="sr-only">
              Loading...
            </span>
          </div>
        )}
        {!loading && rightIcon && (
          <div 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          >
            {rightIcon}
          </div>
        )}
        
        {/* Hidden descriptions for screen readers */}
        {description && (
          <div id={descriptionId} className="sr-only">
            {description}
          </div>
        )}
        {errorMessage && (
          <div id={errorId} className="sr-only" role="alert" aria-live="polite">
            {errorMessage}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }