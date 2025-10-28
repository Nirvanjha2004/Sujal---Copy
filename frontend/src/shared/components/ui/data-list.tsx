import { EnhancedList, ListItem } from "./enhanced-list";

// Generic Data List Types
export interface DataListColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => string | number;
  icon?: string;
}

export interface DataListAction<T> {
  icon: string;
  label: string;
  onClick: (item: T) => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  show?: (item: T) => boolean;
}

export interface DataListProps<T> {
  data: T[];
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed' | 'grid';
  
  // Display configuration
  titleKey: keyof T | string;
  subtitleKey?: keyof T | string;
  descriptionKey?: keyof T | string;
  imageKey?: keyof T | string;
  
  // Metadata columns to display
  metadataColumns?: DataListColumn<T>[];
  
  // Actions
  actions?: DataListAction<T>[];
  
  // Status configuration
  statusKey?: keyof T | string;
  statusColorMap?: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'>;
  
  // Badge configuration
  badgeKey?: keyof T | string;
  badgeVariantMap?: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'>;
  
  // Event handlers
  onItemClick?: (item: T) => void;
  getItemId?: (item: T, index: number) => string | number;
  
  // Empty state
  emptyState?: {
    icon?: string;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  
  className?: string;
}

// Generic Data List Component
export function DataList<T>({
  data,
  loading = false,
  variant = 'default',
  titleKey,
  subtitleKey,
  descriptionKey,
  imageKey,
  metadataColumns = [],
  actions = [],
  statusKey,
  statusColorMap = {},
  badgeKey,
  badgeVariantMap = {},
  onItemClick,
  getItemId = (_: T, index: number) => index,
  emptyState,
  className,
}: DataListProps<T>) {
  
  // Helper function to get nested property value
  const getNestedValue = (obj: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((value: any, k) => value?.[k], obj);
    }
    return (obj as any)[key];
  };

  // Convert data items to list items
  const listItems: ListItem[] = data.map((item, index) => {
    const title = getNestedValue(item, titleKey);
    const subtitle = subtitleKey ? getNestedValue(item, subtitleKey) : undefined;
    const description = descriptionKey ? getNestedValue(item, descriptionKey) : undefined;
    const image = imageKey ? getNestedValue(item, imageKey) : undefined;
    
    // Build metadata
    const metadata = metadataColumns.map(column => ({
      icon: column.icon,
      label: column.label,
      value: column.render 
        ? column.render(getNestedValue(item, column.key), item)
        : getNestedValue(item, column.key),
    }));

    // Build actions
    const itemActions = actions
      .filter(action => !action.show || action.show(item))
      .map(action => ({
        icon: action.icon,
        label: action.label,
        onClick: () => action.onClick(item),
        variant: action.variant || 'outline',
      }));

    // Get status
    const statusValue = statusKey ? getNestedValue(item, statusKey) : undefined;
    const status = statusValue ? {
      text: statusValue,
      color: statusColorMap[statusValue] || 'default',
    } : undefined;

    // Get badge
    const badgeValue = badgeKey ? getNestedValue(item, badgeKey) : undefined;
    const badge = badgeValue ? {
      text: badgeValue,
      variant: badgeVariantMap[badgeValue] || 'secondary',
    } : undefined;

    return {
      id: getItemId(item, index),
      title: title?.toString() || '',
      subtitle: subtitle?.toString(),
      description: description?.toString(),
      image: image?.toString(),
      metadata,
      actions: itemActions,
      status,
      badge,
    };
  });

  return (
    <EnhancedList
      items={listItems}
      loading={loading}
      variant={variant}
      showImages={!!imageKey}
      showActions={actions.length > 0}
      showMetadata={metadataColumns.length > 0}
      emptyState={emptyState}
      onItemClick={onItemClick ? (listItem) => {
        const originalItem = data.find((item, index) => getItemId(item, index) === listItem.id);
        if (originalItem) {
          onItemClick(originalItem);
        }
      } : undefined}
      className={className}
    />
  );
}

// Specialized Data List Components

// User List Component
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
}

interface UserListProps {
  users: User[];
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed' | 'grid';
  onUserClick?: (user: User) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
  className?: string;
}

export function UserList({
  users,
  loading = false,
  variant = 'default',
  onUserClick,
  onEditUser,
  onDeleteUser,
  className,
}: UserListProps) {
  const actions: DataListAction<User>[] = [];
  
  if (onEditUser) {
    actions.push({
      icon: "solar:pen-bold",
      label: "Edit",
      onClick: onEditUser,
      variant: "outline",
    });
  }
  
  if (onDeleteUser) {
    actions.push({
      icon: "solar:trash-bin-trash-bold",
      label: "Delete",
      onClick: onDeleteUser,
      variant: "destructive",
    });
  }

  return (
    <DataList
      data={users}
      loading={loading}
      variant={variant}
      titleKey="name"
      subtitleKey="email"
      imageKey="avatar"
      metadataColumns={[
        {
          key: "role",
          label: "Role",
          icon: "solar:user-bold",
        },
        {
          key: "lastLogin",
          label: "Last Login",
          icon: "solar:clock-circle-bold",
          render: (value) => value ? new Date(value).toLocaleDateString() : 'Never',
        },
      ]}
      actions={actions}
      statusKey="status"
      statusColorMap={{
        active: 'success',
        inactive: 'error',
        pending: 'warning',
      }}
      onItemClick={onUserClick}
      getItemId={(user, _) => user.id}
      emptyState={{
        icon: "solar:users-group-rounded-bold",
        title: "No users found",
        description: "There are no users to display.",
      }}
      className={className}
    />
  );
}

// Activity List Component
export interface Activity {
  id: number;
  title: string;
  description?: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'logout';
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityListProps {
  activities: Activity[];
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  onActivityClick?: (activity: Activity) => void;
  className?: string;
}

export function ActivityList({
  activities,
  loading = false,
  variant = 'compact',
  onActivityClick,
  className,
}: ActivityListProps) {


  return (
    <DataList
      data={activities}
      loading={loading}
      variant={variant}
      titleKey="title"
      subtitleKey="user"
      descriptionKey="description"
      metadataColumns={[
        {
          key: "type",
          label: "Type",
          icon: "solar:tag-bold",
          render: (value) => value.charAt(0).toUpperCase() + value.slice(1),
        },
        {
          key: "timestamp",
          label: "Time",
          icon: "solar:clock-circle-bold",
          render: (value) => new Date(value).toLocaleString(),
        },
      ]}
      badgeKey="type"
      badgeVariantMap={{
        create: 'default',
        update: 'secondary',
        delete: 'destructive',
        login: 'outline',
        logout: 'outline',
      }}
      onItemClick={onActivityClick}
      getItemId={(activity, _) => activity.id}
      emptyState={{
        icon: "solar:history-bold",
        title: "No activity found",
        description: "There is no recent activity to display.",
      }}
      className={className}
    />
  );
}

// Notification List Component
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notification: Notification) => void;
  onDelete?: (notification: Notification) => void;
  className?: string;
}

export function NotificationList({
  notifications,
  loading = false,
  onNotificationClick,
  onMarkAsRead,
  onDelete,
  className,
}: NotificationListProps) {
  const actions: DataListAction<Notification>[] = [];
  
  if (onMarkAsRead) {
    actions.push({
      icon: "solar:check-circle-bold",
      label: "Mark as Read",
      onClick: onMarkAsRead,
      variant: "outline",
      show: (notification) => !notification.read,
    });
  }
  
  if (onDelete) {
    actions.push({
      icon: "solar:trash-bin-trash-bold",
      label: "Delete",
      onClick: onDelete,
      variant: "ghost",
    });
  }

  return (
    <DataList
      data={notifications}
      loading={loading}
      variant="compact"
      titleKey="title"
      subtitleKey="message"
      metadataColumns={[
        {
          key: "timestamp",
          label: "Time",
          icon: "solar:clock-circle-bold",
          render: (value) => new Date(value).toLocaleTimeString(),
        },
      ]}
      actions={actions}
      statusKey="type"
      statusColorMap={{
        info: 'info',
        success: 'success',
        warning: 'warning',
        error: 'error',
      }}
      badgeKey="read"
      badgeVariantMap={{
        false: 'default',
        true: 'secondary',
      }}
      onItemClick={onNotificationClick}
      getItemId={(notification, _) => notification.id}
      emptyState={{
        icon: "solar:bell-bold",
        title: "No notifications",
        description: "You're all caught up! No new notifications.",
      }}
      className={className}
    />
  );
}