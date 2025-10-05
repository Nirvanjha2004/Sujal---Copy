import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';

interface ActivityItem {
  id: number;
  type: 'property_view' | 'search' | 'favorite_add' | 'favorite_remove' | 'inquiry_sent' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export function UserActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserActivity();
  }, []);

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the backend endpoint might not exist yet
      // In a real implementation, this would call: await api.getUserActivity();
      
      // Mock data for demonstration
      const mockActivities: ActivityItem[] = [
        {
          id: 1,
          type: 'property_view',
          title: 'Viewed Property',
          description: '3 BHK Apartment in Koramangala',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          metadata: { propertyId: 123 }
        },
        {
          id: 2,
          type: 'favorite_add',
          title: 'Added to Favorites',
          description: '2 BHK Villa in Whitefield',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          metadata: { propertyId: 456 }
        },
        {
          id: 3,
          type: 'search',
          title: 'Property Search',
          description: 'Searched for apartments in Bangalore under ₹50L',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          metadata: { filters: { location: 'Bangalore', max_price: 5000000 } }
        },
        {
          id: 4,
          type: 'inquiry_sent',
          title: 'Inquiry Sent',
          description: 'Contacted owner for 4 BHK House in HSR Layout',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          metadata: { propertyId: 789 }
        },
        {
          id: 5,
          type: 'profile_update',
          title: 'Profile Updated',
          description: 'Updated contact information',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        }
      ];
      
      setActivities(mockActivities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user activity');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'property_view':
        return 'solar:eye-bold';
      case 'search':
        return 'solar:magnifer-bold';
      case 'favorite_add':
        return 'solar:heart-bold';
      case 'favorite_remove':
        return 'solar:heart-broken-bold';
      case 'inquiry_sent':
        return 'solar:chat-round-bold';
      case 'profile_update':
        return 'solar:user-bold';
      default:
        return 'solar:document-bold';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'property_view':
        return 'text-blue-600 bg-blue-50';
      case 'search':
        return 'text-green-600 bg-green-50';
      case 'favorite_add':
        return 'text-red-600 bg-red-50';
      case 'favorite_remove':
        return 'text-gray-600 bg-gray-50';
      case 'inquiry_sent':
        return 'text-purple-600 bg-purple-50';
      case 'profile_update':
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
    { value: 'property_view', label: 'Property Views' },
    { value: 'search', label: 'Searches' },
    { value: 'favorite_add', label: 'Favorites' },
    { value: 'inquiry_sent', label: 'Inquiries' },
    { value: 'profile_update', label: 'Profile Updates' }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
          <Alert className="mb-6">
            <Icon icon="solar:danger-bold" className="size-4" />
            <AlertDescription>{error}</AlertDescription>
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
                            onClick={() => navigate(`/property/${activity.metadata.propertyId}`)}
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
                    {activities.filter(a => a.type === 'property_view').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Properties Viewed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Icon icon="solar:magnifer-bold" className="size-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {activities.filter(a => a.type === 'search').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Searches Made</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Icon icon="solar:heart-bold" className="size-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {activities.filter(a => a.type === 'favorite_add').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Favorites Added</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Icon icon="solar:chat-round-bold" className="size-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {activities.filter(a => a.type === 'inquiry_sent').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Inquiries Sent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}