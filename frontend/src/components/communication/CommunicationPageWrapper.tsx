import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CommunicationPage } from './CommunicationPage';

export const CommunicationPageWrapper: React.FC = () => {
  const { state } = useAuth();

  // If user is not authenticated, this should be handled by ProtectedRoute
  // but we'll add a fallback just in case
  if (!state.user) {
    return <div>Please log in to access communication features.</div>;
  }

  // Transform the auth user to match CommunicationPage props
  const currentUser = {
    id: state.user.id,
    role: state.user.role as 'buyer' | 'owner' | 'agent' | 'builder' | 'admin',
    name: `${state.user.firstName} ${state.user.lastName}`,
    email: state.user.email,
  };

  return <CommunicationPage currentUser={currentUser} />;
};