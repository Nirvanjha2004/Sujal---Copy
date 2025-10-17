import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { api } from '@/shared/lib/api';

export function ProfilePage() {
  const { state, updateUser, clearError } = useAuth();
  const { favorites } = useFavorites();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'buyer' as 'buyer' | 'owner' | 'agent' | 'builder' | 'admin',
  });
  const [success, setSuccess] = useState('');
  const [savedSearchesCount, setSavedSearchesCount] = useState(0);

  useEffect(() => {
    const fetchSavedSearches = async () => {
      try {
        const response = await api.getSavedSearches();
        setSavedSearchesCount(response.data.length);
      } catch (error) {
        console.error('Failed to fetch saved searches:', error);
      }
    };

    if (state.isAuthenticated) {
      fetchSavedSearches();
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    if (state.user) {
      setFormData({
        firstName: state.user.firstName || '',
        lastName: state.user.lastName || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        role: state.user.role || 'buyer',
      });
    }
  }, [state.user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (state.error) clearError();
    if (success) setSuccess('');
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as 'buyer' | 'owner' | 'agent' | 'builder' | 'admin'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess('');

    try {
      await updateUser(formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="solar:user-bold" className="size-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {state.error && (
                    <Alert variant="destructive">
                      <Icon icon="solar:danger-bold" className="size-4" />
                      <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <Icon icon="solar:check-circle-bold" className="size-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

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
                          value={formData.firstName}
                          onChange={handleInputChange}
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
                          value={formData.lastName}
                          onChange={handleInputChange}
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
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled // Email usually shouldn't be changed
                      />
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
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium">
                        Account Type
                      </label>
                      <Select value={formData.role} onValueChange={handleRoleChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Property Buyer</SelectItem>
                          <SelectItem value="owner">Property Owner</SelectItem>
                          <SelectItem value="agent">Real Estate Agent</SelectItem>
                          <SelectItem value="builder">Builder/Developer</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={state.isLoading}
                      className="shadow-lg shadow-primary/20"
                    >
                      {state.isLoading ? (
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

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="solar:chart-bold" className="size-5" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <Icon icon="solar:heart-bold" className="size-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{favorites.length}</div>
                    <div className="text-sm text-muted-foreground">Saved Properties</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <Icon icon="solar:bookmark-bold" className="size-8 text-accent mx-auto mb-2" />
                    <div className="text-2xl font-bold">{savedSearchesCount}</div>
                    <div className="text-sm text-muted-foreground">Saved Searches</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/5 rounded-lg">
                    <Icon icon="solar:eye-bold" className="size-8 text-secondary mx-auto mb-2" />
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Property Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="solar:shield-check-bold" className="size-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  <Button variant="outline">
                    <Icon icon="solar:lock-password-bold" className="size-4 mr-2" />
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">
                    <Icon icon="solar:smartphone-bold" className="size-4 mr-2" />
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Login Sessions</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your active login sessions
                    </p>
                  </div>
                  <Button variant="outline">
                    <Icon icon="solar:devices-bold" className="size-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}