import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProperty } from '../hooks/useProperty';
import { PropertyCard } from '../components/common/PropertyCard';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Layout } from '@/shared/components/layout/Layout';
import { PropertyGridSkeleton } from '@/shared/components/ui/loading';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Icon } from '@iconify/react';
import type { Property } from '../types/property';

export function PropertyComparisonPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get property IDs from URL params
    const propertyIds = searchParams.get('ids')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) || [];

    useEffect(() => {
        if (propertyIds.length === 0) {
            setError('No properties selected for comparison');
            setLoading(false);
            return;
        }

        if (propertyIds.length > 4) {
            setError('Maximum 4 properties can be compared at once');
            setLoading(false);
            return;
        }

        loadProperties();
    }, [propertyIds]);

    const loadProperties = async () => {
        try {
            setLoading(true);
            const propertyPromises = propertyIds.map(async (id) => {
                // This would use the useProperty hook or direct API call
                // For now, we'll simulate the API call
                const response = await fetch(`/api/properties/${id}`);
                if (!response.ok) throw new Error(`Failed to load property ${id}`);
                return response.json();
            });

            const loadedProperties = await Promise.all(propertyPromises);
            setProperties(loadedProperties.filter(p => p !== null));
        } catch (err) {
            console.error('Failed to load properties for comparison:', err);
            setError('Failed to load properties for comparison');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹ ${(price / 10000000).toFixed(2)} Cr`;
        } else if (price >= 100000) {
            return `₹ ${(price / 100000).toFixed(2)} Lakh`;
        } else {
            return `₹ ${price.toLocaleString()}`;
        }
    };

    const removeProperty = (propertyId: number) => {
        const newIds = propertyIds.filter(id => id !== propertyId);
        if (newIds.length === 0) {
            navigate('/properties');
            return;
        }
        navigate(`/property-comparison?ids=${newIds.join(',')}`);
    };

    const getComparisonData = () => {
        if (properties.length === 0) return [];

        return [
            {
                label: 'Price',
                values: properties.map(p => formatPrice(p.price))
            },
            {
                label: 'Property Type',
                values: properties.map(p => p.property_type?.charAt(0).toUpperCase() + p.property_type?.slice(1) || 'N/A')
            },
            {
                label: 'Listing Type',
                values: properties.map(p => `For ${p.listing_type?.charAt(0).toUpperCase() + p.listing_type?.slice(1)}` || 'N/A')
            },
            {
                label: 'Bedrooms',
                values: properties.map(p => p.bedrooms?.toString() || 'N/A')
            },
            {
                label: 'Bathrooms',
                values: properties.map(p => p.bathrooms?.toString() || 'N/A')
            },
            {
                label: 'Area (sq ft)',
                values: properties.map(p => p.area_sqft?.toLocaleString() || 'N/A')
            },
            {
                label: 'Price per sq ft',
                values: properties.map(p => 
                    p.area_sqft && p.price 
                        ? `₹${Math.round(p.price / p.area_sqft).toLocaleString()}`
                        : 'N/A'
                )
            },
            {
                label: 'Status',
                values: properties.map(p => p.status?.charAt(0).toUpperCase() + p.status?.slice(1) || 'N/A')
            },
            {
                label: 'City',
                values: properties.map(p => p.city || 'N/A')
            },
            {
                label: 'State',
                values: properties.map(p => p.state || 'N/A')
            },
            {
                label: 'Listed On',
                values: properties.map(p => 
                    p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'
                )
            }
        ];
    };

    if (loading) {
        return (
            <Layout>
                <PropertyGridSkeleton />
            </Layout>
        );
    }

    if (error || properties.length === 0) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-6">
                    <Alert className="max-w-md mx-auto">
                        <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
                        <AlertDescription>
                            {error || 'No properties found for comparison'}
                        </AlertDescription>
                        <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => navigate('/properties')}
                        >
                            Back to Properties
                        </Button>
                    </Alert>
                </div>
            </Layout>
        );
    }

    const comparisonData = getComparisonData();

    return (
        <Layout>
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Property Comparison</h1>
                        <p className="text-muted-foreground">
                            Compare {properties.length} properties side by side
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/properties')}
                    >
                        <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
                        Back to Properties
                    </Button>
                </div>

                {/* Property Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {properties.map((property) => (
                        <div key={property.id} className="relative">
                            <PropertyCard 
                                property={property}
                                onClick={() => navigate(`/property/${property.id}`)}
                            />
                            <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={() => removeProperty(property.id)}
                            >
                                <Icon icon="solar:close-bold" className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Comparison Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">Feature</th>
                                        {properties.map((property) => (
                                            <th key={property.id} className="text-left py-3 px-4 font-medium min-w-[200px]">
                                                <div className="truncate">{property.title}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonData.map((row, index) => (
                                        <tr key={index} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-4 font-medium text-muted-foreground">
                                                {row.label}
                                            </td>
                                            {row.values.map((value, valueIndex) => (
                                                <td key={valueIndex} className="py-3 px-4">
                                                    {row.label === 'Price' ? (
                                                        <span className="font-semibold text-primary">{value}</span>
                                                    ) : row.label === 'Status' ? (
                                                        <Badge variant="outline" className="capitalize">
                                                            {value}
                                                        </Badge>
                                                    ) : (
                                                        <span>{value}</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-8">
                    <Button onClick={() => navigate('/properties')}>
                        <Icon icon="solar:home-bold" className="size-4 mr-2" />
                        Browse More Properties
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Icon icon="solar:printer-bold" className="size-4 mr-2" />
                        Print Comparison
                    </Button>
                </div>
            </div>
        </Layout>
    );
}