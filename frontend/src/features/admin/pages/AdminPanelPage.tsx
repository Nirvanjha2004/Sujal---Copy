import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Layout } from '@/shared/components/layout/Layout';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';
import { AdminDashboardPage } from './AdminDashboardPage';
import { UserManagementPage } from './UserManagementPage';
import { PropertyModerationPage } from './PropertyModerationPage';
import { ContentManagementPage } from './ContentManagementPage';
import { BannerManagementPage } from './BannerManagementPage';
import { AnalyticsDashboardPage } from './AnalyticsDashboardPage';
import { ReviewModerationPage } from './ReviewModerationPage';
import { UrlRedirectManagementPage } from './UrlRedirectManagementPage';
import { RoleAssignmentPage } from './RoleAssignmentPage';

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'properties'
  | 'content'
  | 'banners'
  | 'seo'
  | 'analytics'
  | 'reviews'
  | 'redirects'
  | 'roles';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: string;
  description: string;
  badge?: string;
  color?: string;
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'solar:home-bold',
    description: 'Overview & quick actions',
    color: 'text-blue-600'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'solar:users-group-rounded-bold',
    description: 'Manage users & approvals',
    color: 'text-green-600'
  },
  {
    id: 'properties',
    label: 'Property Moderation',
    icon: 'solar:home-2-bold',
    description: 'Review & moderate listings',
    badge: 'New',
    color: 'text-purple-600'
  },
  // {
  //   id: 'content',
  //   label: 'Content Management',
  //   icon: 'solar:document-text-bold',
  //   description: 'Manage website content',
  //   color: 'text-orange-600'
  // },
  // {
  //   id: 'banners',
  //   label: 'Banners & Announcements',
  //   icon: 'solar:megaphone-bold',
  //   description: 'Site banners & notifications',
  //   color: 'text-red-600'
  // },
  // {
  //   id: 'seo',
  //   label: 'SEO Management',
  //   icon: 'solar:chart-2-bold',
  //   description: 'Meta tags & search optimization',
  //   color: 'text-indigo-600'
  // },
  // {
  //   id: 'analytics',
  //   label: 'Analytics',
  //   icon: 'solar:graph-up-bold',
  //   description: 'Traffic, leads & performance',
  //   color: 'text-teal-600'
  // },
  // {
  //   id: 'reviews',
  //   label: 'Review Moderation',
  //   icon: 'solar:star-bold',
  //   description: 'Moderate user reviews',
  //   color: 'text-yellow-600'
  // },
  // {
  //   id: 'redirects',
  //   label: 'URL Management',
  //   icon: 'solar:link-bold',
  //   description: 'Manage redirects & URLs',
  //   color: 'text-gray-600'
  // },
  {
    id: 'roles',
    label: 'Role Assignment',
    icon: 'solar:shield-user-bold',
    description: 'Manage user roles & permissions',
    color: 'text-pink-600'
  },
];

export function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout, state: authState } = useAuth();

  const currentTab = navigationItems.find(item => item.id === activeTab);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardPage onNavigate={(tab) => setActiveTab(tab as AdminTab)} />;
      case 'users':
        return <UserManagementPage />;
      case 'properties':
        return <PropertyModerationPage />;
      case 'content':
        return <ContentManagementPage />;
      case 'banners':
        return <BannerManagementPage />;
      // case 'seo':
      //   return <SeoManagementPage />;
      case 'analytics':
        return <AnalyticsDashboardPage />;
      case 'reviews':
        return <ReviewModerationPage />;
      case 'redirects':
        return <UrlRedirectManagementPage />;
      case 'roles':
        return <RoleAssignmentPage />;
      default:
        return <AdminDashboardPage onNavigate={(tab) => setActiveTab(tab as AdminTab)} />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div className={`bg-card shadow-lg border-r transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'}`}>
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-foreground">Admin Console</h1>
                  <p className="text-sm text-muted-foreground">Real Estate Platform</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Icon
                  icon={sidebarCollapsed ? 'solar:hamburger-menu-bold' : 'solar:sidebar-minimalistic-bold'}
                  className="size-5"
                />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary/10 border-l-4 border-primary text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon
                    icon={item.icon}
                    className={`size-5 ${activeTab === item.id ? 'text-primary' : item.color}`}
                  />
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </nav>

            {/* User Info & Logout */}
            {!sidebarCollapsed && (
              <div className="mt-auto pt-6 border-t mt-6">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon icon="solar:user-bold" className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {authState.user?.first_name} {authState.user?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {authState.user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <Icon icon="solar:logout-2-bold" className="size-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-card shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <Icon icon="solar:home-bold" className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">Admin</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium text-foreground">{currentTab?.label}</span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <Icon icon="solar:home-2-bold" className="size-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <Icon icon="solar:logout-2-bold" className="size-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-6 overflow-auto bg-background">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
}