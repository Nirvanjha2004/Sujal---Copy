import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { cn } from '@/shared/lib/utils';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  loading?: boolean;
  icon?: string;
}

const variantConfig = {
  default: {
    icon: 'solar:question-circle-bold',
    iconColor: 'text-blue-500',
    confirmVariant: 'default' as const,
  },
  destructive: {
    icon: 'solar:danger-triangle-bold',
    iconColor: 'text-red-500',
    confirmVariant: 'destructive' as const,
  },
  warning: {
    icon: 'solar:warning-circle-bold',
    iconColor: 'text-yellow-500',
    confirmVariant: 'default' as const,
  },
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  icon,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      // Error handling is managed by the calling component
      console.error('Confirmation action failed:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !loading) {
      event.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
        aria-describedby="confirmation-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            {displayIcon && (
              <div className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                variant === 'destructive' && 'bg-red-50',
                variant === 'warning' && 'bg-yellow-50',
                variant === 'default' && 'bg-blue-50'
              )}>
                <Icon 
                  icon={displayIcon} 
                  className={cn('w-5 h-5', config.iconColor)} 
                />
              </div>
            )}
            <DialogTitle className="text-left">{title}</DialogTitle>
          </div>
        </DialogHeader>
        
        <DialogDescription 
          id="confirmation-description"
          className="text-left text-muted-foreground leading-relaxed"
        >
          {description}
        </DialogDescription>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {loading ? (
              <>
                <Icon icon="solar:loading-bold" className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Convenience hook for using confirmation dialogs
export function useConfirmationDialog() {
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    config: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    config: {
      title: '',
      description: '',
    },
  });

  const confirm = React.useCallback((config: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        config,
        resolve,
      });
    });
  }, []);

  const handleClose = React.useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState(prev => ({ ...prev, isOpen: false, resolve: undefined }));
  }, [dialogState.resolve]);

  const handleConfirm = React.useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState(prev => ({ ...prev, isOpen: false, resolve: undefined }));
  }, [dialogState.resolve]);

  const ConfirmationDialogComponent = React.useCallback(() => (
    <ConfirmationDialog
      {...dialogState.config}
      isOpen={dialogState.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  ), [dialogState, handleClose, handleConfirm]);

  return {
    confirm,
    ConfirmationDialog: ConfirmationDialogComponent,
  };
}