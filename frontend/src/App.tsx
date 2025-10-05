import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { RealEstateLandingPage } from './components/landing/RealEstateLandingPage2'
import { PropertyListingPage } from './components/landing/PropertyListingPage'
import { PropertyDetailsPageSimple } from './components/property/PropertyDetailsPageSimple'
import { PropertyListingGrid } from './components/landing/PropertyListingGrid2'
import { SearchPage } from './components/search/SearchPage'
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
import { InquiriesPage } from './components/communication/InquiriesPage'
import { CommunicationPageWrapper } from './components/communication/CommunicationPageWrapper'
import { CommunicationDemo } from './components/communication/CommunicationDemo'
import AgentDashboard from './components/properties/AgentDashboard'
import { PropertyListingSearchPage } from './components/landing/PropertyListingSearchPage'

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
                                path="/inquiries"
                                element={
                                    <ProtectedRoute>
                                        <InquiriesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/communication"
                                element={
                                    <ProtectedRoute>
                                        <CommunicationPageWrapper />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/communication-demo"
                                element={
                                    <CommunicationDemo />
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
                </Routes>
            </div>
        </ErrorBoundary>
    )
}

export default App