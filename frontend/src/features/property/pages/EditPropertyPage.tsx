import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useProperty } from '../hooks/useProperty';
import { usePropertyForm } from '../hooks/usePropertyForm';
import { EditPropertyForm } from '../components/forms/EditPropertyForm';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { PropertyGridSkeleton } from '@/shared/components/ui/loading';
import { Icon } from '@iconify/react';

export function EditPropertyPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state } = useAuth();
    const propertyId = id ? parseInt(id) : 0;

    const { property, loading, error: propertyError } = useProperty(propertyId);
    const { updateProperty, isSubmitting, error } = usePropertyForm();

    // Check if user has permission to edit properties
    const allowedRoles = ['owner', 'agent', 'builder'];
    const canEditProperty = state.user && allowedRoles.includes(state.user.role);

    // Check if user owns this property or has permission to edit it
    const canEditThisProperty = canEditProperty && property && (
        property.owner_id === state.user?.id || 
        state.user?.role === 'admin'
    );

    const handleSubmit = async (propertyData: any) => {
        if (!property) return;
        
        try {
            await updateProperty(property.id, propertyData);
            // Navigate back to property details or my properties
            navigate(`/property/${property.id}`);
        } catch (error) {
            console.error('Error updating property:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <header className="bg-primary text-primary-foreground py-4 px-4">
                    <div className="max-w-4xl mx-auto flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/my-properties')}
                            className="text-primary-foreground hover:bg-primary-foreground/10"
                        >
                            <Icon icon="solar:arrow-left-bold" className="size-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">Edit Property</h1>
                    </div>
                </header>
                <div className="max-w-4xl mx-auto p-6">
                    <PropertyGridSkeleton />
                </div>
            </div>
        );
    }

    if (propertyError || !property) {
        return (
            <div className="min-h-screen bg-background">
                <header className="bg-primary text-primary-foreground py-4 px-4">
                    <div className="max-w-4xl mx-auto flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/my-properties')}
                            className="text-primary-foreground hover:bg-primary-foreground/10"
                        >
                            <Icon icon="solar:arrow-left-bold" className="size-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">Edit Property</h1>
                    </div>
                </header>
                <div className="max-w-4xl mx-auto p-6">
                    <Alert className="border-red-200 bg-red-50">
                        <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
                        <AlertDescription className="text-red-700">
                            Property not found or failed to load.
                        </AlertDescription>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => navigate('/my-properties')}
                        >
                            Back to My Properties
                        </Button>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-primary text-primary-foreground py-4 px-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <Icon icon="solar:arrow-left-bold" className="size-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Property</h1>
                        <p className="text-primary-foreground/80 text-sm">{property.title}</p>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6">
                {!canEditProperty && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
                        <AlertDescription className="text-red-700">
                            You don't have permission to edit properties. 
                            Please contact support if you believe this is an error.
                        </AlertDescription>
                    </Alert>
                )}

                {!canEditThisProperty && canEditProperty && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
                        <AlertDescription className="text-red-700">
                            You don't have permission to edit this specific property. 
                            You can only edit properties that you own.
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
                        <AlertDescription className="text-red-700">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <EditPropertyForm
                    property={property}
                    onSubmit={canEditThisProperty ? handleSubmit : undefined}
                    isSubmitting={isSubmitting}
                    disabled={!canEditThisProperty}
                    onCancel={() => navigate(`/property/${property.id}`)}
                />
            </div>
        </div>
    );
}