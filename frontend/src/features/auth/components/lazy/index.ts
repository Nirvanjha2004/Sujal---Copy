import { createPreloadableLazyComponent } from '@/shared/utils/lazyImports';

// Lazy load profile pages
export const LazyProfilePage = createPreloadableLazyComponent(
  () => import('../../pages/ProfilePage'),
  'ProfilePage'
);

// Lazy load profile components
export const LazyProfileLayout = createPreloadableLazyComponent(
  () => import('../layout/ProfileLayout'),
  'ProfileLayout'
);

export const LazyProfileSection = createPreloadableLazyComponent(
  () => import('../layout/ProfileSection'),
  'ProfileSection'
);

export const LazyProfileSidebar = createPreloadableLazyComponent(
  () => import('../layout/ProfileSidebar'),
  'ProfileSidebar'
);

export const LazyProfileForm = createPreloadableLazyComponent(
  () => import('../forms/ProfileForm'),
  'ProfileForm'
);

// Lazy load auth pages
export const LazyLoginPage = createPreloadableLazyComponent(
  () => import('../../pages/LoginPage'),
  'LoginPage'
);

export const LazyRegisterPage = createPreloadableLazyComponent(
  () => import('../../pages/RegisterPage'),
  'RegisterPage'
);

export const LazyOTPVerificationPage = createPreloadableLazyComponent(
  () => import('../../pages/OTPVerificationPage'),
  'OTPVerificationPage'
);

export const LazyPasswordResetPage = createPreloadableLazyComponent(
  () => import('../../pages/PasswordResetPage'),
  'PasswordResetPage'
);

// Preload functions
export const preloadProfileComponents = () => {
  LazyProfilePage.preload();
  LazyProfileLayout.preload();
  LazyProfileForm.preload();
};

export const preloadAuthComponents = () => {
  LazyLoginPage.preload();
  LazyRegisterPage.preload();
};