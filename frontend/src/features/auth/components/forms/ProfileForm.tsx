import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/ui/form-field';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

import { useProfile } from '../../hooks/useProfile';
import { ProfileFormData, User, ProfileUpdateData } from '../../types';

interface ProfileFormProps {
  user: User;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function ProfileForm({ user, onSuccess, onError, className }: ProfileFormProps) {
  const { updateProfile, error, fieldErrors, validateField, clearFieldError, clearError } = useProfile();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: '',
  });
  
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      // Clean phone number - remove country code prefix if present
      let cleanPhone = user.phone || '';
      if (cleanPhone) {
        // Remove +91, +91-, or any non-digit characters except the 10 digits
        cleanPhone = cleanPhone.replace(/^\+91-?/, '').replace(/\D/g, '');
      }
      
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: cleanPhone,
        avatar: user.profile_image || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Special handling for phone number - only allow digits
    if (name === 'phone') {
      // Remove all non-digit characters
      processedValue = value.replace(/\D/g, '');
      // Limit to 10 digits
      if (processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear field error when user starts typing
    const fieldKey = name === 'avatar' ? 'profile_image' : name;
    if (fieldErrors[fieldKey as keyof ProfileUpdateData]) {
      clearFieldError(fieldKey as keyof ProfileUpdateData);
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
    const fieldKey = name === 'avatar' ? 'profile_image' : name;
    validateField(fieldKey as keyof ProfileUpdateData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Map frontend field names to backend field names
      const backendFormData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        avatar: formData.avatar,
      };
      
      const updateSuccess = await updateProfile(backendFormData);
      
      if (updateSuccess) {
        setSuccess('Profile updated successfully!');
        onSuccess?.();
      } else {
        onError?.(error || 'Profile update failed');
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Profile update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    formData.firstName && 
    formData.lastName && 
    Object.keys(fieldErrors).length === 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="solar:user-bold" className="size-5 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Messages */}
          <div className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <Icon icon="solar:danger-bold" className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-success/20 bg-success/5">
                <Icon icon="solar:check-circle-bold" className="size-4 text-success" />
                <AlertDescription className="text-success">{success}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                required
                error={fieldErrors.firstName}
              >
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </FormField>

              <FormField
                label="Last Name"
                required
                error={fieldErrors.lastName}
              >
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </FormField>
            </div>

            {/* Phone Field */}
            <FormField
              label="Phone Number"
              description="Enter 10-digit Indian mobile number (e.g., 9876543212)"
              error={fieldErrors.phone}
            >
              <div className="relative">
                <Icon 
                  icon="solar:phone-bold" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" 
                />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="9876543212"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  maxLength={10}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                {formData.phone && formData.phone.length === 10 && (
                  <Icon 
                    icon="solar:check-circle-bold" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 text-success" 
                  />
                )}
              </div>
            </FormField>

            {/* Avatar Field */}
            <FormField
              label="Profile Picture"
              description="URL to your profile picture (optional)"
              error={fieldErrors.avatar}
            >
              <div className="space-y-3">
                <div className="relative">
                  <Icon 
                    icon="solar:camera-bold" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" 
                  />
                  <Input
                    id="avatar"
                    name="avatar"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                {/* Avatar Preview */}
                {formData.avatar && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                    <div className="size-10 rounded-full overflow-hidden bg-muted">
                      <img
                        src={formData.avatar}
                        alt="Avatar preview"
                        className="size-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Preview of your profile picture
                    </div>
                  </div>
                )}
              </div>
            </FormField>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}
              className="min-w-[140px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="solar:loading-bold" className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-bold" className="size-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}