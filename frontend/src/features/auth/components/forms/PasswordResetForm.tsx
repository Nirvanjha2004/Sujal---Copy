import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordResetFormData, NewPasswordFormData } from '../../types';
import { authService } from '../../services/authService';
import { validationService } from '../../utils/validation';

interface PasswordResetFormProps {
  mode?: 'request' | 'reset';
  token?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function PasswordResetForm({ 
  mode = 'request', 
  token, 
  onSuccess, 
  onError, 
  className 
}: PasswordResetFormProps) {
  const [requestData, setRequestData] = useState<PasswordResetFormData>({
    email: '',
  });
  
  const [resetData, setResetData] = useState<NewPasswordFormData>({
    password: '',
    confirmPassword: '',
    token: token || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequestData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validationService.validateEmail(requestData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.sendPasswordReset(requestData.email);
      setSuccess('Password reset instructions have been sent to your email');
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send password reset email';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (resetData.password !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      setError('Please choose a stronger password');
      return;
    }

    if (!resetData.token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.resetPassword(resetData.token, resetData.password);
      setSuccess('Password has been reset successfully');
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'request') {
    return (
      <form onSubmit={handleRequestSubmit} className={className}>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <Icon icon="solar:danger-bold" className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <Icon icon="solar:check-circle-bold" className="size-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
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
                placeholder="Enter your email address"
                value={requestData.email}
                onChange={handleRequestChange}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send you instructions to reset your password
            </p>
          </div>

          <Button
            type="submit"
            className="w-full shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
            disabled={!requestData.email || isLoading}
          >
            {isLoading ? (
              <>
                <Icon icon="solar:loading-bold" className="size-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Icon icon="solar:letter-bold" className="size-4 mr-2" />
                Send Reset Instructions
              </>
            )}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleResetSubmit} className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <Icon icon="solar:danger-bold" className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 mb-4">
          <Icon icon="solar:check-circle-bold" className="size-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New Password
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
              placeholder="Enter your new password"
              value={resetData.password}
              onChange={handleResetChange}
              className="pl-10"
              required
            />
          </div>
          {resetData.password && (
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
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm New Password
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
              placeholder="Confirm your new password"
              value={resetData.confirmPassword}
              onChange={handleResetChange}
              className="pl-10"
              required
            />
          </div>
          {resetData.confirmPassword && resetData.password !== resetData.confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
          disabled={
            !resetData.password || 
            !resetData.confirmPassword || 
            resetData.password !== resetData.confirmPassword ||
            passwordStrength < 3 ||
            isLoading
          }
        >
          {isLoading ? (
            <>
              <Icon icon="solar:loading-bold" className="size-4 animate-spin mr-2" />
              Resetting Password...
            </>
          ) : (
            <>
              <Icon icon="solar:lock-password-bold" className="size-4 mr-2" />
              Reset Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
}