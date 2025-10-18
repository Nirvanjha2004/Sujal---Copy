import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OTPVerificationFormData } from '../../types';
import { authService } from '../../services/authService';

interface OTPVerificationFormProps {
  email: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onResendSuccess?: () => void;
  className?: string;
}

export function OTPVerificationForm({ 
  email, 
  onSuccess, 
  onError, 
  onResendSuccess, 
  className 
}: OTPVerificationFormProps) {
  const [formData, setFormData] = useState<OTPVerificationFormData>({
    email,
    otp: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({
      ...prev,
      otp: value
    }));
    
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(formData.email, formData.otp);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Verification failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      await authService.resendVerificationOTP(formData.email);
      setCountdown(60); // 60 seconds countdown
      onResendSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to resend OTP';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <Icon icon="solar:danger-bold" className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="otp" className="text-sm font-medium text-center block">
            Verification Code
          </label>
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            value={formData.otp}
            onChange={handleOtpChange}
            className="text-center text-2xl font-mono tracking-widest"
            maxLength={6}
            required
          />
          <p className="text-xs text-muted-foreground text-center">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <Button
          type="submit"
          className="w-full shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
          disabled={formData.otp.length !== 6 || isLoading}
        >
          {isLoading ? (
            <>
              <Icon icon="solar:loading-bold" className="size-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            <>
              <Icon icon="solar:check-circle-bold" className="size-4 mr-2" />
              Verify Email
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn't receive the code?
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendOTP}
            disabled={countdown > 0 || isResending}
            className="text-primary hover:text-primary/80"
          >
            {isResending ? (
              <>
                <Icon icon="solar:loading-bold" className="size-4 animate-spin mr-2" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              <>
                <Icon icon="solar:refresh-bold" className="size-4 mr-2" />
                Resend Code
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}