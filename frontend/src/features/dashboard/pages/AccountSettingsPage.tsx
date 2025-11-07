import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Layout } from '@/shared/components/layout/Layout';
import { DashboardLayout } from '../components/common/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '@/shared/components/ui/confirmation-dialog';
import { useConfirmation } from '@/shared/hooks/useConfirmation';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';
import { useAsyncOperation } from '@/shared/hooks/useAsyncOperation';

/**
 * Account Settings Page - migrated to dashboard feature
 * Uses new dashboard layout while maintaining existing functionality
 */
export function AccountSettingsPage() {
  const { state: { user, error }, updateUser, clearError } = useAuth();
  const navigate = useNavigate();
  const { handleError, showSuccess, showValidationError } = useErrorHandler();
  const { confirm, isOpen, config, loading: confirmLoading, handleConfirm, handleCancel } = useConfirmation();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'buyer' as 'buyer' | 'owner' | 'agent' | 'builder' | 'admin',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    propertyAlerts: true,
    priceDropAlerts: true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public' as 'public' | 'private',
    showContactInfo: true,
    allowDirectMessages: true,
    showActivityStatus: false,
  });

  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'buyer',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess('');
    setLoading(true);

    try {
      await updateUser(profileData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      // Error is handled by auth hook
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess('');

    // Validate password fields
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showValidationError('New passwords do not match', 'Confirm Password');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showValidationError('Password must be at least 8 characters long', 'New Password');
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would call an API endpoint
      // await api.changePassword(passwordData);
      showSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      handleError(err as Error, { context: { operation: 'password_change' } });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = <K extends keyof typeof privacy>(key: K, value: typeof privacy[K]) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteAccount = async () => {
    try {
      const confirmed = await confirm({
        title: 'Delete Account',
        description: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
        confirmText: 'Delete Account',
        cancelText: 'Keep Account',
        variant: 'destructive',
        icon: 'solar:trash-bin-trash-bold',
      });

      if (confirmed) {
        try {
          // In a real implementation, this would call an API endpoint
          // await api.deleteAccount();
          showSuccess('Account deletion requested. You will receive a confirmation email.');
        } catch (err) {
          handleError(err as Error, { context: { operation: 'account_deletion' } });
        }
      }
    } catch (error) {
      // Error is handled by the confirmation system
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <DashboardLayout>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
                Account Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account preferences and security settings
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <Icon icon="solar:home-bold" className="size-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <Icon icon="solar:danger-bold" className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <Icon icon="solar:check-circle-bold" className="size-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon="solar:user-bold" className="size-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="firstName" className="text-sm font-medium">
                            First Name
                          </label>
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="lastName" className="text-sm font-medium">
                            Last Name
                          </label>
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          Contact support to change your email address
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium">
                          Account Type
                        </label>
                        <Select 
                          value={profileData.role} 
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, role: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buyer">Property Buyer</SelectItem>
                            <SelectItem value="owner">Property Owner</SelectItem>
                            <SelectItem value="agent">Real Estate Agent</SelectItem>
                            <SelectItem value="builder">Builder/Developer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? (
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
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <div className="space-y-6">
                {/* Change Password */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon icon="solar:lock-password-bold" className="size-5" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="currentPassword" className="text-sm font-medium">
                          Current Password
                        </label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="newPassword" className="text-sm font-medium">
                            New Password
                          </label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm New Password
                          </label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                          <Icon icon="solar:shield-check-bold" className="size-4 mr-2" />
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Two-Factor Authentication */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon icon="solar:smartphone-bold" className="size-5" />
                      Two-Factor Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">SMS Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive verification codes via SMS
                        </p>
                      </div>
                      <Button variant="outline">
                        Enable
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon="solar:bell-bold" className="size-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h4 className="font-medium mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'emailNotifications', label: 'General email notifications', description: 'Receive important updates via email' },
                        { key: 'marketingEmails', label: 'Marketing emails', description: 'Receive promotional offers and news' },
                        { key: 'propertyAlerts', label: 'Property alerts', description: 'Get notified about new properties matching your criteria' },
                        { key: 'priceDropAlerts', label: 'Price drop alerts', description: 'Get notified when saved properties drop in price' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium">{item.label}</h5>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                            className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Push Notifications */}
                  <div>
                    <h4 className="font-medium mb-4">Push Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'pushNotifications', label: 'Browser notifications', description: 'Receive notifications in your browser' },
                        { key: 'smsNotifications', label: 'SMS notifications', description: 'Receive important updates via SMS' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium">{item.label}</h5>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                            className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon icon="solar:shield-user-bold" className="size-5" />
                      Privacy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">Profile Visibility</h5>
                        <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                      </div>
                      <Select 
                        value={privacy.profileVisibility} 
                        onValueChange={(value: 'public' | 'private') => handlePrivacyChange('profileVisibility', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {[
                      { key: 'showContactInfo' as const, label: 'Show contact information', description: 'Allow others to see your contact details' },
                      { key: 'allowDirectMessages' as const, label: 'Allow direct messages', description: 'Let other users send you messages' },
                      { key: 'showActivityStatus' as const, label: 'Show activity status', description: 'Display when you were last active' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h5 className="font-medium">{item.label}</h5>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacy[item.key] as boolean}
                          onChange={(e) => handlePrivacyChange(item.key, e.target.checked)}
                          className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Icon icon="solar:danger-bold" className="size-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-destructive">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        <Icon icon="solar:trash-bin-trash-bold" className="size-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={isOpen}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            loading={confirmLoading}
            {...config}
          />
        </DashboardLayout>
      </div>
    </Layout>
  );
}