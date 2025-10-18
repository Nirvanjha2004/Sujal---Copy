import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Social authentication buttons component
 * Provides consistent styling and behavior for social login options
 */
export function SocialLoginButtons({ 
  onGoogleLogin, 
  onFacebookLogin, 
  isLoading = false,
  className 
}: SocialLoginButtonsProps) {
  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onGoogleLogin}
          disabled={isLoading}
        >
          <Icon icon="solar:google-bold" className="size-4 mr-2" />
          Google
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onFacebookLogin}
          disabled={isLoading}
        >
          <Icon icon="solar:facebook-bold" className="size-4 mr-2" />
          Facebook
        </Button>
      </div>
    </div>
  );
}