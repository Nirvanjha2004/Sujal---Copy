import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRegister } from '../../hooks/useRegister';
import { RegisterFormData } from '../../types';

interface RegisterFormProps {
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function RegisterForm({ onSuccess, onError, className }: RegisterFormProps) {
  const { register, isLoading, error, fieldErrors, validateField, clearFieldError, clearError } = useRegister();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'owner',
    phone: '',
  });
  
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof RegisterFormData]) {
      clearFieldError(name as keyof RegisterFormData);
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value, formData.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role as any,
      phone: formData.phone,
    });
    
    if (success) {
      onSuccess?.(formData.email);
    } else {
      onError?.(error || 'Registration failed');
    }
  };

  const isFormValid = 
    formData.firstName && 
    formData.lastName && 
    formData.email && 
    formData.password && 
    formData.confirmPassword && 
    formData.password === formData.confirmPassword &&
    passwordStrength >= 3 &&
    Object.keys(fieldErrors).length === 0;

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <Icon icon="solar:danger-bold" className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </label>
            <div className="relative">
              <Icon 
                icon="solar:user-bold" 
                className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="pl-10"
                required
              />
            </div>
            {fieldErrors.firstName && (
              <p className="text-xs text-red-500">{fieldErrors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </label>
            <div className="relative">
              <Icon 
                icon="solar:user-bold" 
                className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="pl-10"
                required
              />
            </div>
            {fieldErrors.lastName && (
              <p className="text-xs text-red-500">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <div className="relative">
            <Icon 
              icon="solar:letter-bold" 
              className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="pl-10"
              required
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Icon 
              icon="solar:phone-bold" 
              className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="pl-10"
            />
          </div>
          {fieldErrors.phone && (
            <p className="text-xs text-red-500">{fieldErrors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            I am a
          </label>
          <Select value={formData.role} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer">Property Buyer</SelectItem>
              <SelectItem value="owner">Property Owner</SelectItem>
              <SelectItem value="agent">Real Estate Agent</SelectItem>
              <SelectItem value="builder">Builder/Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Icon 
              icon="solar:lock-password-bold" 
              className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="pl-10"
              required
            />
          </div>
          {formData.password && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordStrength)}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
            </div>
          )}
          {fieldErrors.password && (
            <p className="text-xs text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <Icon 
              icon="solar:lock-password-bold" 
              className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="pl-10"
              required
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <div className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="rounded mt-1" required />
          <span className="text-muted-foreground">
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </span>
        </div>

        <Button
          type="submit"
          className="w-full shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <Icon icon="solar:loading-bold" className="size-4 animate-spin mr-2" />
              Creating Account...
            </>
          ) : (
            <>
              <Icon icon="solar:user-plus-bold" className="size-4 mr-2" />
              Create Account
            </>
          )}
        </Button>
      </div>
    </form>
  );
}