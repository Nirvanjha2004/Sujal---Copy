// Dashboard-specific error handler

export interface DashboardError {
    code: string;
    message: string;
    field?: string;
    details?: any;
}

export function handleDashboardError(error: any): DashboardError {
    if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        return {
            code: errorData.code || 'UNKNOWN_ERROR',
            message: errorData.message || 'An error occurred',
            field: errorData.field,
            details: errorData.details
        };
    }

    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        return {
            code: 'NETWORK_ERROR',
            message: 'Connection failed. Please check your internet connection'
        };
    }

    if (error.response?.status === 401) {
        return {
            code: 'UNAUTHORIZED',
            message: 'Please log in to continue'
        };
    }

    return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred'
    };
}

export const DASHBOARD_ERROR_MESSAGES: Record<string, string> = {
    // Dashboard Stats
    STATS_FETCH_ERROR: 'Unable to load dashboard statistics',

    // Activity Feed
    ACTIVITY_FETCH_ERROR: 'Unable to load activity feed',

    // Notifications
    NOTIFICATION_FETCH_ERROR: 'Unable to load notifications',
    NOTIFICATION_MARK_READ_ERROR: 'Failed to mark notification as read',
    NOTIFICATION_DELETE_ERROR: 'Failed to delete notification',

    // User Stats
    USER_STATS_ERROR: 'Unable to load user statistics',

    // Permissions
    UNAUTHORIZED: 'Please log in to access the dashboard',
    FORBIDDEN: 'You do not have permission to access this',

    // General
    NETWORK_ERROR: 'Connection failed. Please check your internet',
    SERVER_ERROR: 'Something went wrong. Please try again later',
    UNKNOWN_ERROR: 'An unexpected error occurred'
};

export function getDashboardErrorMessage(code: string): string {
    return DASHBOARD_ERROR_MESSAGES[code] || DASHBOARD_ERROR_MESSAGES.UNKNOWN_ERROR;
}
