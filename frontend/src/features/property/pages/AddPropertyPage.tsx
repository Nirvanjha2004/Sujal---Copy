import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { usePropertyForm } from '../hooks/usePropertyForm';
import { AddPropertyForm } from '../components/forms/AddPropertyForm';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Icon } from '@iconify/react';

export function AddPropertyPage() {
    const navigate = useNavigate();
    const { state } = useAuth();
    const { submitProperty, isSubmitting, error } = usePropertyForm();

    // Check if user has permission to create properties
    const allowedRoles = ['owner', 'agent', 'builder'];
    const canCreateProperty = state.user && allowedRoles.includes(state.user.role);

    const handleSubmit = async (propertyData: any) => {
        try {
            await submitProperty(propertyData);
            // Navigate to my properties page to see the created property
            navigate('/my-properties');
        } catch (error) {
            console.error('Error creating property:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-primary text-primary-foreground py-4 px-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/dashboard')}
                        className="text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <Icon icon="solar:arrow-left-bold" className="size-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Add New Property</h1>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6">
                {!canCreateProperty && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
                        <AlertDescription className="text-red-700">
                            You need to be a Property Owner, Agent, or Builder to create property listings. 
                            Please contact support to update your account type.
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

                <AddPropertyForm
                    onSubmit={canCreateProperty ? handleSubmit : undefined}
                    isSubmitting={isSubmitting}
                    disabled={!canCreateProperty}
                    onCancel={() => navigate('/dashboard')}
                />
            </div>
        </div>
    );
}