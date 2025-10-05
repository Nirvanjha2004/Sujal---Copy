import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Layout } from '@/components/layout/Layout';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { PropertyModeration } from './PropertyModeration';
import { ContentManagement } from './ContentManagement';
import { RoleAssignment } from './RoleAssignment';
import { SeoManagement } from './SeoManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import ReviewModeration from './ReviewModeration';
import UrlRedirectManagement from './UrlRedirectManagement';

type AdminTab = 'dashboard' | 'users' | 'properties' | 'content' | 'roles' | 'seo' | 'analytics' | 'reviews' | 'redirects';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard',
      icon: 'solar:chart-2-bold',
      description: 'Overview and analytics',
    },
    {
      id: 'users' as AdminTab,
      label: 'User Management',
      icon: 'solar:users-group-rounded-bold',
      description: 'Manage and moderate users',
    },
    {
      id: 'properties' as AdminTab,
      label: 'Property Moderation',
      icon: 'solar:home-2-bold',
      description: 'Review and manage listings',
    },
    {
      id: 'content' as AdminTab,
      label: 'Content Management',
      icon: 'solar:document-text-bold',
      description: 'Banners and announcements',
    },
    {
      id: 'roles' as AdminTab,
      label: 'Role Assignment',
      icon: 'solar:user-id-bold',
      description: 'Manage user roles',
    },
    {
      id: 'seo' as AdminTab,
      label: 'SEO Management',
      icon: 'solar:magnifer-zoom-in-bold',
      description: 'SEO settings and metadata',
    },
    {
      id: 'analytics' as AdminTab,
      label: 'Analytics',
      icon: 'solar:chart-2-bold',
      description: 'Traffic and performance analytics',
    },
    {
      id: 'reviews' as AdminTab,
      label: 'Review Moderation',
      icon: 'solar:star-bold',
      description: 'Moderate user reviews',
    },
    {
      id: 'redirects' as AdminTab,
      label: 'URL Redirects',
      icon: 'solar:link-bold',
      description: 'Manage URL redirects',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'properties':
        return <PropertyModeration />;
      case 'content':
        return <ContentManagement />;
      case 'roles':
        return <RoleAssignment />;
      case 'seo':
        return <SeoManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'reviews':
        return <ReviewModeration />;
      case 'redirects':
        return <UrlRedirectManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  // If we're showing the dashboard tab, render it directly without the tab wrapper
  if (activeTab === 'dashboard') {
    return renderTabContent();
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Manage your real estate portal</p>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      icon={tab.icon}
                      className={`mr-2 size-5 ${
                        activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <div className="text-left">
                      <div>{tab.label}</div>
                      <div className="text-xs text-gray-400">{tab.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
}