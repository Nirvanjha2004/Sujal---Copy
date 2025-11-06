import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useAuth } from '@/shared/contexts/AuthContext';
import { useFavorites } from '@/features/buyer/hooks/useFavorites';
import { api, SavedSearch } from '@/shared/lib/api';
import { Property } from '@/features/property/types';
import { useNavigate } from 'react-router-dom';
import { PropertyCard } from '@/features/property/components/common/PropertyCard';

interface ActivityItem {
  id: number;
  type: 'property_view' | 'search' | 'favorite_add' | 'favorite_remove' | 'inquiry_sent' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface SearchHistory {
  id: string;
  searchQuery: string;
  filters: any;
  timestamp: string;
  location: string;
  propertyType: string;
}

interface ContactedProperty {
  id: number;
  property: Property;
  contactedAt: string;
  inquiryId: number;
  status: 'pending' | 'responded' | 'closed';
}

export function PropertySearchDashboard() {
  const { state } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const navigate = useNavigate();
  
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
  const [viewedProperties, setViewedProperties] = useState<Property[]>([]);
  const [contactedProperties, setContactedProperties] = useState<ContactedProperty[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [state.isAuthenticated]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchRecentSearches(),
        fetchViewedProperties(),
        fetchContactedProperties(),
        fetchUserActivity()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentSearches = async () => {
    try {
      // Get saved searches as proxy for recent searches
      const response = await api.getSavedSearches();
      const searches: SearchHistory[] = response.data.savedSearches.map((search: SavedSearch) => ({
        id: search.id.toString(),
        searchQuery: search.name,
        filters: search.filters,
        timestamp: search.created_at,
        location: search.filters.location || 'All Locations',
        propertyType: search.filters.property_type || 'All Types'
      }));
      setRecentSearches(searches);
    } catch (err) {
      console.error('Failed to fetch recent searches:', err);
    }
  };

  const fetchViewedProperties = async () => {
    try {
      // This would ideally come from a dedicated endpoint for viewed properties
      // For now, we'll use recent properties or implement based on user activity
      const response = await api.getProperties({}, 1, 8);
      setViewedProperties(response.data);
    } catch (err) {
      console.error('Failed to fetch viewed properties:', err);
    }
  };

  const fetchContactedProperties = async () => {
    try {
      // This would come from inquiries API
      const response = await api.communication?.getInquiries?.() || { data: { inquiries: [] } };
      const contacted: ContactedProperty[] = response.data.inquiries.map((inquiry: any) => ({
        id: inquiry.id,
        property: inquiry.property,
        contactedAt: inquiry.created_at,
        inquiryId: inquiry.id,
        status: inquiry.status
      }));
      setContactedProperties(contacted);
    } catch (err) {
      console.error('Failed to fetch contacted properties:', err);
    }
  };

  const fetchUserActivity = async () => {
    try {
      // Mock activity data - replace with actual API call when available
      const mockActivities: ActivityItem[] = [
        {
          id: 1,
          type: 'search',
          title: 'Property Search',
          description: 'Buy in Bangalore East, Residential Land',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'search',
          title: 'Property Search',
          description: 'Buy in Whitefield, Bangalore East',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: 'search',
          title: 'Property Search',
          description: 'Buy in Kolkata Central, Residential Apartment',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        }
      ];
      setActivities(mockActivities);
    } catch (err) {
      console.error('Failed to fetch user activity:', err);
    }
  };

  const handleSearchClick = (search: SearchHistory) => {
    const params = new URLSearchParams();
    Object.entries(search.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    navigate(`/search?${params.toString()}`);
  };

  const handlePropertyClick = (property: Property) => {
    navigate(`/property/${property.id}`);
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const formatTimeAgo = (timestamp: string) => {
    const time = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return time.toLocaleDateString();
  };

  const getTabCounts = () => {
    return {
      searches: state.isAuthenticated ? recentSearches.length : 28,
      viewed: state.isAuthenticated ? viewedProperties.length : 27,
      shortlisted: state.isAuthenticated ? favorites.length : 0,
      contacted: state.isAuthenticated ? contactedProperties.length : 0
    };
  };

  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar from RealEstateLandingPage2.tsx */}
      <nav className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-lg cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="flex flex-col items-center text-white">
                <Icon icon="solar:home-2-bold" className="size-6" />
                <span className="text-[10px] font-bold leading-none">PROP</span>
                <span className="text-[8px] font-semibold leading-none">PUZZLES</span>
              </div>
            </div>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              className="text-foreground hover:text-primary transition-colors"
              onClick={() => navigate('/properties')}
            >
              Buy
            </button>
            <button className="text-foreground hover:text-primary transition-colors">
              Rent
            </button>
            <button className="text-foreground hover:text-primary transition-colors">
              Sell
            </button>
            <button className="text-foreground hover:text-primary transition-colors">
              Services
            </button>
            <button 
              className="text-foreground hover:text-primary transition-colors"
              onClick={() => navigate('/calculators')}
            >
              Calculators
            </button>
            <button className="text-foreground hover:text-primary transition-colors">
              More
            </button>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            {state.isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => navigate('/add-property')}
                >
                  <Icon icon="solar:home-add-bold" className="size-4 mr-2" />
                  Post Property
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/favorites')}
                >
                  <Icon icon="solar:heart-bold" className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                >
                  <Icon icon="solar:user-bold" className="size-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Icon icon="solar:home-add-bold" className="size-4 mr-2" />
                  Post Property
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Icon icon="solar:hamburger-menu-bold" className="size-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="searches" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-6">
            <TabsTrigger
              value="searches"
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3"
            >
              <span className="font-semibold">{tabCounts.searches}</span> Recent Searches
            </TabsTrigger>
            <TabsTrigger
              value="viewed"
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3"
            >
              <span className="font-semibold">{tabCounts.viewed}</span> Viewed
            </TabsTrigger>
            <TabsTrigger
              value="shortlisted"
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3"
            >
              <span className="font-semibold">{tabCounts.shortlisted}</span> Shortlisted
            </TabsTrigger>
            <TabsTrigger
              value="contacted"
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 pb-3"
            >
              <span className="font-semibold">{tabCounts.contacted}</span> Contacted
            </TabsTrigger>
          </TabsList>

          {/* Recent Searches Tab */}
          <TabsContent value="searches" className="mt-8">
            {!state.isAuthenticated ? (
              <div className="text-center py-16 space-y-6">
                <Card className="bg-orange-50 border-orange-200 p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🔍📱</div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Login to view your searches
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Access your search history across devices
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleLoginRedirect}
                    >
                      →
                    </Button>
                  </div>
                </Card>
              </div>
            ) : recentSearches.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold">No recent searches</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start searching for properties to see your search history here
                </p>
                <Button onClick={() => navigate('/search')}>
                  Start Searching
                </Button>
              </div>
            ) : (
              <div className="max-w-2xl">
                <h2 className="text-lg font-semibold mb-6">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <div className="space-y-3">
                  {recentSearches.map((search) => (
                    <Card 
                      key={search.id}
                      className="bg-card hover:bg-card/80 transition-colors cursor-pointer border-border"
                      onClick={() => handleSearchClick(search)}
                    >
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                          <Icon icon="solar:home-smile-bold" className="size-5 text-muted-foreground" />
                          <div>
                            <span className="text-sm font-medium">{search.searchQuery}</span>
                            <p className="text-xs text-muted-foreground">{search.location} • {search.propertyType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(search.timestamp)}</span>
                          <Icon
                            icon="solar:alt-arrow-right-linear"
                            className="size-5 text-muted-foreground"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Viewed Properties Tab */}
          <TabsContent value="viewed" className="mt-8">
            {!state.isAuthenticated ? (
              <div className="text-center py-16 space-y-6">
                <Card className="bg-orange-50 border-orange-200 p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🏠👁️</div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Login to view your activity
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Track properties you've viewed
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleLoginRedirect}
                    >
                      →
                    </Button>
                  </div>
                </Card>
              </div>
            ) : viewedProperties.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl mb-4">👁️</div>
                <h2 className="text-2xl font-bold">No viewed properties yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Browse properties to see your viewing history here
                </p>
                <Button onClick={() => navigate('/properties')}>
                  Browse Properties
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Viewed Properties</h2>
                  <p className="text-sm text-muted-foreground mb-6">Contact now to close the deal</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {viewedProperties.map((property) => (
                      <Card 
                        key={property.id} 
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handlePropertyClick(property)}
                      >
                        <div className="relative">
                          <img
                            src={property.images?.[0]?.image_url || "/api/placeholder/400/300"}
                            alt={property.title}
                            className="w-full h-40 object-cover"
                          />
                          <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
                            {property.is_featured ? 'Featured' : 'New'}
                          </Badge>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
                            ₹{(property.price / 100000).toFixed(2)} L
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm mb-1">{property.bedrooms} BHK, {property.bathrooms} Bathrooms</h3>
                          <p className="text-xs text-muted-foreground">
                            {property.title} • {property.city}, {property.state}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Shortlisted Tab */}
          <TabsContent value="shortlisted" className="mt-8">
            {!state.isAuthenticated ? (
              <div className="text-center py-16 space-y-6">
                <Card className="bg-orange-50 border-orange-200 p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🏠📱⭐</div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Login to view shortlisted properties
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Access your favorites across devices
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleLoginRedirect}
                    >
                      →
                    </Button>
                  </div>
                </Card>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl mb-4">⭐</div>
                <h2 className="text-2xl font-bold">You haven't shortlisted anything yet!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Save properties to your favorites to see them here
                </p>
                <Button onClick={() => navigate('/properties')}>
                  Browse Properties
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Shortlisted Properties</h2>
                  <p className="text-sm text-muted-foreground mb-6">Your favorite properties</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {favorites.map((favorite) => (
                      <Card 
                        key={favorite.property.id} 
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handlePropertyClick(favorite.property)}
                      >
                        <div className="relative">
                          <img
                            src={favorite.property.images?.[0]?.image_url || "/api/placeholder/400/300"}
                            alt={favorite.property.title}
                            className="w-full h-40 object-cover"
                          />
                          <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
                            ❤️ Favorite
                          </Badge>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
                            ₹{(favorite.property.price / 100000).toFixed(2)} L
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm mb-1">{favorite.property.bedrooms} BHK, {favorite.property.bathrooms} Bathrooms</h3>
                          <p className="text-xs text-muted-foreground">
                            {favorite.property.title} • {favorite.property.city}, {favorite.property.state}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Contacted Tab */}
          <TabsContent value="contacted" className="mt-8">
            {!state.isAuthenticated ? (
              <div className="text-center py-16 space-y-6">
                <Card className="bg-orange-50 border-orange-200 p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🏠📱📞</div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Login to view contacted properties
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Track your inquiries and communications
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleLoginRedirect}
                    >
                      →
                    </Button>
                  </div>
                </Card>
              </div>
            ) : contactedProperties.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl mb-4">📞</div>
                <h2 className="text-2xl font-bold">You haven't contacted anyone yet!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start inquiring about properties to see your communications here
                </p>
                <Button onClick={() => navigate('/properties')}>
                  Browse Properties
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Contacted Properties</h2>
                  <p className="text-sm text-muted-foreground mb-6">Properties you've inquired about</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contactedProperties.map((contacted) => (
                      <Card 
                        key={contacted.id} 
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handlePropertyClick(contacted.property)}
                      >
                        <div className="relative">
                          <img
                            src={contacted.property.images?.[0]?.image_url || "/api/placeholder/400/300"}
                            alt={contacted.property.title}
                            className="w-full h-40 object-cover"
                          />
                          <Badge className={`absolute top-2 left-2 text-white text-xs ${
                            contacted.status === 'pending' ? 'bg-yellow-600' :
                            contacted.status === 'responded' ? 'bg-blue-600' : 'bg-green-600'
                          }`}>
                            {contacted.status === 'pending' ? '⏳ Pending' :
                             contacted.status === 'responded' ? '💬 Responded' : '✅ Closed'}
                          </Badge>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
                            ₹{(contacted.property.price / 100000).toFixed(2)} L
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm mb-1">{contacted.property.bedrooms} BHK, {contacted.property.bathrooms} Bathrooms</h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {contacted.property.title} • {contacted.property.city}, {contacted.property.state}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Contacted {formatTimeAgo(contacted.contactedAt)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}