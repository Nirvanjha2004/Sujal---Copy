import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

import { useProfile } from '../../hooks/useProfile';
import { ProfileFormData, User } from '../../types';

interface ProfileFormProps {
  user: User;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function ProfileForm({ user, onSuccess, onError, className }: ProfileFormProps) {
  const { updateProfile, isLoading, error, fieldErrors, validateField, clearFieldError, clearError } = useProfile();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: '',
  });
  
  const [success, setSuccess] = useState('');

  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof ProfileFormData]) {
      clearFieldError(name as keyof ProfileFormData);
    }
    
    // Clear messages
    if (error) {
      clearError();
    }
    if (success) {
      setSuccess('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name as keyof ProfileFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateSuccess = await updateProfile(formData);
    
    if (updateSuccess) {
      setSuccess('Profile updated successfully!');
      onSuccess?.();
    } else {
      onError?.(error || 'Profile update failed');
    }
  };

  const isFormValid = 
    formData.firstName && 
    formData.lastName && 
    Object.keys(fieldErrors).length === 0;

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <Icon icon="solar:danger-bold" className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 mb-4">
          <Icon icon="solar:check-circle-bold" className="size-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {fieldErrors.firstName && (
              <p className="text-xs text-red-500">{fieldErrors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
            {fieldErrors.lastName && (
              <p className="text-xs text-red-500">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {fieldErrors.phone && (
            <p className="text-xs text-red-500">{fieldErrors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="avatar" className="text-sm font-medium">
            Avatar URL (Optional)
          </label>
          <Input
            id="avatar"
            name="avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={formData.avatar}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {fieldErrors.avatar && (
            <p className="text-xs text-red-500">{fieldErrors.avatar}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Icon icon="solar:loading-bold" className="size-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Icon icon="solar:diskette-bold" className="size-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}