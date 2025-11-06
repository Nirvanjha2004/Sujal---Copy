import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import type { 
  DashboardData, 
  DashboardStats
} from '../types/dashboard';
import type { 
  DashboardPreferences,
  WidgetConfiguration 
} from '../types/preferences';
import type { Activity } from '../types/activity';
import type { Notification } from '../types/notifications';
import { ROLE_CONFIGS, WIDGET_SIZES, DASHBOARD_LAYOUTS } from '../constants/dashboardConstants';

/**
 * Date formatting utilities for dashboard
 */
export const formatDate = {
  /**
   * Format date for display in dashboard
   */
  display: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'h:mm a')}`;
    }
    
    if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'h:mm a')}`;
    }
    
    return format(dateObj, 'MMM d, yyyy');
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  relative: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  },

  /**
   * Format date for activity timestamps
   */
  activity: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) {
      return format(dateObj, 'h:mm a');
    }
    
    if (isYesterday(dateObj)) {
      return 'Yesterday';
    }
    
    return format(dateObj, 'MMM d');
  },

  /**
   * Format date range for stats
   */
  range: (startDate: string | Date, endDate: string | Date): string => {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }
};

/**
 * Dashboard layout utilities
 */
export const layoutHelpers = {
  /**
   * Get responsive grid classes based on widget count
   */
  getGridClasses: (widgetCount: number, layout: string = DASHBOARD_LAYOUTS.GRID): string => {
    if (layout === DASHBOARD_LAYOUTS.LIST) {
      return 'grid grid-cols-1 gap-4';
    }
    
    if (layout === DASHBOARD_LAYOUTS.COMPACT) {
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3';
    }
    
    // Default grid layout
    if (widgetCount <= 2) {
      return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    } else if (widgetCount <= 4) {
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6';
    } else {
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  },

  /**
   * Get widget size classes
   */
  getWidgetSizeClasses: (size: string): string => {
    switch (size) {
      case WIDGET_SIZES.SMALL:
        return 'col-span-1';
      case WIDGET_SIZES.MEDIUM:
        return 'col-span-1 md:col-span-2';
      case WIDGET_SIZES.LARGE:
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case WIDGET_SIZES.FULL:
        return 'col-span-full';
      default:
        return 'col-span-1';
    }
  },

  /**
   * Calculate optimal widget arrangement
   */
  arrangeWidgets: (widgets: WidgetConfiguration[]): WidgetConfiguration[] => {
    // Sort widgets by position, then by priority
    return widgets
      .filter(widget => widget.isVisible)
      .sort((a, b) => {
        if (a.position.row !== b.position.row) {
          return a.position.row - b.position.row;
        }
        return a.position.column - b.position.column;
      });
  }
};

/**
 * Widget configuration utilities
 */
export const widgetHelpers = {
  /**
   * Get default widget configuration for a role
   */
  getDefaultWidgets: (role: string): string[] => {
    const config = ROLE_CONFIGS[role as keyof typeof ROLE_CONFIGS];
    return config ? [...config.defaultWidgets] : [];
  },

  /**
   * Create widget configuration from template
   */
  createWidgetConfig: (
    id: string, 
    type: string, 
    position: { row: number; column: number },
    size: { width: number; height: number } = { width: 2, height: 1 }
  ): WidgetConfiguration => {
    return {
      id,
      type: type as any,
      position,
      size,
      isVisible: true,
      settings: {}
    };
  },

  /**
   * Validate widget configuration
   */
  validateWidget: (widget: WidgetConfiguration): boolean => {
    return !!(
      widget.id &&
      widget.type &&
      widget.position &&
      typeof widget.position.row === 'number' &&
      typeof widget.position.column === 'number' &&
      typeof widget.isVisible === 'boolean'
    );
  }
};

/**
 * Dashboard data processing utilities
 */
export const dataHelpers = {
  /**
   * Process dashboard data for display
   */
  processDashboardData: (data: DashboardData): DashboardData => {
    return {
      ...data,
      recentActivity: data.recentActivity.slice(0, 10), // Limit to 10 recent activities
      notifications: data.notifications.filter(n => !n.isRead).slice(0, 5), // Show only unread, limit to 5
      quickActions: data.quickActions.filter(action => action.isEnabled !== false)
    };
  },

  /**
   * Group activities by date
   */
  groupActivitiesByDate: (activities: Activity[]): Record<string, Activity[]> => {
    return activities.reduce((groups, activity) => {
      const date = format(parseISO(activity.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {} as Record<string, Activity[]>);
  },

  /**
   * Filter activities by type
   */
  filterActivitiesByType: (activities: Activity[], types: string[]): Activity[] => {
    if (types.length === 0 || types.includes('all')) {
      return activities;
    }
    return activities.filter(activity => types.includes(activity.type));
  },

  /**
   * Sort notifications by priority and date
   */
  sortNotifications: (notifications: Notification[]): Notification[] => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    
    return [...notifications].sort((a, b) => {
      // First sort by priority
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
};

/**
 * Dashboard preferences utilities
 */
export const preferencesHelpers = {
  /**
   * Get default preferences for a role
   */
  getDefaultPreferences: (role: string): Partial<DashboardPreferences> => {
    const roleConfig = ROLE_CONFIGS[role as keyof typeof ROLE_CONFIGS];
    
    if (!roleConfig) {
      return {
        layout: DASHBOARD_LAYOUTS.GRID as any,
        widgets: [],
        notifications: {
          showInDashboard: true,
          maxItems: 10,
          autoRefresh: true,
          refreshInterval: 30000
        },
        theme: {
          mode: 'system',
          primaryColor: '#3b82f6',
          accentColor: '#10b981',
          fontSize: 'medium'
        }
      };
    }

    return {
      layout: DASHBOARD_LAYOUTS.GRID as any,
      widgets: roleConfig.defaultWidgets.map((widgetType, index) => 
        widgetHelpers.createWidgetConfig(
          `${widgetType}_${index}`,
          widgetType,
          { row: Math.floor(index / 2), column: index % 2 }
        )
      ),
      notifications: {
        showInDashboard: true,
        maxItems: 10,
        autoRefresh: true,
        refreshInterval: 30000
      },
      theme: {
        mode: 'system',
        primaryColor: '#3b82f6',
        accentColor: '#10b981',
        fontSize: 'medium'
      }
    };
  },

  /**
   * Merge user preferences with defaults
   */
  mergePreferences: (
    userPreferences: Partial<DashboardPreferences>, 
    defaultPreferences: Partial<DashboardPreferences>
  ): DashboardPreferences => {
    return {
      layout: userPreferences.layout || defaultPreferences.layout || DASHBOARD_LAYOUTS.GRID as any,
      widgets: userPreferences.widgets || defaultPreferences.widgets || [],
      notifications: {
        ...defaultPreferences.notifications,
        ...userPreferences.notifications
      },
      theme: {
        ...defaultPreferences.theme,
        ...userPreferences.theme
      }
    } as DashboardPreferences;
  }
};

/**
 * Number formatting utilities
 */
export const numberHelpers = {
  /**
   * Format large numbers with abbreviations (1K, 1M, etc.)
   */
  formatLargeNumber: (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  /**
   * Format percentage with proper decimal places
   */
  formatPercentage: (value: number, total: number): string => {
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(1)}%`;
  },

  /**
   * Calculate percentage change
   */
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
};

/**
 * Color utilities for dashboard elements
 */
export const colorHelpers = {
  /**
   * Get color based on trend direction
   */
  getTrendColor: (direction: 'up' | 'down' | 'stable'): string => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
      default:
        return 'text-gray-600';
    }
  },

  /**
   * Get background color for priority levels
   */
  getPriorityColor: (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Get status color for various dashboard elements
   */
  getStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'online':
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'inactive':
      case 'offline':
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'pending':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'draft':
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50';
    }
  }
};

/**
 * Validation utilities
 */
export const validationHelpers = {
  /**
   * Validate dashboard data structure
   */
  validateDashboardData: (data: any): data is DashboardData => {
    return !!(
      data &&
      data.user &&
      data.stats &&
      Array.isArray(data.recentActivity) &&
      Array.isArray(data.notifications) &&
      Array.isArray(data.quickActions) &&
      data.preferences
    );
  },

  /**
   * Validate stats data
   */
  validateStats: (stats: any): stats is DashboardStats => {
    return !!(
      stats &&
      typeof stats === 'object' &&
      Object.values(stats).every(value => typeof value === 'number' && value >= 0)
    );
  }
};