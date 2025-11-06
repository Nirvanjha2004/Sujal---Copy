import * as React from "react"
import { Icon } from "@iconify/react"
import { Button } from "./button"
import { FormField } from "./form-field"
import { Input } from "./input"
import { FormSubmissionFeedback } from "./form-feedback"
import { useFormValidation, ValidationRule, validationRules } from "@/shared/hooks/useFormValidation"
import { cn } from "@/shared/lib/utils"

interface FormFieldConfig {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'
  placeholder?: string
  description?: string
  validation?: ValidationRule
  leftIcon?: string
  rightIcon?: string
  disabled?: boolean
}

interface EnhancedFormProps<T extends Record<string, any>> {
  fields: FormFieldConfig[]
  initialValues: T
  onSubmit: (values: T) => Promise<void> | void
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  className?: string
  showProgress?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
  showSuccessMessages?: boolean
}

export function EnhancedForm<T extends Record<string, any>>({
  fields,
  initialValues,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  className,
  showProgress = true,
  validateOnChange = true,
  validateOnBlur = true,
  showSuccessMessages = true
}: EnhancedFormProps<T>) {
  const [submitState, setSubmitState] = React.useState<{
    isSubmitting: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage?: string
  }>({
    isSubmitting: false,
    isSuccess: false,
    isError: false
  })

  // Create validation rules from field configs
  const validationConfig = React.useMemo(() => {
    const config: Partial<Record<keyof T, ValidationRule>> = {}
    fields.forEach(field => {
      if (field.validation) {
        config[field.name as keyof T] = field.validation
      } else {
        // Apply default validation based on field type
        switch (field.type) {
          case 'email':
            config[field.name as keyof T] = validationRules.email
            break
          case 'password':
            config[field.name as keyof T] = validationRules.password
            break
          case 'tel':
            config[field.name as keyof T] = validationRules.phone
            break
          case 'url':
            config[field.name as keyof T] = validationRules.url
            break
        }
      }
    })
    return config
  }, [fields])

  const {
    formState,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    resetForm,
    isValid,
    isDirty,
    isValidating
  } = useFormValidation(initialValues, validationConfig, {
    validateOnChange,
    validateOnBlur,
    showSuccessMessage: showSuccessMessages
  })

  const onFormSubmit = React.useCallback(async (values: T) => {
    setSubmitState(prev => ({ ...prev, isSubmitting: true, isError: false, isSuccess: false }))
    
    try {
      await onSubmit(values)
      setSubmitState(prev => ({ ...prev, isSubmitting: false, isSuccess: true }))
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitState(prev => ({ ...prev, isSuccess: false }))
      }, 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setSubmitState(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        isError: true, 
        errorMessage 
      }))
    }
  }, [onSubmit])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onFormSubmit)
  }

  const handleReset = () => {
    resetForm()
    setSubmitState({
      isSubmitting: false,
      isSuccess: false,
      isError: false
    })
  }

  return (
    <form onSubmit={handleFormSubmit} className={cn("space-y-6", className)}>
      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const fieldState = formState[field.name]
          
          return (
            <div 
              key={field.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FormField
                label={field.label}
                description={field.description}
                error={fieldState?.error}
                success={fieldState?.success}
                loading={fieldState?.validating}
                required={validationConfig[field.name as keyof T]?.required}
              >
                <Input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={fieldState?.value || ''}
                  onChange={(e) => setFieldValue(field.name as keyof T, e.target.value)}
                  onBlur={() => setFieldTouched(field.name as keyof T)}
                  disabled={field.disabled || submitState.isSubmitting}
                  variant={fieldState?.error ? 'error' : fieldState?.success ? 'success' : 'default'}
                  leftIcon={field.leftIcon ? <Icon icon={field.leftIcon} className="size-4" /> : undefined}
                  rightIcon={field.rightIcon ? <Icon icon={field.rightIcon} className="size-4" /> : undefined}
                  className="transition-all duration-200"
                />
              </FormField>
            </div>
          )
        })}
      </div>

      {/* Progress Indicator */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Form Progress</span>
            <span>{Math.round((Object.values(formState).filter(field => field.value && !field.error).length / fields.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ 
                width: `${(Object.values(formState).filter(field => field.value && !field.error).length / fields.length) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Submission Feedback */}
      <FormSubmissionFeedback
        isSubmitting={submitState.isSubmitting}
        isSuccess={submitState.isSuccess}
        isError={submitState.isError}
        errorMessage={submitState.errorMessage}
      />

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={!isValid || submitState.isSubmitting || isValidating}
          loading={submitState.isSubmitting}
          className="flex-1 sm:flex-none"
        >
          {submitState.isSubmitting ? (
            <>
              <Icon icon="solar:refresh-bold" className="size-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Icon icon="solar:check-circle-bold" className="size-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitState.isSubmitting}
          >
            <Icon icon="solar:close-circle-bold" className="size-4 mr-2" />
            {cancelLabel}
          </Button>
        )}
        
        {isDirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={submitState.isSubmitting}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon icon="solar:refresh-bold" className="size-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Form Status Indicators */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-4">
          {isValidating && (
            <div className="flex items-center gap-1">
              <Icon icon="solar:refresh-bold" className="size-3 animate-spin" />
              <span>Validating...</span>
            </div>
          )}
          {isDirty && !isValidating && (
            <div className="flex items-center gap-1">
              <Icon icon="solar:pen-bold" className="size-3" />
              <span>Unsaved changes</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {isValid ? (
            <>
              <Icon icon="solar:check-circle-bold" className="size-3 text-success" />
              <span className="text-success">Valid</span>
            </>
          ) : (
            <>
              <Icon icon="solar:close-circle-bold" className="size-3 text-destructive" />
              <span className="text-destructive">Invalid</span>
            </>
          )}
        </div>
      </div>
    </form>
  )
}

// Example usage component
export function ExampleEnhancedForm() {
  const fields: FormFieldConfig[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter your first name',
      validation: { required: true, minLength: 2 },
      leftIcon: 'solar:user-bold'
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter your last name',
      validation: { required: true, minLength: 2 },
      leftIcon: 'solar:user-bold'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      description: 'We\'ll never share your email with anyone else.',
      leftIcon: 'solar:letter-bold'
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: 'Enter your phone number',
      leftIcon: 'solar:phone-bold'
    }
  ]

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  }

  const handleSubmit = async (values: typeof initialValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Form submitted:', values)
  }

  return (
    <EnhancedForm
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="Create Account"
      showProgress
    />
  )
}