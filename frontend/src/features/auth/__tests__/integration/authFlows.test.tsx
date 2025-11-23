import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { OTPVerificationPage } from '../../pages/OTPVerificationPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { PasswordResetPage } from '../../pages/PasswordResetPage';
import { authService } from '../../services/authService';
import { tokenService } from '../../services/tokenService';

// Mock the auth service
vi.mock('../../services/authService');
vi.mock('../../services/tokenService');

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Test store setup
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
const TestWrapper = ({ children, initialState = {} }: { children: React.ReactNode; initialState?: any }) => {
  const store = createTestStore(initialState);
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('Authentication Flows Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should successfully login a user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'buyer' as const,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockAuthResponse = {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);
      vi.mocked(tokenService.setToken).mockReturnValue(true);

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Verify auth service was called
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Verify token was stored
      expect(tokenService.setToken).toHaveBeenCalledWith('mock-jwt-token');
    });

    it('should handle login errors gracefully', async () => {
      const mockError = {
        type: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      };

      vi.mocked(authService.login).mockRejectedValue(mockError);

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Fill in login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should redirect authenticated users to dashboard', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'buyer' as const,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(
        <TestWrapper initialState={{ user: mockUser, isAuthenticated: true, token: 'mock-token' }}>
          <LoginPage />
        </TestWrapper>
      );

      // Should redirect to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });
  });

  describe('Registration Flow', () => {
    it('should successfully register a new user', async () => {
      const mockAuthResponse = {
        user: {
          id: 1,
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'buyer' as const,
          isVerified: false,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      vi.mocked(authService.register).mockResolvedValue(mockAuthResponse);

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      // Fill in registration form
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const registerButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(firstNameInput, { target: { value: 'New' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(registerButton);

      // Verify auth service was called
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@example.com',
          password: 'password123',
        });
      });

      // Should redirect to OTP verification
      expect(mockNavigate).toHaveBeenCalledWith('/verify-email', {
        state: { email: 'newuser@example.com' },
      });
    });

    it('should handle registration errors', async () => {
      const mockError = {
        type: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already exists',
      };

      vi.mocked(authService.register).mockRejectedValue(mockError);

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      // Fill in registration form
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const registerButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(firstNameInput, { target: { value: 'Test' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(registerButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('OTP Verification Flow', () => {
    it('should successfully verify email with valid OTP', async () => {
      vi.mocked(authService.verifyEmail).mockResolvedValue();

      // Mock location state with email
      vi.mocked(require('react-router-dom').useLocation).mockReturnValue({
        state: { email: 'test@example.com' },
        pathname: '/verify-email',
      });

      render(
        <TestWrapper>
          <OTPVerificationPage />
        </TestWrapper>
      );

      // Fill in OTP
      const otpInputs = screen.getAllByRole('textbox');
      otpInputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: (index + 1).toString() } });
      });

      const verifyButton = screen.getByRole('button', { name: /verify/i });
      fireEvent.click(verifyButton);

      // Verify auth service was called
      await waitFor(() => {
        expect(authService.verifyEmail).toHaveBeenCalledWith('test@example.com', '123456');
      });

      // Should redirect to login with success message
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { message: 'Email verified successfully! You can now log in.' },
      });
    });

    it('should handle OTP verification errors', async () => {
      const mockError = {
        type: 'INVALID_OTP',
        message: 'Invalid or expired OTP',
      };

      vi.mocked(authService.verifyEmail).mockRejectedValue(mockError);

      // Mock location state with email
      vi.mocked(require('react-router-dom').useLocation).mockReturnValue({
        state: { email: 'test@example.com' },
        pathname: '/verify-email',
      });

      render(
        <TestWrapper>
          <OTPVerificationPage />
        </TestWrapper>
      );

      // Fill in invalid OTP
      const otpInputs = screen.getAllByRole('textbox');
      otpInputs.forEach((input) => {
        fireEvent.change(input, { target: { value: '0' } });
      });

      const verifyButton = screen.getByRole('button', { name: /verify/i });
      fireEvent.click(verifyButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid or expired otp/i)).toBeInTheDocument();
      });
    });

    it('should redirect to register if no email in state', () => {
      // Mock location state without email
      vi.mocked(require('react-router-dom').useLocation).mockReturnValue({
        state: null,
        pathname: '/verify-email',
      });

      render(
        <TestWrapper>
          <OTPVerificationPage />
        </TestWrapper>
      );

      // Should redirect to register
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('Password Reset Flow', () => {
    it('should successfully send password reset email', async () => {
      vi.mocked(authService.sendPasswordReset).mockResolvedValue();

      render(
        <TestWrapper>
          <PasswordResetPage />
        </TestWrapper>
      );

      // Fill in email for password reset request
      const emailInput = screen.getByLabelText(/email/i);
      const sendButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(sendButton);

      // Verify auth service was called
      await waitFor(() => {
        expect(authService.sendPasswordReset).toHaveBeenCalledWith('test@example.com');
      });

      // Should show success message
      expect(screen.getByText(/reset link sent/i)).toBeInTheDocument();
    });

    it('should successfully reset password with valid token', async () => {
      vi.mocked(authService.resetPassword).mockResolvedValue();

      // Mock search params with reset token
      vi.mocked(require('react-router-dom').useSearchParams).mockReturnValue([
        new URLSearchParams('?token=reset-token-123'),
        vi.fn(),
      ]);

      render(
        <TestWrapper>
          <PasswordResetPage />
        </TestWrapper>
      );

      // Fill in new password
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const resetButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.click(resetButton);

      // Verify auth service was called
      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith('reset-token-123', 'newpassword123');
      });

      // Should redirect to login with success message
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: {
          message: 'Password reset successfully! You can now log in with your new password.',
        },
      });
    });
  });

  describe('Profile Management Flow', () => {
    it('should successfully update user profile', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'buyer' as const,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const updatedUser = {
        ...mockUser,
        firstName: 'Updated',
        lastName: 'Name',
      };

      vi.mocked(authService.updateProfile).mockResolvedValue(updatedUser);

      render(
        <TestWrapper initialState={{ user: mockUser, isAuthenticated: true, token: 'mock-token' }}>
          <ProfilePage />
        </TestWrapper>
      );

      // Update profile information
      const firstNameInput = screen.getByDisplayValue('Test');
      const lastNameInput = screen.getByDisplayValue('User');
      const updateButton = screen.getByRole('button', { name: /update profile/i });

      fireEvent.change(firstNameInput, { target: { value: 'Updated' } });
      fireEvent.change(lastNameInput, { target: { value: 'Name' } });
      fireEvent.click(updateButton);

      // Verify auth service was called
      await waitFor(() => {
        expect(authService.updateProfile).toHaveBeenCalledWith({
          firstName: 'Updated',
          lastName: 'Name',
        });
      });

      // Should show success message
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'buyer' as const,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authService.logout).mockResolvedValue();
      vi.mocked(tokenService.clearToken).mockImplementation(() => {});

      const store = createTestStore({ user: mockUser, isAuthenticated: true, token: 'mock-token' });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <ProfilePage />
          </BrowserRouter>
        </Provider>
      );

      // Find and click logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Verify auth service was called
      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
      });

      // Verify token was cleared
      expect(tokenService.clearToken).toHaveBeenCalled();
    });
  });
});