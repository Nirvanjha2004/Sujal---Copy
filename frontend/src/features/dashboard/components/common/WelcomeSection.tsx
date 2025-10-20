import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import type { User } from '@/features/auth/types';

interface WelcomeSectionProps {
  user: User;
  roleSpecificMessage?: string;
  primaryAction?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
  stats?: {
    label: string;
    value: number;
  };
  className?: string;
}

export function WelcomeSection({
  user,
  roleSpecificMessage,
  primaryAction,
  secondaryAction,
  stats,
  className
}: WelcomeSectionProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'builder':
        return 'bg-orange-100 text-orange-800';
      case 'owner':
        return 'bg-green-100 text-green-800';
      case 'buyer':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDefaultMessage = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Manage your platform and oversee all operations';
      case 'agent':
        return 'Manage your clients and grow your property portfolio';
      case 'builder':
        return 'Manage your construction projects and development portfolio';
      case 'owner':
        return 'Manage your property listings and tenant relationships';
      case 'buyer':
      default:
        return 'Find your dream property and manage your searches';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Card className={`bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-lg font-semibold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-heading font-bold tracking-tight">
                  {getGreeting()}, {user.firstName} {user.lastName}!
                </h1>
                <Badge variant="secondary" className={getRoleColor(user.role)}>
                  <Icon icon="solar:user-bold" className="size-3 mr-1" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {roleSpecificMessage || getDefaultMessage(user.role)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {stats && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{stats.value}</div>
                <div className="text-sm text-muted-foreground">{stats.label}</div>
              </div>
            )}
            
            <div className="flex gap-2">
              {secondaryAction && (
                <Button variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.icon && (
                    <Icon icon={secondaryAction.icon} className="size-4 mr-2" />
                  )}
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button onClick={primaryAction.onClick}>
                  {primaryAction.icon && (
                    <Icon icon={primaryAction.icon} className="size-4 mr-2" />
                  )}
                  {primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}