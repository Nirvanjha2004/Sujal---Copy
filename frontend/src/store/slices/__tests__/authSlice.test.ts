import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearError, clearAuth } from '../authSlice';

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should handle initial state', () => {
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle clearError', () => {
    // First set an error state
    store.dispatch({ type: 'auth/login/rejected', payload: 'Test error' });
    expect(store.getState().auth.error).toBe('Test error');

    // Then clear the error
    store.dispatch(clearError());
    expect(store.getState().auth.error).toBeNull();
  });

  it('should handle clearAuth', () => {
    // Set some auth state
    localStorage.setItem('token', 'test-token');
    store.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        user: { id: 1, email: 'test@example.com', name: 'Test User', role: 'buyer' },
        token: 'test-token',
      },
    });

    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('test-token');

    // Clear auth
    store.dispatch(clearAuth());
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});