import { Icon } from '@iconify/react';

interface BreadcrumbItem {
  label: string;
  icon?: string;
}

interface AdminTopBarProps {
  breadcrumbs: BreadcrumbItem[];
  userAvatar?: React.ReactNode;
}

export function AdminTopBar({ breadcrumbs, userAvatar }: AdminTopBarProps) {
  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index === 0 && item.icon && (
                <Icon icon={item.icon} className="size-4 text-gray-400" />
              )}
              {index > 0 && <span className="text-gray-400">/</span>}
              <span className={index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : 'text-gray-600'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {userAvatar || (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon icon="solar:user-bold" className="size-4 text-blue-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}