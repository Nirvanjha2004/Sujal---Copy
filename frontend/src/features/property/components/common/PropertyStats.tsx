import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { PropertyStats as PropertyStatsType, Property } from "../../types";
// Utility functions are defined inline below

export interface PropertyStatsProps {
  property: Property;
  stats?: PropertyStatsType;
  variant?: 'compact' | 'detailed' | 'dashboard';
  showTrends?: boolean;
  className?: string;
}

interface StatItem {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
  trend?: number;
  format?: 'number' | 'duration' | 'percentage';
}

export function PropertyStats({ 
  property: _property, 
  stats, 
  variant = 'detailed',
  showTrends = false,
  className = ""
}: PropertyStatsProps) {
  const propertyStats = stats;

  if (!propertyStats) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Icon icon="solar:chart-bold" className="size-12 mx-auto mb-2" />
            <p>No statistics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatItems = (): StatItem[] => {
    const items: StatItem[] = [
      {
        label: 'Views',
        value: propertyStats.views || 0,
        icon: 'solar:eye-bold',
        color: 'text-blue-600',
        format: 'number'
      },
      {
        label: 'Favorites',
        value: propertyStats.favorites || 0,
        icon: 'solar:heart-bold',
        color: 'text-red-500',
        format: 'number'
      },
      {
        label: 'Inquiries',
        value: propertyStats.inquiries || 0,
        icon: 'solar:chat-round-dots-bold',
        color: 'text-green-600',
        format: 'number'
      },
      {
        label: 'Shares',
        value: propertyStats.shares || 0,
        icon: 'solar:share-bold',
        color: 'text-purple-600',
        format: 'number'
      }
    ];

    if (propertyStats.averageViewDuration) {
      items.push({
        label: 'Avg. View Time',
        value: propertyStats.averageViewDuration,
        icon: 'solar:clock-circle-bold',
        color: 'text-orange-600',
        format: 'duration'
      });
    }

    return items;
  };

  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'number':
        return value.toLocaleString();
      case 'duration':
        return formatDuration(value);
      case 'percentage':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ${Math.round(seconds % 60)}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null;
    if (trend > 0) return 'solar:arrow-up-bold';
    if (trend < 0) return 'solar:arrow-down-bold';
    return 'solar:minus-bold';
  };

  const getTrendColor = (trend?: number) => {
    if (!trend) return 'text-muted-foreground';
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const statItems = getStatItems();

  if (variant === 'compact') {
    return (
      <div className={`flex gap-4 ${className}`}>
        {statItems.slice(0, 4).map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <Icon icon={item.icon} className={`size-4 ${item.color}`} />
            <span className="font-medium">{formatValue(item.value, item.format)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {statItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{formatValue(item.value, item.format)}</p>
                  {showTrends && item.trend && (
                    <div className={`flex items-center gap-1 text-xs ${getTrendColor(item.trend)}`}>
                      <Icon icon={getTrendIcon(item.trend)!} className="size-3" />
                      <span>{Math.abs(item.trend)}%</span>
                    </div>
                  )}
                </div>
                <Icon icon={item.icon} className={`size-8 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Detailed variant (default)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="solar:chart-bold" className="size-5" />
          Property Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2`}>
                <Icon icon={item.icon} className={`size-6 ${item.color}`} />
              </div>
              <p className="text-2xl font-bold">{formatValue(item.value, item.format)}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Engagement Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Engagement Score</span>
            <Badge variant="outline">
              {Math.round(((propertyStats.views || 0) + (propertyStats.favorites || 0) * 2 + (propertyStats.inquiries || 0) * 3) / 10)}%
            </Badge>
          </div>
          <Progress 
            value={Math.round(((propertyStats.views || 0) + (propertyStats.favorites || 0) * 2 + (propertyStats.inquiries || 0) * 3) / 10)} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            Based on views, favorites, and inquiries
          </p>
        </div>

        {/* Last Activity */}
        {propertyStats.lastViewed && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon icon="solar:clock-circle-bold" className="size-4" />
            <span>Last viewed: {new Date(propertyStats.lastViewed).toLocaleDateString()}</span>
          </div>
        )}

        {/* Performance Indicators */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm">
              <Icon 
                icon={propertyStats.views > 100 ? "solar:fire-bold" : "solar:eye-bold"} 
                className={propertyStats.views > 100 ? "text-orange-500" : "text-muted-foreground"}
              />
              <span className={propertyStats.views > 100 ? "text-orange-500 font-medium" : "text-muted-foreground"}>
                {propertyStats.views > 100 ? "Hot" : "Normal"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Visibility</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm">
              <Icon 
                icon={propertyStats.favorites > 20 ? "solar:star-bold" : "solar:heart-bold"} 
                className={propertyStats.favorites > 20 ? "text-yellow-500" : "text-muted-foreground"}
              />
              <span className={propertyStats.favorites > 20 ? "text-yellow-500 font-medium" : "text-muted-foreground"}>
                {propertyStats.favorites > 20 ? "Popular" : "Average"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Interest</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm">
              <Icon 
                icon={propertyStats.inquiries > 5 ? "solar:medal-star-bold" : "solar:chat-round-dots-bold"} 
                className={propertyStats.inquiries > 5 ? "text-green-500" : "text-muted-foreground"}
              />
              <span className={propertyStats.inquiries > 5 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                {propertyStats.inquiries > 5 ? "Active" : "Quiet"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Engagement</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}