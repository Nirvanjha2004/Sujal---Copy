/**
 * Utility functions for JWT token management
 */

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Validates a JWT token structure and expiration
 */
export function validateToken(token: string): { isValid: boolean; payload?: TokenPayload; error?: string } {
  try {
    if (!token) {
      return { isValid: false, error: 'Token is empty' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, error: 'Invalid token format' };
    }

    const payload = JSON.parse(atob(parts[1])) as TokenPayload;
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      return { isValid: false, error: 'Token expired', payload };
    }

    return { isValid: true, payload };
  } catch (error) {
    return { isValid: false, error: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Gets a valid token from localStorage, clearing it if invalid
 */
export function getValidToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const validation = validateToken(token);
  if (!validation.isValid) {
    console.warn('Invalid token found in localStorage:', validation.error);
    localStorage.removeItem('token');
    return null;
  }

  return token;
}

/**
 * Clears the token from localStorage
 */
export function clearToken(): void {
  localStorage.removeItem('token');
}

/**
 * Sets a token in localStorage after validation
 */
export function setToken(token: string): boolean {
  const validation = validateToken(token);
  if (!validation.isValid) {
    console.warn('Attempted to set invalid token:', validation.error);
    return false;
  }

  localStorage.setItem('token', token);
  return true;
}

/**
 * Gets the time until token expiration in seconds
 */
export function getTokenTimeToExpiry(token?: string): number | null {
  const tokenToCheck = token || getValidToken();
  if (!tokenToCheck) return null;

  const validation = validateToken(tokenToCheck);
  if (!validation.isValid || !validation.payload) return null;

  const currentTime = Math.floor(Date.now() / 1000);
  return validation.payload.exp - currentTime;
}

/**
 * Checks if token will expire within the specified number of seconds
 */
export function isTokenExpiringSoon(token?: string, thresholdSeconds: number = 300): boolean {
  const timeToExpiry = getTokenTimeToExpiry(token);
  return timeToExpiry !== null && timeToExpiry <= thresholdSeconds;
}