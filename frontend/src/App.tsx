import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from '@/shared/components/layout/ErrorBoundary'
import { ProtectedRoute } from '@/features/auth/components/guards/ProtectedRoute'
import { Toaster } from 'sonner'
import { RealEstateLandingPage } from './components/landing/RealEstateLandingPage2'
import { PropertyDetailsPage } from '@/features/property/pages'
import { PropertyListingGrid } from '@/features/property/pages/PropertyListingGrid'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { OTPVerificationPage } from '@/features/auth/pages/OTPVerificationPage'
import { ProfilePage } from '@/features/auth/pages/ProfilePage'
import { DashboardPage, UserActivityPage, AccountSettingsPage, MessagesPage } from '@/features/dashboard/pages'
import { FavoritesPage } from '@/features/buyer/pages/FavoritesPage'
import { SavedSearchesPage } from '@/features/buyer/pages/SavedSearchesPage'
// import { CalculatorsPage } from '@/features/calculators'
import { AdminPanelPage } from '@/features/admin'
import { AddPropertyPage, MyPropertiesPage } from '@/features/property/pages'
import { AgentPropertyDashboard } from '@/features/agent/components'
import { PropertySearchPage } from '@/features/property/pages/PropertySearchPage'
import { ProjectDetailsPage as PublicProjectDetailsPage } from './pages/ProjectDetailsPage'

import { BulkUploadPage } from '@/pages/agent/BulkUploadPage'

// Builder Pages
import { ProjectsPage } from '@/features/builder/pages/ProjectsPage'
import { NewProjectPage } from '@/features/builder/pages/NewProjectPage'
import { EditProjectPage } from '@/features/builder/pages/EditProjectPage'
import { ProjectDetailsPage } from '@/features/builder/pages/ProjectDetailsPage'
import { ProjectUnitsPage } from '@/features/builder/pages/ProjectUnitsPage'
import { BulkUnitsPage } from '@/features/builder/pages/BulkUnitsPage'
import { LeadManagementPage } from '@/features/agent/pages/LeadManagementPage'
import { NewUnitPage } from '@/features/builder/pages/NewUnitPage'
// import { BulkListingPage } from './pages/builder/BulkListingPage'


function App() {
    return (
        <ErrorBoundary>
            <div className="App">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<RealEstateLandingPage />} />
                    <Route path="/properties" element={<PropertyListingGrid />} />
                    <Route path="/search" element={<PropertySearchPage />} />
                    <Route path="/property/:id" element={<PropertyDetailsPage />} />
                    <Route path="/project/:id" element={<PublicProjectDetailsPage />} />
                    {/* <Route path="/calculators" element={<CalculatorsPage />} /> */}
                    {/* Authentication routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<OTPVerificationPage />} />

                    {/* Protected routes */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/leads"
                        element={
                            <ProtectedRoute>
                                <LeadManagementPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <FavoritesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/saved-searches"
                        element={
                            <ProtectedRoute>
                                <SavedSearchesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/activity"
                        element={
                            <ProtectedRoute>
                                <UserActivityPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <AccountSettingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminPanelPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/add-property"
                        element={
                            <ProtectedRoute>
                                <AddPropertyPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-properties"
                        element={
                            <ProtectedRoute>
                                <MyPropertiesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agent-dashboard"
                        element={
                            <ProtectedRoute requiredRole="agent">
                                <AgentPropertyDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/messages/:conversationId?"
                        element={
                            <ProtectedRoute>
                                <MessagesPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Builder routes */}
                    <Route
                        path="/builder/projects"
                        element={
                            <ProtectedRoute requiredRole="builder">
                                <ProjectsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/builder/new-project"
                        element={
                            <ProtectedRoute requiredRole="builder">
                                <NewProjectPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/builder/projects/:id"
                        element={
                            <ProtectedRoute requiredRole="builder">
                                <ProjectDetailsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/builder/projects/:id/edit"
                        element={
                            <ProtectedRoute requiredRole="builder">
                                <EditProjectPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/builder/projects/:id/units"
                        element={
                            <ProtectedRoute requiredRole="builder">
                                <ProjectUnitsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/builder/projects/:id/units/new" element={<ProtectedRoute requiredRole="builder"><NewUnitPage /></ProtectedRoute>} />
                    <Route path="/builder/projects/:id/units/bulk" element={<ProtectedRoute requiredRole="builder"><BulkUnitsPage /></ProtectedRoute>} />
                    {/* <Route
                                path="/builder/bulk-listing"
                                element={
                                    <ProtectedRoute requiredRole="builder">
                                        <BulkListingPage />
                                    </ProtectedRoute>
                                }
                            /> */}
                    <Route
                        path="/agent/bulk-upload"
                        element={
                            <ProtectedRoute requiredRole="agent">
                                <BulkUploadPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
            <Toaster position="top-right" richColors />
        </ErrorBoundary>
    )
}

export default App