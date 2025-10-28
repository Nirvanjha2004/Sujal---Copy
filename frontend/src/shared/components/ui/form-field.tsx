import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Icon } from "@iconify/react"

import { cn } from "@/shared/lib/utils"
import { useFormAccessibility } from "@/shared/hooks/useAccessibility"

const formFieldVariants = cva(
  "space-y-2 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "",
        inline: "flex items-center space-y-0 space-x-4",
      },
      state: {
        default: "",
        error: "animate-shake",
        success: "animate-fade-in",
        loading: "animate-pulse-subtle",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "default",
    },
  }
)

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  label?: string
  description?: string
  error?: string
  success?: string
  required?: boolean
  loading?: boolean
  children: React.ReactNode
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, variant, state, label, description, error, success, required, loading, children, ...props }, ref) => {
    const {
      fieldId,
      errorId,
      descriptionId,
      getFieldProps,
      getLabelProps,
      getErrorProps,
      getDescriptionProps
    } = useFormAccessibility()
    
    // Determine the state based on props
    const fieldState = error ? 'error' : success ? 'success' : loading ? 'loading' : 'default';
    
    // Clone children to add accessibility props
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ...getFieldProps(!!error, !!description),
          ...child.props
        })
      }
      return child
    })
    
    return (
      <div
        ref={ref}
        className={cn(formFieldVariants({ variant, state: fieldState, className }))}
        {...props}
      >
        {label && (
          <div className="flex items-center justify-between">
            <label 
              {...getLabelProps()}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors duration-200"
            >
              {label}
              {required && (
                <span className="text-destructive ml-1 animate-pulse" aria-label="required">
                  *
                </span>
              )}
            </label>
            {loading && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-live="polite">
                <Icon icon="solar:refresh-bold" className="size-3 animate-spin" aria-hidden="true" />
                <span>Validating...</span>
              </div>
            )}
          </div>
        )}
        {description && (
          <p 
            {...getDescriptionProps()}
            className="text-xs text-muted-foreground transition-opacity duration-200"
          >
            {description}
          </p>
        )}
        <div className="relative">
          {enhancedChildren}
          {/* Success indicator */}
          {success && !loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              <Icon 
                icon="solar:check-circle-bold" 
                className="size-4 text-success animate-scale-in" 
              />
            </div>
          )}
          {/* Error indicator */}
          {error && !loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              <Icon 
                icon="solar:close-circle-bold" 
                className="size-4 text-destructive animate-scale-in" 
              />
            </div>
          )}
          {/* Loading indicator */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              <Icon 
                icon="solar:refresh-bold" 
                className="size-4 text-muted-foreground animate-spin" 
              />
            </div>
          )}
        </div>
        
        {/* Error message with animation */}
        {error && (
          <div className="animate-slide-down">
            <p 
              {...getErrorProps()}
              className="text-xs text-destructive font-medium flex items-center gap-1.5 bg-destructive/5 px-2 py-1 rounded-md border border-destructive/20"
            >
              <Icon icon="solar:danger-circle-bold" className="size-3 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          </div>
        )}
        
        {/* Success message with animation */}
        {success && !error && (
          <div className="animate-slide-down">
            <p className="text-xs text-success font-medium flex items-center gap-1.5 bg-success/5 px-2 py-1 rounded-md border border-success/20">
              <Icon icon="solar:check-circle-bold" className="size-3 flex-shrink-0" aria-hidden="true" />
              <span>{success}</span>
            </p>
          </div>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField, formFieldVariants }