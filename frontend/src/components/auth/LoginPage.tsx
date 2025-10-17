import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/shared/contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, login, clearError } = useAuth();
  
  const successMessage = location.state?.message;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // --- START: THE FIX ---
  // This useEffect will run when the authentication state changes.
  useEffect(() => {
    // Check if the user is authenticated and the user object is available
    if (state.isAuthenticated && state.user) {
      const userRole = state.user.role;
      console.log('User authenticated. Role:', userRole, 'Redirecting...');

      // Determine the destination based on the user's role
      const destination = location.state?.from?.pathname || (userRole === 'admin' ? '/admin' : '/dashboard');
      
      // Perform the redirection
      navigate(destination, { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate, location.state]);
  // --- END: THE FIX ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (state.error) clearError();
  };

  // The handleSubmit function now only needs to trigger the login.
  // The useEffect above will handle the redirection.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData.email, formData.password);
      // The redirect is now handled by the useEffect.
      // No more navigate('/dashboard') here.
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by the auth state
    }
  };

  const isFormValid = formData.email && formData.password;

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
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {successMessage && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <Icon icon="solar:check-circle-bold" className="size-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              
              {state.error && (
                <Alert variant="destructive">
                  <Icon icon="solar:danger-bold" className="size-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

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
                    className="pl-10"
                    required
                  />
                </div>
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
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
                disabled={!isFormValid || state.isLoading}
              >
                {state.isLoading ? (
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
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Icon icon="solar:google-bold" className="size-4 mr-2" />
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <Icon icon="solar:facebook-bold" className="size-4 mr-2" />
                  Facebook
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link 
                to="/register" 
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

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