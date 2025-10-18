import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLogin } from '../../hooks/useLogin';
import { LoginFormData } from '../../types';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function LoginForm({ onSuccess, onError, className }: LoginFormProps) {
  const { login, isLoading, error, fieldErrors, validateField, clearFieldError, clearError } = useLogin();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof LoginFormData]) {
      clearFieldError(name as keyof LoginFormData);
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name as keyof LoginFormData, value);
    // Field errors are handled by the useLogin hook
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(formData);
    
    if (success) {
      onSuccess?.();
    } else {
      onError?.(error || 'Login failed');
    }
  };

  const isFormValid = formData.email && formData.password && Object.keys(fieldErrors).length === 0;

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <Icon icon="solar:danger-bold" className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="pl-10"
              required
            />
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Remember me</span>
          </label>
          <a 
            href="/forgot-password" 
            className="text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <Icon icon="solar:loading-bold" className="size-4 animate-spin mr-2" />
              Signing In...
            </>
          ) : (
            <>
              <Icon icon="solar:login-bold" className="size-4 mr-2" />
              Sign In
            </>
          )}
        </Button>
      </div>
    </form>
  );
}