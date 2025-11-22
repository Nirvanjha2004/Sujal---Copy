import * as React from 'react';
import { Button } from './button';
import { useToastActions } from './toast-provider';
import { ToastAction } from './toast';

export function ToastDemo() {
  const { success, error, warning, info, custom } = useToastActions();

  const showSuccessToast = () => {
    success('Operation completed successfully!', {
      action: (
        <ToastAction onClick={() => {
          // Implement actual undo functionality
          success('Action undone successfully!');
        }}>
          Undo
        </ToastAction>
      )
    });
  };

  const showErrorToast = () => {
    error('Something went wrong. Please try again.', {
      duration: 0, // Persistent toast
    });
  };

  const showWarningToast = () => {
    warning('This action cannot be undone.');
  };

  const showInfoToast = () => {
    info('New features are now available!');
  };

  const showCustomToast = () => {
    custom({
      title: 'Custom Toast',
      description: 'This is a custom toast with no auto-dismiss.',
      variant: 'default',
      duration: 0,
      showProgress: false,
      action: (
        <div className="flex gap-2">
          <ToastAction onClick={() => {
            success('Request accepted!');
          }}>
            Accept
          </ToastAction>
          <ToastAction onClick={() => {
            info('Request declined.');
          }}>
            Decline
          </ToastAction>
        </div>
      )
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Toast Notifications Demo</h3>
      <div className="flex flex-wrap gap-3">
        <Button onClick={showSuccessToast} variant="default">
          Success Toast
        </Button>
        <Button onClick={showErrorToast} variant="destructive">
          Error Toast
        </Button>
        <Button onClick={showWarningToast} variant="outline">
          Warning Toast
        </Button>
        <Button onClick={showInfoToast} variant="secondary">
          Info Toast
        </Button>
        <Button onClick={showCustomToast} variant="ghost">
          Custom Toast
        </Button>
      </div>
    </div>
  );
}