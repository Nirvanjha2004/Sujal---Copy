import { useToastActions } from '../components/ui';

// Re-export for convenience
export { useToast, useToastActions } from '@/shared/components/ui/toast-provider';

// Simple toast function for quick usage
export const toast = {
  success: (message: string) => {
    // This will be implemented when the provider is available
    console.log('Success toast:', message);
  },
  error: (message: string) => {
    console.log('Error toast:', message);
  },
  warning: (message: string) => {
    console.log('Warning toast:', message);
  },
  info: (message: string) => {
    console.log('Info toast:', message);
  },
};

// Hook that provides toast functions
export const useToastNotifications = () => {
  try {
    const actions = useToastActions();
    return actions;
  } catch {
    // Fallback when provider is not available
    return {
      success: (message: string) => console.log('Success:', message),
      error: (message: string) => console.log('Error:', message),
      warning: (message: string) => console.log('Warning:', message),
      info: (message: string) => console.log('Info:', message),
      custom: (toast: any) => console.log('Custom toast:', toast),
    };
  }
};