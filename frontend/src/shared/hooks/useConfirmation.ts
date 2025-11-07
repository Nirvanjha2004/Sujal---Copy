import { useState, useCallback, useRef } from 'react';

export interface ConfirmationConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  icon?: string;
}

interface ConfirmationState {
  isOpen: boolean;
  config: ConfirmationConfig;
  loading: boolean;
}

interface PendingConfirmation {
  resolve: (value: boolean) => void;
  reject: (error: Error) => void;
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    config: {
      title: '',
      description: '',
    },
    loading: false,
  });

  const pendingConfirmationRef = useRef<PendingConfirmation | null>(null);

  const confirm = useCallback((config: ConfirmationConfig): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // If there's already a pending confirmation, reject the previous one
      if (pendingConfirmationRef.current) {
        pendingConfirmationRef.current.reject(new Error('Confirmation cancelled by new request'));
      }

      pendingConfirmationRef.current = { resolve, reject };
      
      setState({
        isOpen: true,
        config,
        loading: false,
      });
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!pendingConfirmationRef.current) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      // Simulate async operation if needed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      pendingConfirmationRef.current.resolve(true);
      pendingConfirmationRef.current = null;
      
      setState(prev => ({ 
        ...prev, 
        isOpen: false, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      if (pendingConfirmationRef.current) {
        pendingConfirmationRef.current.reject(error as Error);
        pendingConfirmationRef.current = null;
      }
    }
  }, []);

  const handleCancel = useCallback(() => {
    if (pendingConfirmationRef.current) {
      pendingConfirmationRef.current.resolve(false);
      pendingConfirmationRef.current = null;
    }
    
    setState(prev => ({ 
      ...prev, 
      isOpen: false, 
      loading: false 
    }));
  }, []);

  const reset = useCallback(() => {
    if (pendingConfirmationRef.current) {
      pendingConfirmationRef.current.reject(new Error('Confirmation reset'));
      pendingConfirmationRef.current = null;
    }
    
    setState({
      isOpen: false,
      config: {
        title: '',
        description: '',
      },
      loading: false,
    });
  }, []);

  return {
    // State
    isOpen: state.isOpen,
    config: state.config,
    loading: state.loading,
    
    // Actions
    confirm,
    handleConfirm,
    handleCancel,
    reset,
  };
}

// Convenience functions for common confirmation types
export function useDeleteConfirmation() {
  const { confirm } = useConfirmation();

  const confirmDelete = useCallback((itemName?: string) => {
    return confirm({
      title: 'Confirm Deletion',
      description: itemName 
        ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
        : 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      icon: 'solar:trash-bin-trash-bold',
    });
  }, [confirm]);

  return { confirmDelete };
}

export function useLogoutConfirmation() {
  const { confirm } = useConfirmation();

  const confirmLogout = useCallback(() => {
    return confirm({
      title: 'Confirm Logout',
      description: 'Are you sure you want to log out? You will need to sign in again to access your account.',
      confirmText: 'Log Out',
      cancelText: 'Stay Signed In',
      variant: 'warning',
      icon: 'solar:logout-bold',
    });
  }, [confirm]);

  return { confirmLogout };
}

export function useUnsavedChangesConfirmation() {
  const { confirm } = useConfirmation();

  const confirmUnsavedChanges = useCallback(() => {
    return confirm({
      title: 'Unsaved Changes',
      description: 'You have unsaved changes that will be lost if you continue. Are you sure you want to proceed?',
      confirmText: 'Discard Changes',
      cancelText: 'Keep Editing',
      variant: 'warning',
      icon: 'solar:danger-triangle-bold',
    });
  }, [confirm]);

  return { confirmUnsavedChanges };
}