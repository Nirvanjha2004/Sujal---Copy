import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { RegisterForm } from '../components/forms/RegisterForm';
import { AuthCard } from '../components/ui/AuthCard';
import { AuthHeader } from '../components/ui/AuthHeader';
import { SocialLoginButtons } from '../components/ui/SocialLoginButtons';

export function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = (email: string) => {
    // Redirect to OTP verification
    navigate('/verify-email', { 
      state: { 
        email 
      } 
    });
  };

  const handleRegisterError = (error: string) => {
    console.error('Registration error:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <AuthHeader 
          title="Create Account"
          subtitle="Join thousands of property seekers and owners"
        />

        {/* Registration Form */}
        <AuthCard title="Sign Up">
          <RegisterForm 
            onSuccess={handleRegisterSuccess}
            onError={handleRegisterError}
            className="space-y-4"
          />

          <SocialLoginButtons className="mt-6" />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link 
              to="/login" 
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </AuthCard>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}