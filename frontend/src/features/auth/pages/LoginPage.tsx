import { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { useAuth } from '@/shared/contexts/AuthContext';
import { LoginForm } from '../components/forms/LoginForm';
import { AuthCard } from '../components/ui/AuthCard';
import { AuthHeader } from '../components/ui/AuthHeader';
import { SocialLoginButtons } from '../components/ui/SocialLoginButtons';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();
  
  const successMessage = location.state?.message;

  // Handle authentication redirect
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      const userRole = state.user.role;
      console.log('User authenticated. Role:', userRole, 'Redirecting...');

      // Determine the destination based on the user's role
      const destination = location.state?.from?.pathname || (userRole === 'admin' ? '/admin' : '/dashboard');
      
      // Perform the redirection
      navigate(destination, { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate, location.state]);

  const handleLoginSuccess = () => {
    // Success is handled by the useEffect above
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Header */}
        <AuthHeader 
          title="Welcome Back"
          subtitle="Sign in to your account to continue"
        />

        {/* Login Form */}
        <AuthCard title="Sign In">
          {successMessage && (
            <Alert className="border-green-200 bg-green-50 text-green-800 mb-4">
              <Icon icon="solar:check-circle-bold" className="size-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            className="space-y-4"
          />

          {/* <SocialLoginButtons className="mt-6" /> */}

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link 
              to="/register" 
              className="text-primary hover:underline font-medium"
            >
              Sign up
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