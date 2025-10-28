import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/ui/form-field';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Layout } from '@/shared/components/layout/Layout';
import { useFavorites } from '@/features/buyer/hooks/useFavorites';
import { api } from '@/shared/lib/api';
import { ProfileForm } from '../components/forms/ProfileForm';
import { ProfileLayout, ProfileSection, ProfileSidebar, ProfileNavigationItem } from '../components/layout';

export function ProfilePage() {
  const { state } = useAuth();
  const { favorites } = useFavorites();
  const [savedSearchesCount, setSavedSearchesCount] = useState(0);
  const [userRole, setUserRole] = useState<'buyer' | 'owner' | 'agent' | 'builder' | 'admin'>('buyer');
  const [activeSection, setActiveSection] = useState('personal');

  useEffect(() => {
    const fetchSavedSearches = async () => {
      try {
        const response = await api.getSavedSearches();
        setSavedSearchesCount(response.data?.savedSearches?.length || 0);
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

  // Navigation items for profile sidebar
  const navigationItems: ProfileNavigationItem[] = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: 'solar:user-bold',
    },
    {
      id: 'account',
      label: 'Account Settings',
      icon: 'solar:settings-bold',
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: 'solar:chart-bold',
      badge: favorites.length + savedSearchesCount,
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'solar:shield-check-bold',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'solar:bell-bold',
    },
  ];

  const handleSectionChange = (item: ProfileNavigationItem) => {
    setActiveSection(item.id);
  };

  if (!state.user) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-6">
            <ProfileForm 
              user={{
                ...state.user!,
                isVerified: true,
                isActive: true,
                createdAt: state.user!.createdAt || new Date().toISOString(),
                updatedAt: state.user!.updatedAt || new Date().toISOString(),
              }}
              onSuccess={handleProfileSuccess}
              onError={handleProfileError}
            />

            <ProfileSection
              title="Email Address"
              description="Your email address is used for login and notifications"
              icon="solar:letter-bold"
            >
              <FormField
                label="Email Address"
                description="Email cannot be changed for security reasons"
              >
                <Input
                  type="email"
                  value={state.user?.email || ''}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
              </FormField>
            </ProfileSection>
          </div>
        );

      case 'account':
        return (
          <ProfileSection
            title="Account Settings"
            description="Manage your account preferences and settings"
            icon="solar:settings-bold"
          >
            <FormField
              label="Account Type"
              description="Select your primary role on the platform"
            >
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
            </FormField>
          </ProfileSection>
        );

      case 'stats':
        return (
          <ProfileSection
            title="Account Statistics"
            description="Overview of your activity on the platform"
            icon="solar:chart-bold"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/10">
                <Icon icon="solar:heart-bold" className="size-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary">{favorites.length}</div>
                <div className="text-sm text-muted-foreground font-medium">Saved Properties</div>
              </div>
              <div className="text-center p-6 bg-success/5 rounded-lg border border-success/10">
                <Icon icon="solar:bookmark-bold" className="size-10 text-success mx-auto mb-3" />
                <div className="text-3xl font-bold text-success">{savedSearchesCount}</div>
                <div className="text-sm text-muted-foreground font-medium">Saved Searches</div>
              </div>
              <div className="text-center p-6 bg-warning/5 rounded-lg border border-warning/10">
                <Icon icon="solar:eye-bold" className="size-10 text-warning mx-auto mb-3" />
                <div className="text-3xl font-bold text-warning">0</div>
                <div className="text-sm text-muted-foreground font-medium">Property Views</div>
              </div>
            </div>
          </ProfileSection>
        );

      case 'security':
        return (
          <ProfileSection
            title="Security Settings"
            description="Manage your account security and privacy"
            icon="solar:shield-check-bold"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                    <Icon icon="solar:lock-password-bold" className="size-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-success/10">
                    <Icon icon="solar:smartphone-bold" className="size-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-warning/10">
                    <Icon icon="solar:devices-bold" className="size-5 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-medium">Login Sessions</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your active login sessions
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  Manage
                </Button>
              </div>
            </div>
          </ProfileSection>
        );

      case 'notifications':
        return (
          <ProfileSection
            title="Notification Preferences"
            description="Control how and when you receive notifications"
            icon="solar:bell-bold"
            collapsible
            defaultExpanded={true}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your properties and searches
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Get instant alerts on your mobile device
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </ProfileSection>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <ProfileLayout
        title="Profile Settings"
        subtitle="Manage your account information and preferences"
        sidebar={
          <ProfileSidebar
            navigation={navigationItems}
            activeItem={activeSection}
            onItemClick={handleSectionChange}
          />
        }
        actions={
          <Button variant="outline" size="sm">
            <Icon icon="solar:export-bold" className="size-4 mr-2" />
            Export Data
          </Button>
        }
      >
        {renderContent()}
      </ProfileLayout>
    </Layout>
  );
}