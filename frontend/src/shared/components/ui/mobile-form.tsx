import * as React from "react"
import { Icon } from "@iconify/react"
import { Button } from "./button"
import { FormField } from "./form-field"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { FormSubmissionFeedback } from "./form-feedback"
import { useFormValidation, ValidationRule, validationRules } from "@/shared/hooks/useFormValidation"
import { cn } from "@/shared/lib/utils"

interface MobileFormFieldConfig {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea' | 'select'
  placeholder?: string
  description?: string
  validation?: ValidationRule
  leftIcon?: string
  rightIcon?: string
  disabled?: boolean
  options?: { value: string; label: string }[]
  rows?: number
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search'
}

interface MobileFormProps<T extends Record<string, any>> {
  fields: MobileFormFieldConfig[]
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
  stickyActions?: boolean
}

export function MobileForm<T extends Record<string, any>>({
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
  showSuccessMessages = true,
  stickyActions = true
}: MobileFormProps<T>) {
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

  const [focusedField, setFocusedField] = React.useState<string | null>(null)

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

  const renderField = (field: MobileFormFieldConfig, index: number) => {
    const fieldState = formState[field.name]
    const isFocused = focusedField === field.name

    return (
      <div 
        key={field.name}
        className={cn(
          "animate-fade-in transition-all duration-200",
          isFocused && "transform scale-[1.02]"
        )}
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
          {field.type === 'textarea' ? (
            <Textarea
              placeholder={field.placeholder}
              value={fieldState?.value || ''}
              onChange={(e) => setFieldValue(field.name as keyof T, e.target.value)}
              onFocus={() => setFocusedField(field.name)}
              onBlur={() => {
                setFocusedField(null)
                setFieldTouched(field.name as keyof T)
              }}
              disabled={field.disabled || submitState.isSubmitting}
              rows={field.rows || 4}
              className={cn(
                "transition-all duration-200 text-base md:text-sm",
                "min-h-[44px] px-4 py-3",
                fieldState?.error && "border-destructive focus:border-destructive",
                fieldState?.success && "border-success focus:border-success"
              )}
            />
          ) : field.type === 'select' ? (
            <select
              value={fieldState?.value || ''}
              onChange={(e) => setFieldValue(field.name as keyof T, e.target.value)}
              onFocus={() => setFocusedField(field.name)}
              onBlur={() => {
                setFocusedField(null)
                setFieldTouched(field.name as keyof T)
              }}
              disabled={field.disabled || submitState.isSubmitting}
              className={cn(
                "flex w-full rounded-md border border-input bg-background px-4 py-3 text-base md:text-sm transition-all duration-200",
                "min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                fieldState?.error && "border-destructive focus:border-destructive",
                fieldState?.success && "border-success focus:border-success"
              )}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative">
              {field.leftIcon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Icon icon={field.leftIcon} className="size-5" />
                </div>
              )}
              <Input
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={fieldState?.value || ''}
                onChange={(e) => setFieldValue(field.name as keyof T, e.target.value)}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => {
                  setFocusedField(null)
                  setFieldTouched(field.name as keyof T)
                }}
                disabled={field.disabled || submitState.isSubmitting}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                className={cn(
                  "transition-all duration-200 text-base md:text-sm",
                  "min-h-[44px] px-4 py-3",
                  field.leftIcon && "pl-12",
                  field.rightIcon && "pr-12",
                  fieldState?.error && "border-destructive focus:border-destructive",
                  fieldState?.success && "border-success focus:border-success"
                )}
              />
              {field.rightIcon && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Icon icon={field.rightIcon} className="size-5" />
                </div>
              )}
            </div>
          )}
        </FormField>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Form Fields */}
        <div className="space-y-4">
          {fields.map((field, index) => renderField(field, index))}
        </div>

        {/* Progress Indicator */}
        {showProgress && (
          <div className="space-y-2 px-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Form Progress</span>
              <span>{Math.round((Object.values(formState).filter(field => field.value && !field.error).length / fields.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
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
        <div className={cn(
          "flex flex-col gap-3 pt-4 border-t border-border",
          stickyActions && "md:sticky md:bottom-0 md:bg-background md:p-4 md:-mx-4 md:border-t"
        )}>
          <Button
            type="submit"
            disabled={!isValid || submitState.isSubmitting || isValidating}
            loading={submitState.isSubmitting}
            className="w-full min-h-[44px] text-base font-semibold"
            size="lg"
          >
            {submitState.isSubmitting ? (
              <>
                <Icon icon="solar:refresh-bold" className="size-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Icon icon="solar:check-circle-bold" className="size-5 mr-2" />
                {submitLabel}
              </>
            )}
          </Button>
          
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitState.isSubmitting}
                className="flex-1 min-h-[44px]"
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
                className="flex-1 min-h-[44px] text-muted-foreground hover:text-foreground"
              >
                <Icon icon="solar:refresh-bold" className="size-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
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
    </div>
  )
}

// Example usage component
export function ExampleMobileForm() {
  const fields: MobileFormFieldConfig[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter your first name',
      validation: { required: true, minLength: 2 },
      leftIcon: 'solar:user-bold',
      autoComplete: 'given-name'
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter your last name',
      validation: { required: true, minLength: 2 },
      leftIcon: 'solar:user-bold',
      autoComplete: 'family-name'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      description: 'We\'ll never share your email with anyone else.',
      leftIcon: 'solar:letter-bold',
      autoComplete: 'email',
      inputMode: 'email'
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: 'Enter your phone number',
      leftIcon: 'solar:phone-bold',
      autoComplete: 'tel',
      inputMode: 'tel'
    },
    {
      name: 'propertyType',
      label: 'Property Type',
      type: 'select',
      placeholder: 'Select property type',
      validation: { required: true },
      options: [
        { value: 'apartment', label: 'Apartment' },
        { value: 'house', label: 'House' },
        { value: 'condo', label: 'Condo' },
        { value: 'townhouse', label: 'Townhouse' }
      ]
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Tell us about yourself...',
      rows: 4
    }
  ]

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyType: '',
    description: ''
  }

  const handleSubmit = async (values: typeof initialValues) => {
    // Simulate API call with proper feedback
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real app, this would make an actual API call
    // For demo purposes, we'll show success feedback
    alert('Form submitted successfully! Data: ' + JSON.stringify(values, null, 2))
  }

  return (
    <MobileForm
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="Create Account"
      showProgress
      stickyActions
    />
  )
}