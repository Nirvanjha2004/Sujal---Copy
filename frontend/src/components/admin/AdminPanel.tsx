import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { PropertyModeration } from './PropertyModeration';
import { ContentManagement } from './ContentManagement';
import { BannerManagement } from './BannerManagement';
import { SeoManagement } from './SeoManagement';
import { EnhancedAnalyticsDashboard } from './AnalyticsDashboard';
import  ReviewModeration  from './ReviewModeration';
import  UrlRedirectManagement  from './UrlRedirectManagement';
import { RoleAssignment } from './RoleAssignment';

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
  {
    id: 'content',
    label: 'Content Management',
    icon: 'solar:document-text-bold',
    description: 'Manage website content',
    color: 'text-orange-600'
  },
  {
    id: 'banners',
    label: 'Banners & Announcements',
    icon: 'solar:megaphone-bold',
    description: 'Site banners & notifications',
    color: 'text-red-600'
  },
  // {
  //   id: 'seo',
  //   label: 'SEO Management',
  //   icon: 'solar:chart-2-bold',
  //   description: 'Meta tags & search optimization',
  //   color: 'text-indigo-600'
  // },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'solar:graph-up-bold',
    description: 'Traffic, leads & performance',
    color: 'text-teal-600'
  },
  {
    id: 'reviews',
    label: 'Review Moderation',
    icon: 'solar:star-bold',
    description: 'Moderate user reviews',
    color: 'text-yellow-600'
  },
  {
    id: 'redirects',
    label: 'URL Management',
    icon: 'solar:link-bold',
    description: 'Manage redirects & URLs',
    color: 'text-gray-600'
  },
  {
    id: 'roles',
    label: 'Role Assignment',
    icon: 'solar:shield-user-bold',
    description: 'Manage user roles & permissions',
    color: 'text-pink-600'
  },
];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentTab = navigationItems.find(item => item.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab as AdminTab)} />;
      case 'users':
        return <UserManagement />;
      case 'properties':
        return <PropertyModeration />;
      case 'content':
        return <ContentManagement />;
      case 'banners':
        return <BannerManagement />;
      case 'seo':
        return <SeoManagement />;
      case 'analytics':
        return <EnhancedAnalyticsDashboard />;
      case 'reviews':
        return <ReviewModeration />;
      case 'redirects':
        return <UrlRedirectManagement />;
      case 'roles':
        return <RoleAssignment />;
      default:
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab as AdminTab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'}`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Console</h1>
                <p className="text-sm text-gray-500">Real Estate Platform</p>
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
                    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon 
                  icon={item.icon} 
                  className={`size-5 ${activeTab === item.id ? 'text-blue-600' : item.color}`} 
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
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Icon icon="solar:home-bold" className="size-4 text-gray-400" />
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Admin</span>
              <span className="text-gray-400">/</span>
              <span className="font-medium text-gray-900">{currentTab?.label}</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* <Button variant="outline" size="sm">
                <Icon icon="solar:settings-bold" className="mr-2 size-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Icon icon="solar:bell-bold" className="mr-2 size-4" />
                Notifications
              </Button> */}
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon icon="solar:user-bold" className="size-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}