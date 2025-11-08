import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { OTPVerificationForm } from '../components/forms/OTPVerificationForm';
import { AuthCard } from '../components/ui/AuthCard';
import { AuthHeader } from '../components/ui/AuthHeader';

export function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state (passed from registration)
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
  }, [email, navigate]);

  const handleVerificationSuccess = () => {
    navigate('/login', { 
      state: { 
        message: 'Email verified successfully! You can now log in.' 
      } 
    });
  };

  const handleVerificationError = (error: string) => {
    console.error('Verification error:', error);
  };

  const handleResendSuccess = () => {
    console.log('OTP resent successfully');
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Header */}
        <AuthHeader 
          title="Verify Your Email"
          subtitle={`We've sent a 6-digit code to ${email}`}
        />

        {/* OTP Form */}
        <AuthCard title="Enter Verification Code">
          <OTPVerificationForm 
            email={email}
            onSuccess={handleVerificationSuccess}
            onError={handleVerificationError}
            onResendSuccess={handleResendSuccess}
          />
        </AuthCard>

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