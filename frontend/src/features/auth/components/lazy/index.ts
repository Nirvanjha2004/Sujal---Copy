import { createPreloadableLazyComponent } from '@/shared/utils/lazyImports';

// Lazy load profile pages
export const LazyProfilePage = createPreloadableLazyComponent(
  () => import('../../pages/ProfilePage')
);

// Lazy load profile components
export const LazyProfileLayout = createPreloadableLazyComponent(
  () => import('../layout/ProfileLayout')
);

export const LazyProfileSection = createPreloadableLazyComponent(
  () => import('../layout/ProfileSection')
);

export const LazyProfileSidebar = createPreloadableLazyComponent(
  () => import('../layout/ProfileSidebar')
);

export const LazyProfileForm = createPreloadableLazyComponent(
  () => import('../forms/ProfileForm')
);

// Lazy load auth pages
export const LazyLoginPage = createPreloadableLazyComponent(
  () => import('../../pages/LoginPage')
);

export const LazyRegisterPage = createPreloadableLazyComponent(
  () => import('../../pages/RegisterPage')
);

export const LazyOTPVerificationPage = createPreloadableLazyComponent(
  () => import('../../pages/OTPVerificationPage')
);

export const LazyPasswordResetPage = createPreloadableLazyComponent(
  () => import('../../pages/PasswordResetPage')
);

// Preload functions
export const preloadProfileComponents = () => {
  (LazyProfilePage as any).preload();
  (LazyProfileLayout as any).preload();
  (LazyProfileForm as any).preload();
};

export const preloadAuthComponents = () => {
  (LazyLoginPage as any).preload();
  (LazyRegisterPage as any).preload();
};