import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@iconify/react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    totalProperties: number;
    activeClients: number;
    propertiesSold: number;
    pendingDocuments: number;
}

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: string;
    iconColor: string;
    action: () => void;
}

export function AgentDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalProperties: 324,
        activeClients: 4,
        propertiesSold: 5,
        pendingDocuments: 6
    });
    const [loading, setLoading] = useState(false);

    const quickActions: QuickAction[] = [
        {
            id: 'add-client-property',
            title: 'Add Client Property',
            description: 'List property for a client',
            icon: 'solar:home-add-bold',
            iconColor: 'text-gray-600',
            action: () => navigate('/properties/add')
        },
        {
            id: 'bulk-upload',
            title: 'Bulk Upload Properties',
            description: 'Upload multiple properties via CSV',
            icon: 'solar:upload-bold',
            iconColor: 'text-purple-600',
            action: () => navigate('/agent/bulk-upload')
        },
        {
            id: 'client-portfolio',
            title: 'Client Portfolio',
            description: 'Manage all client properties',
            icon: 'solar:folder-bold',
            iconColor: 'text-gray-600',
            action: () => navigate('/dashboard/properties')
        },
        {
            id: 'lead-management',
            title: 'Lead Management',
            description: 'Track and convert leads',
            icon: 'solar:users-group-rounded-bold',
            iconColor: 'text-orange-600',
            action: () => navigate('/agent/leads')
        },
        {
            id: 'client-communication',
            title: 'Client Communication',
            description: 'Messages and client interactions',
            icon: 'solar:chat-round-dots-bold',
            iconColor: 'text-blue-600',
            action: () => navigate('/dashboard/messages')
        }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API calls
            // const response = await api.getAgentDashboardStats();
            // setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Prop Puzzel | Agent Dashboard
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Welcome back, Agent Name. Here is your performance summary and key activity overview.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline">
                                    Export
                                </Button>
                                <Button className="bg-red-600 hover:bg-red-700">
                                    Add New Property
                                </Button>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <Tabs defaultValue="dashboard" className="mt-6">
                            <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
                                <TabsTrigger
                                    value="dashboard"
                                    className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                                >
                                    Dashboard
                                </TabsTrigger>
                                <TabsTrigger
                                    value="property-listings"
                                    className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                                >
                                    Property Listings
                                </TabsTrigger>
                                <TabsTrigger
                                    value="clients"
                                    className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                                >
                                    Clients
                                </TabsTrigger>
                                <TabsTrigger
                                    value="documents"
                                    className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                                >
                                    Documents
                                </TabsTrigger>
                                <TabsTrigger
                                    value="messages"
                                    className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                                >
                                    Messages
                                </TabsTrigger>
                                <TabsTrigger
                                    value="settings"
                                    className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                                >
                                    Settings
                                </TabsTrigger>
                                <TabsTrigger
                                    value="support"
                                    className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                                >
                                    Support
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="dashboard" className="mt-8">
                                <div className="container mx-auto px-4">
                                    {/* Quick Actions */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {quickActions.map((action) => (
                                                <Card
                                                    key={action.id}
                                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={action.action}
                                                >
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-lg ${action.iconColor === 'text-purple-600' ? 'bg-purple-100' :
                                                                action.iconColor === 'text-orange-600' ? 'bg-orange-100' :
                                                                    action.iconColor === 'text-blue-600' ? 'bg-blue-100' :
                                                                        'bg-gray-100'
                                                                }`}>
                                                                <Icon
                                                                    icon={action.icon}
                                                                    className={`size-6 ${action.iconColor}`}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                                    {action.title}
                                                                </h3>
                                                                <p className="text-sm text-gray-600">
                                                                    {action.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="text-sm text-gray-600 mb-1">Total Properties Listed</div>
                                                <div className="text-3xl font-bold text-gray-900">{stats.totalProperties}</div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="text-sm text-gray-600 mb-1">Active Clients</div>
                                                <div className="text-3xl font-bold text-gray-900">{stats.activeClients}</div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="text-sm text-gray-600 mb-1">Properties Sold or Rented</div>
                                                <div className="text-3xl font-bold text-gray-900">{stats.propertiesSold}</div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="text-sm text-gray-600 mb-1">Pending Documents</div>
                                                <div className="text-3xl font-bold text-gray-900">{stats.pendingDocuments}</div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Performance Analytics */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Analytics</h2>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                            {/* Closing Over Time Chart */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-semibold">Closing Over Time</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                                        <div className="text-center">
                                                            <Icon icon="solar:chart-2-bold" className="size-12 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-gray-500">Chart visualization will be implemented</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Lead Conversion Rate Chart */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-semibold">Lead Conversion Rate</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                                        <div className="text-center">
                                                            <Icon icon="solar:chart-2-bold" className="size-12 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-gray-500">Chart visualization will be implemented</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Monthly Revenue Growth Chart */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg font-semibold">Monthly Revenue Growth</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                                                    <div className="text-center">
                                                        <Icon icon="solar:chart-2-bold" className="size-16 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-gray-500">Revenue chart visualization will be implemented</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Other tab contents */}
                            <TabsContent value="property-listings" className="mt-8">
                                <div className="container mx-auto px-4">
                                    <div className="text-center py-12">
                                        <Icon icon="solar:home-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Listings</h3>
                                        <p className="text-gray-600">Property listings management will be implemented here</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="clients" className="mt-8">
                                <div className="container mx-auto px-4">
                                    <div className="text-center py-12">
                                        <Icon icon="solar:users-group-rounded-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Clients</h3>
                                        <p className="text-gray-600">Client management will be implemented here</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="documents" className="mt-8">
                                <div className="container mx-auto px-4">
                                    <div className="text-center py-12">
                                        <Icon icon="solar:document-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Documents</h3>
                                        <p className="text-gray-600">Document management will be implemented here</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="messages" className="mt-8">
                                <div className="container mx-auto px-4">
                                    <div className="text-center py-12">
                                        <Icon icon="solar:chat-round-dots-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Messages</h3>
                                        <p className="text-gray-600">Message center will be implemented here</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="settings" className="mt-8">
                                <div className="container mx-auto px-4">
                                    <div className="text-center py-12">
                                        <Icon icon="solar:settings-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings</h3>
                                        <p className="text-gray-600">Account settings will be implemented here</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="support" className="mt-8">
                                <div className="container mx-auto px-4">
                                    <div className="text-center py-12">
                                        <Icon icon="solar:help-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Support</h3>
                                        <p className="text-gray-600">Support center will be implemented here</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default AgentDashboard;