import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Alert, AlertDescription } from './alert';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  showDetails?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  resetError, 
  showDetails = false 
}: ErrorFallbackProps) {
  const [showErrorDetails, setShowErrorDetails] = React.useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  const handleReportError = () => {
    // In a real app, this would send error to monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('Error report:', errorReport);
    
    // Copy error details to clipboard
    navigator.clipboard?.writeText(JSON.stringify(errorReport, null, 2));
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-destructive">
            <Icon icon="solar:danger-triangle-bold" className="w-6 h-6" />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We're sorry, but something unexpected happened. You can try refreshing the page or contact support if the problem persists.
          </p>

          {showDetails && (
            <Alert variant="destructive">
              <AlertDescription className="font-mono text-sm">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={resetError} className="flex-1">
              <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleReload} variant="outline" className="flex-1">
              <Icon icon="solar:restart-bold" className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-2">
              <Button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                <Icon 
                  icon={showErrorDetails ? "solar:eye-closed-bold" : "solar:eye-bold"} 
                  className="w-4 h-4 mr-2" 
                />
                {showErrorDetails ? 'Hide' : 'Show'} Error Details
              </Button>

              {showErrorDetails && (
                <div className="space-y-2">
                  <div className="bg-muted p-3 rounded-md">
                    <h4 className="font-semibold text-sm mb-2">Error Details:</h4>
                    <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>

                  {errorInfo?.componentStack && (
                    <div className="bg-muted p-3 rounded-md">
                      <h4 className="font-semibold text-sm mb-2">Component Stack:</h4>
                      <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <Button
                    onClick={handleReportError}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Icon icon="solar:copy-bold" className="w-4 h-4 mr-2" />
                    Copy Error Report
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Compact error fallback for smaller components
export function CompactErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Alert variant="destructive" className="m-4">
      <Icon icon="solar:danger-triangle-bold" className="w-4 h-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Something went wrong: {error.message}</span>
        <Button onClick={resetError} size="sm" variant="outline">
          <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// Hook for programmatic error boundary usage
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
  };
}

export default ErrorBoundary;