import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/shared/lib/api';

export function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email from location state (passed from registration)
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.verifyEmail(email, otp);
      navigate('/login', { 
        state: { 
          message: 'Email verified successfully! You can now log in.' 
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || countdown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      await api.resendVerificationOTP(email);
      setCountdown(60); // 60 seconds countdown
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError(null);
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon icon="solar:home-smile-bold" className="size-10 text-primary" />
            <span className="text-2xl font-bold text-primary">PropPortal</span>
          </div>
          <h1 className="text-2xl font-heading font-bold tracking-tight mb-2">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground">
            We've sent a 6-digit code to <br />
            <span className="font-medium">{email}</span>
          </p>
        </div>

        {/* OTP Form */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">Enter Verification Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <Icon icon="solar:danger-bold" className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium text-center block">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
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
                disabled={otp.length !== 6 || isLoading}
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
            </form>
          </CardContent>
        </Card>

        {/* Back to Register */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/register')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
            Back to Registration
          </Button>
        </div>
      </div>
    </div>
  );
}