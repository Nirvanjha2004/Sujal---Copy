import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { DashboardLayout } from '../components/common/DashboardLayout';
import { ActivityType } from '../types/activity';

/**
 * User Activity Page - migrated to dashboard feature
 * Uses new dashboard hooks and components while maintaining existing functionality
 */
export function UserActivityPage() {
  const { activities, isLoading, error, refreshFeed } = useActivityFeed();
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.PROPERTY_VIEW:
        return 'solar:eye-bold';
      case ActivityType.SEARCH:
        return 'solar:magnifer-bold';
      case ActivityType.FAVORITE_ADD:
        return 'solar:heart-bold';
      case ActivityType.FAVORITE_REMOVE:
        return 'solar:heart-broken-bold';
      case ActivityType.INQUIRY_SENT:
        return 'solar:chat-round-bold';
      case ActivityType.PROFILE_UPDATE:
        return 'solar:user-bold';
      default:
        return 'solar:document-bold';
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case ActivityType.PROPERTY_VIEW:
        return 'text-blue-600 bg-blue-50';
      case ActivityType.SEARCH:
        return 'text-green-600 bg-green-50';
      case ActivityType.FAVORITE_ADD:
        return 'text-red-600 bg-red-50';
      case ActivityType.FAVORITE_REMOVE:
        return 'text-gray-600 bg-gray-50';
      case ActivityType.INQUIRY_SENT:
        return 'text-purple-600 bg-purple-50';
      case ActivityType.PROFILE_UPDATE:
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return time.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const activityTypes = [
    { value: 'all', label: 'All Activity' },
    { value: ActivityType.PROPERTY_VIEW, label: 'Property Views' },
    { value: ActivityType.SEARCH, label: 'Searches' },
    { value: ActivityType.FAVORITE_ADD, label: 'Favorites' },
    { value: ActivityType.INQUIRY_SENT, label: 'Inquiries' },
    { value: ActivityType.PROFILE_UPDATE, label: 'Profile Updates' }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <DashboardLayout>
            <div className="flex items-center justify-center min-h-[400px]">
              <Icon icon="solar:loading-bold" className="size-8 animate-spin text-muted-foreground" />
            </div>
          </DashboardLayout>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <DashboardLayout>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
                Activity History
              </h1>
              <p className="text-muted-foreground">
                Track your property search and interaction history
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <Icon icon="solar:home-bold" className="size-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <Icon icon="solar:danger-bold" className="size-4" />
              <AlertDescription>
                {typeof error === 'string' ? error : 'Failed to load activity data'}
                <button 
                  onClick={refreshFeed}
                  className="ml-2 underline hover:no-underline"
                >
                  Try again
                </button>
              </AlertDescription>
            </Alert>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {activityTypes.map((type) => (
              <Button
                key={type.value}
                size="sm"
                variant={filter === type.value ? 'default' : 'outline'}
                onClick={() => setFilter(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Icon icon="solar:history-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Activity Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {filter === 'all' 
                      ? "Start exploring properties to see your activity here"
                      : `No ${activityTypes.find(t => t.value === filter)?.label.toLowerCase()} found`
                    }
                  </p>
                  <Button onClick={() => navigate('/properties')}>
                    <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
                    Browse Properties
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Activity Icon */}
                      <div className={`p-3 rounded-full ${getActivityColor(activity.type)}`}>
                        <Icon icon={getActivityIcon(activity.type)} className="size-5" />
                      </div>

                      {/* Activity Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{activity.title}</h4>
                            <p className="text-muted-foreground">{activity.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {activity.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {activity.metadata?.propertyId && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/property/${activity.metadata?.propertyId}`)}
                            >
                              <Icon icon="solar:eye-bold" className="size-4 mr-1" />
                              View Property
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Activity Stats */}
          {activities.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="solar:chart-bold" className="size-5" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Icon icon="solar:eye-bold" className="size-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {activities.filter(a => a.type === ActivityType.PROPERTY_VIEW).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Properties Viewed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Icon icon="solar:magnifer-bold" className="size-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {activities.filter(a => a.type === ActivityType.SEARCH).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Searches Made</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Icon icon="solar:heart-bold" className="size-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {activities.filter(a => a.type === ActivityType.FAVORITE_ADD).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Favorites Added</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Icon icon="solar:chat-round-bold" className="size-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {activities.filter(a => a.type === ActivityType.INQUIRY_SENT).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Inquiries Sent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DashboardLayout>
      </div>
    </Layout>
  );
}