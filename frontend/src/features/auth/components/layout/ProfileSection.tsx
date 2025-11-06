import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface ProfileSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  icon?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'flat';
}

export function ProfileSection({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
  icon,
  actions,
  className,
  variant = 'default'
}: ProfileSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card 
      variant={variant}
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <CardHeader 
        className={cn(
          "pb-4",
          collapsible && "cursor-pointer hover:bg-muted/30 transition-colors duration-200 rounded-t-lg"
        )}
        onClick={collapsible ? toggleExpanded : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                <Icon icon={icon} className="size-5 text-primary" />
              </div>
            )}
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                {title}
                {collapsible && (
                  <Icon
                    icon={isExpanded ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"}
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200",
                      isExpanded && "rotate-0",
                      !isExpanded && "rotate-0"
                    )}
                  />
                )}
              </CardTitle>
              {description && (
                <CardDescription className="text-sm">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          
          {actions && !collapsible && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
          
          {collapsible && !actions && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded();
              }}
            >
              <Icon
                icon={isExpanded ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"}
                className="size-4 transition-transform duration-200"
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="pt-0">
          <div className="space-y-4">
            {children}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

ProfileSection.displayName = 'ProfileSection';