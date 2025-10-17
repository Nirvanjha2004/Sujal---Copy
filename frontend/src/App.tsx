import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { RealEstateLandingPage } from './components/landing/RealEstateLandingPage2'
import { PropertyListingPage } from './components/landing/PropertyListingPage'
import { PropertyListingGrid } from './components/landing/PropertyListingGrid2'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { OTPVerificationPage } from './components/auth/OTPVerificationPage'
import { ProfilePage } from './components/auth/ProfilePage'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { FavoritesPage } from './components/dashboard/FavoritesPage'
import { SavedSearchesPage } from './components/dashboard/SavedSearchesPage'
import { UserActivityPage } from './components/dashboard/UserActivityPage'
import { AccountSettingsPage } from './components/dashboard/AccountSettingsPage'
import { CalculatorsPage } from './components/calculators'
import { AdminPanel } from './components/admin'
import { AddPropertyPage } from './components/property/AddPropertyPage'
import { MyPropertiesPage } from './components/property/MyPropertiesPage'
import AgentDashboard from './components/properties/AgentPropertyDashboard'
import { PropertyListingSearchPage } from './components/landing/PropertyListingSearchPage'
import { PropertySearchDashboard } from './components/landing/SearchViewedDashboard'
import { Messages } from './components/dashboard/Messages'
import { BulkUploadPage } from '@/pages/agent/BulkUploadPage'

// Builder Pages
import { ProjectsPage } from './features/builder/pages/ProjectsPage'
import { NewProjectPage } from './features/builder/pages/NewProjectPage'
import { ProjectDetailsPage } from './features/builder/pages/ProjectDetailsPage'
import { ProjectUnitsPage } from './features/builder/pages/ProjectUnitsPage'
import { BulkUnitsPage } from './features/builder/pages/BulkUnitsPage'
import LeadManagementPage from './pages/agent/LeadManagementPage'
import { NewUnitPage } from './features/builder/pages/NewUnitPage'
// import { BulkListingPage } from './pages/builder/BulkListingPage'


function App() {
    return (
        <ErrorBoundary>
            <div className="App">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<RealEstateLandingPage />} />
                    <Route path="/properties" element={<PropertyListingGrid />} />
                    <Route path="/search" element={<PropertyListingSearchPage />} />
                    <Route path="/property/:id" element={<PropertyListingPage />} />
                    <Route path="/calculators" element={<CalculatorsPage />} />

                    {/* Search & Activity Dashboard - Can be accessed by both authenticated and unauthenticated users */}
                    <Route path="/search-dashboard" element={<PropertySearchDashboard />} />

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
                                <AdminPanel />
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
                                <AgentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/messages/:conversationId?"
                        element={
                            <ProtectedRoute>
                                <Messages />
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
                        path="/builder/projects/:id/units"
                        element={
                            <ProtectedRoute requiredRole="builder">
                                <ProjectUnitsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/builder/projects/:id/bulk-units"
                        element={
                            <ProtectedRoute requiredRole="builder">
                                <BulkUnitsPage />
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
        </ErrorBoundary>
    )
}

export default App