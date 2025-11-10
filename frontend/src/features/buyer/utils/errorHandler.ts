// Buyer-specific error handler

export interface BuyerError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export function handleBuyerError(error: any): BuyerError {
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

export const BUYER_ERROR_MESSAGES: Record<string, string> = {
  // Favorites
  FAVORITE_ALREADY_EXISTS: 'This property is already in your favorites',
  FAVORITE_NOT_FOUND: 'This favorite no longer exists',
  FAVORITE_ADD_ERROR: 'Failed to add to favorites. Please try again',
  FAVORITE_REMOVE_ERROR: 'Failed to remove from favorites. Please try again',
  
  // Saved Searches
  SEARCH_NAME_EXISTS: 'A search with this name already exists',
  SEARCH_NOT_FOUND: 'This saved search no longer exists',
  SEARCH_SAVE_ERROR: 'Failed to save search. Please try again',
  SEARCH_DELETE_ERROR: 'Failed to delete search. Please try again',
  INVALID_SEARCH_NAME: 'Please provide a valid search name',
  
  // Stats
  STATS_FETCH_ERROR: 'Unable to load statistics',
  
  // Validation
  INVALID_PROPERTY_ID: 'Invalid property selected',
  VALIDATION_ERROR: 'Please check your input and try again',
  
  // Permissions
  UNAUTHORIZED: 'Please log in to access this feature',
  FORBIDDEN: 'You do not have permission to perform this action',
  
  // General
  NETWORK_ERROR: 'Connection failed. Please check your internet',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  UNKNOWN_ERROR: 'An unexpected error occurred'
};

export function getBuyerErrorMessage(code: string): string {
  return BUYER_ERROR_MESSAGES[code] || BUYER_ERROR_MESSAGES.UNKNOWN_ERROR;
}
