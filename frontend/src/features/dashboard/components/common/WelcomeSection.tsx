import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { User } from '@/features/auth/types';

interface QuickAction {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

interface WelcomeSectionProps {
  user: User;
  roleSpecificMessage?: string;
  quickActions?: QuickAction[];
  stats?: Array<{
    label: string;
    value: number | string;
    icon?: string;
    color?: string;
  }>;
  lastActivity?: {
    action: string;
    timestamp: Date;
  };
  className?: string;
}

export function WelcomeSection({
  user,
  roleSpecificMessage,
  quickActions = [],
  stats = [],
  lastActivity,
  className
}: WelcomeSectionProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          color: 'bg-purple-500/10 text-purple-700 border-purple-200',
          icon: 'solar:shield-user-bold',
          gradient: 'from-purple-500/10 via-purple-500/5 to-transparent'
        };
      case 'agent':
        return {
          color: 'bg-blue-500/10 text-blue-700 border-blue-200',
          icon: 'solar:case-minimalistic-bold',
          gradient: 'from-blue-500/10 via-blue-500/5 to-transparent'
        };
      case 'builder':
        return {
          color: 'bg-orange-500/10 text-orange-700 border-orange-200',
          icon: 'solar:hammer-bold',
          gradient: 'from-orange-500/10 via-orange-500/5 to-transparent'
        };
      case 'owner':
        return {
          color: 'bg-green-500/10 text-green-700 border-green-200',
          icon: 'solar:home-bold',
          gradient: 'from-green-500/10 via-green-500/5 to-transparent'
        };
      case 'buyer':
      default:
        return {
          color: 'bg-primary/10 text-primary border-primary/20',
          icon: 'solar:user-bold',
          gradient: 'from-primary/10 via-primary/5 to-transparent'
        };
    }
  };

  const getPersonalizedMessage = (role: string, firstName: string) => {
    const messages = {
      admin: [
        `Welcome back, ${firstName}! Your platform is running smoothly.`,
        `Great to see you, ${firstName}! Ready to manage your platform?`,
        `Hello ${firstName}! Everything is under control.`
      ],
      agent: [
        `Welcome back, ${firstName}! Ready to close some deals today?`,
        `Great to see you, ${firstName}! Your clients are waiting.`,
        `Hello ${firstName}! Time to grow your portfolio.`
      ],
      builder: [
        `Welcome back, ${firstName}! Your projects are progressing well.`,
        `Great to see you, ${firstName}! Ready to build something amazing?`,
        `Hello ${firstName}! Time to check on your developments.`
      ],
      owner: [
        `Welcome back, ${firstName}! Your properties are performing well.`,
        `Great to see you, ${firstName}! Ready to manage your listings?`,
        `Hello ${firstName}! Time to connect with potential tenants.`
      ],
      buyer: [
        `Welcome back, ${firstName}! Ready to find your dream home?`,
        `Great to see you, ${firstName}! New properties await your discovery.`,
        `Hello ${firstName}! Your perfect property might be just a click away.`
      ]
    };
    
    const roleMessages = messages[role as keyof typeof messages] || messages.buyer;
    return roleMessages[Math.floor(Math.random() * roleMessages.length)];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatLastActivity = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const roleConfig = getRoleConfig(user.role);

  return (
    <Card className={cn(
      "relative overflow-hidden border-0 shadow-sm bg-gradient-to-br",
      roleConfig.gradient,
      "backdrop-blur-sm",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/40 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
      
      <CardContent className="relative p-6 lg:p-8">
        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-background shadow-md">
              <AvatarImage src={user.profile_image} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-foreground truncate">
                  {getGreeting()}, {user.first_name}!
                </h1>
                <Badge variant="secondary" className={cn("shrink-0", roleConfig.color)}>
                  <Icon icon={roleConfig.icon} className="size-3 mr-1" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {roleSpecificMessage || getPersonalizedMessage(user.role, user.first_name)}
              </p>
            </div>
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {stats.slice(0, 2).map((stat, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {stat.icon && <Icon icon={stat.icon} className="size-4 text-primary" />}
                    <div className="text-lg font-bold text-foreground">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickActions.slice(0, 2).map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={action.onClick}
                  className="flex-1 min-w-0"
                >
                  <Icon icon={action.icon} className="size-4 mr-2 shrink-0" />
                  <span className="truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between">
            {/* Left Section - User Info */}
            <div className="flex items-center gap-6">
              <Avatar className="size-20 ring-2 ring-background shadow-lg">
                <AvatarImage src={user.profile_image} alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    {getGreeting()}, {user.first_name} {user.last_name}!
                  </h1>
                  <Badge variant="secondary" className={cn("px-3 py-1", roleConfig.color)}>
                    <Icon icon={roleConfig.icon} className="size-4 mr-2" />
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  {roleSpecificMessage || getPersonalizedMessage(user.role, user.first_name)}
                </p>
                {lastActivity && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Icon icon="solar:clock-circle-bold" className="size-4" />
                    Last activity: {lastActivity.action} • {formatLastActivity(lastActivity.timestamp)}
                  </p>
                )}
              </div>
            </div>

            {/* Right Section - Stats and Actions */}
            <div className="flex items-center gap-6">
              {/* Stats */}
              {stats.length > 0 && (
                <div className="flex gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm min-w-[100px]">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {stat.icon && <Icon icon={stat.icon} className="size-5 text-primary" />}
                        <div className="text-2xl font-bold text-foreground">
                          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div className="flex gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || (index === 0 ? 'default' : 'outline')}
                      onClick={action.onClick}
                      className="shadow-sm"
                    >
                      <Icon icon={action.icon} className="size-4 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}