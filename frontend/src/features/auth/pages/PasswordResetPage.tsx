import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { PasswordResetForm } from '../components/forms/PasswordResetForm';
import { AuthCard } from '../components/ui/AuthCard';
import { AuthHeader } from '../components/ui/AuthHeader';

export function PasswordResetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setMode('reset');
      setToken(resetToken);
    } else {
      setMode('request');
      setToken(null);
    }
  }, [searchParams]);

  const handleRequestSuccess = () => {
    // Stay on the same page to show success message
    console.log('Password reset email sent successfully');
  };

  const handleResetSuccess = () => {
    // Redirect to login page after successful password reset
    navigate('/login', {
      state: {
        message: 'Password reset successfully! You can now log in with your new password.'
      }
    });
  };

  const handleError = (error: string) => {
    console.error('Password reset error:', error);
  };

  const getHeaderContent = () => {
    if (mode === 'request') {
      return {
        title: 'Forgot Password?',
        subtitle: 'Enter your email address and we\'ll send you instructions to reset your password'
      };
    } else {
      return {
        title: 'Reset Your Password',
        subtitle: 'Enter your new password below'
      };
    }
  };

  const getCardTitle = () => {
    return mode === 'request' ? 'Reset Password' : 'Set New Password';
  };

  const headerContent = getHeaderContent();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Header */}
        <AuthHeader 
          title={headerContent.title}
          subtitle={headerContent.subtitle}
        />

        {/* Password Reset Form */}
        <AuthCard title={getCardTitle()}>
          <PasswordResetForm 
            mode={mode}
            token={token || undefined}
            onSuccess={mode === 'request' ? handleRequestSuccess : handleResetSuccess}
            onError={handleError}
            className="space-y-4"
          />

          {mode === 'request' && (
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Remember your password? </span>
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          )}
        </AuthCard>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}