import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/features/auth';
import { Layout } from '@/components/layout/Layout';
import { useFavorites } from '@/features/buyer/hooks/useFavorites';
import { api } from '@/shared/lib/api';
import { ProfileForm } from '../components/forms/ProfileForm';

export function ProfilePage() {
  const { state } = useAuth();
  const { favorites } = useFavorites();
  const [savedSearchesCount, setSavedSearchesCount] = useState(0);
  const [userRole, setUserRole] = useState<'buyer' | 'owner' | 'agent' | 'builder' | 'admin'>('buyer');

  useEffect(() => {
    const fetchSavedSearches = async () => {
      try {
        const response = await api.getSavedSearches();
        setSavedSearchesCount(response.data?.searches?.length || 0);
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
      setUserRole(state.user.role || 'buyer');
    }
  }, [state.user]);

  const handleRoleChange = (value: string) => {
    setUserRole(value as 'buyer' | 'owner' | 'agent' | 'builder' | 'admin');
  };

  const handleProfileSuccess = () => {
    console.log('Profile updated successfully');
  };

  const handleProfileError = (error: string) => {
    console.error('Profile update error:', error);
  };

  if (!state.user) {
    return null;
  }

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
                <div className="space-y-4">
                  <ProfileForm 
                    user={{
                      ...state.user!,
                      isVerified: true, // Default value since it's not in the shared User type
                      isActive: true, // Default value since it's not in the shared User type
                      createdAt: state.user!.created_at || new Date().toISOString(),
                      updatedAt: state.user!.updated_at || new Date().toISOString(),
                    }}
                    onSuccess={handleProfileSuccess}
                    onError={handleProfileError}
                  />

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={state.user.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Account Type
                    </label>
                    <Select value={userRole} onValueChange={handleRoleChange}>
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