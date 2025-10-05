import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TrendingUp, TrendingDown, Eye, Heart, MessageSquare, Star } from 'lucide-react';

interface PropertyAnalytics {
  propertyId: number;
  title: string;
  views: number;
  inquiries: number;
  favorites: number;
  imagesCount: number;
  daysSinceListing: number;
  avgViewsPerDay: number;
  createdAt: string;
  lastUpdated: string;
  isActive: boolean;
  isFeatured: boolean;
  price: number;
  propertyType: string;
  listingType: string;
  city: string;
  state: string;
}

interface PerformanceMetrics {
  propertyId: number;
  views: number;
  daysSinceListing: number;
  avgViewsPerDay: number;
  performanceScore: number;
  comparisonData: {
    avgViewsOfSimilarProperties: number;
    totalSimilarProperties: number;
  };
  recommendations: string[];
}

interface UserAnalytics {
  summary: {
    totalProperties: number;
    activeProperties: number;
    featuredProperties: number;
    totalViews: number;
    avgViewsPerProperty: number;
  };
  topProperties: Array<{
    id: number;
    title: string;
    views: number;
    price: number;
    type: string;
    listingType: string;
    isActive: boolean;
    isFeatured: boolean;
  }>;
  recentProperties: Array<{
    id: number;
    title: string;
    views: number;
    createdAt: string;
    isActive: boolean;
    isFeatured: boolean;
  }>;
}

const PerformanceAnalytics = () => {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [propertyMetrics, setPropertyMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setUserAnalytics(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyMetrics = async (propertyId: number) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/performance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property metrics');
      }

      const result = await response.json();
      setPropertyMetrics(result.data);
      setSelectedProperty(propertyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property metrics');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!userAnalytics) {
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No analytics data available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <Button onClick={fetchUserAnalytics}>Refresh</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAnalytics.summary.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {userAnalytics.summary.activeProperties} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Listings</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAnalytics.summary.featuredProperties}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAnalytics.summary.totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Views/Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAnalytics.summary.avgViewsPerProperty}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Properties</CardTitle>
          <CardDescription>Your highest viewed listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userAnalytics.topProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => fetchPropertyMetrics(property.id)}
              >
                <div className="flex-1">
                  <h3 className="font-medium">{property.title}</h3>
                  <p className="text-sm text-gray-600">
                    ${property.price.toLocaleString()} • {property.type} • {property.listingType}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Eye className="h-4 w-4 mr-1" />
                      {property.views} views
                    </div>
                    {property.isFeatured && (
                      <div className="flex items-center text-sm text-yellow-600">
                        <Star className="h-4 w-4 mr-1" />
                        Featured
                      </div>
                    )}
                    {!property.isActive && (
                      <span className="text-sm text-red-600">Inactive</span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Performance Details */}
      {propertyMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Property Performance Details</CardTitle>
            <CardDescription>
              Detailed metrics for property #{propertyMetrics.propertyId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold flex items-center">
                    {propertyMetrics.performanceScore}%
                    {propertyMetrics.performanceScore >= 70 ? (
                      <TrendingUp className="h-5 w-5 text-green-500 ml-2" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500 ml-2" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Views/Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {propertyMetrics.avgViewsPerDay.toFixed(1)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Days Listed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{propertyMetrics.daysSinceListing}</div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison */}
            <div>
              <h4 className="font-medium mb-2">Market Comparison</h4>
              <p className="text-sm text-gray-600">
                Average views of similar properties: {propertyMetrics.comparisonData.avgViewsOfSimilarProperties}
                ({propertyMetrics.comparisonData.totalSimilarProperties} properties compared)
              </p>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {propertyMetrics.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceAnalytics;