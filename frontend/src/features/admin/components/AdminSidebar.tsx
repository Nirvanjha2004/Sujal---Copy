import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  badge?: string;
  color?: string;
}

interface AdminSidebarProps {
  navigationItems: NavItem[];
  activeTab: string;
  collapsed: boolean;
  onTabChange: (tab: string) => void;
  onToggleCollapse: () => void;
}

export function AdminSidebar({
  navigationItems,
  activeTab,
  collapsed,
  onTabChange,
  onToggleCollapse
}: AdminSidebarProps) {
  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-80'}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Console</h1>
              <p className="text-sm text-gray-500">Real Estate Platform</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
          >
            <Icon 
              icon={collapsed ? 'solar:hamburger-menu-bold' : 'solar:sidebar-minimalistic-bold'} 
              className="size-5" 
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
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
              {!collapsed && (
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
  );
}