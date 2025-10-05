import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { InquiryHistoryPage } from './InquiryHistoryPage';
import { MessagingInterface } from './MessagingInterface';
import { api } from '../../lib/api';

interface CommunicationPageProps {
  currentUser: {
    id: number;
    role: 'buyer' | 'owner' | 'agent' | 'builder' | 'admin';
    name: string;
    email: string;
  };
}

export const CommunicationPage: React.FC<CommunicationPageProps> = ({
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'inquiries' | 'messages'>('inquiries');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [unreadCount, setUnreadCount] = useState(0);
  const [inquiryStats, setInquiryStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    closed: 0,
  });

  const loadUnreadCount = async () => {
    try {
      const response = await api.communication.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const loadInquiryStats = async () => {
    try {
      const response = await api.communication.getInquiryStats();
      setInquiryStats(response.data);
    } catch (err) {
      console.error('Failed to load inquiry stats:', err);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    loadInquiryStats();
  }, []);

  const getTabTitle = (tab: 'inquiries' | 'messages') => {
    switch (tab) {
      case 'inquiries':
        return inquiryStats.new > 0 
          ? `Inquiries (${inquiryStats.new} new)` 
          : 'Inquiries';
      case 'messages':
        return unreadCount > 0 
          ? `Messages (${unreadCount} unread)` 
          : 'Messages';
      default:
        return tab;
    }
  };

  const getWelcomeMessage = () => {
    switch (currentUser.role) {
      case 'buyer':
        return {
          title: 'Your Communication Hub',
          description: 'Track your property inquiries and chat with property owners and agents.',
        };
      case 'owner':
        return {
          title: 'Property Owner Dashboard',
          description: 'Manage inquiries for your properties and communicate with potential buyers.',
        };
      case 'agent':
        return {
          title: 'Agent Communication Center',
          description: 'Handle client inquiries and manage property communications.',
        };
      case 'builder':
        return {
          title: 'Builder Communication Hub',
          description: 'Manage project inquiries and communicate with potential buyers.',
        };
      case 'admin':
        return {
          title: 'Admin Communication Overview',
          description: 'Monitor platform communications and moderate content.',
        };
      default:
        return {
          title: 'Communication Center',
          description: 'Manage your property communications.',
        };
    }
  };

  const welcomeMessage = getWelcomeMessage();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{welcomeMessage.title}</h1>
            <p className="text-blue-100 mt-1">{welcomeMessage.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            {inquiryStats.new > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold">{inquiryStats.new}</div>
                <div className="text-sm text-blue-100">New Inquiries</div>
              </div>
            )}
            {unreadCount > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm text-blue-100">Unread Messages</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inquiries</p>
              <p className="text-xl font-semibold">{inquiryStats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Inquiries</p>
              <p className="text-xl font-semibold text-blue-600">{inquiryStats.new}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Badge className="bg-blue-600 text-white">New</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Chats</p>
              <p className="text-xl font-semibold text-green-600">
                {inquiryStats.contacted}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread Messages</p>
              <p className="text-xl font-semibold text-orange-600">{unreadCount}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'inquiries' | 'messages')}>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inquiries'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{getTabTitle('inquiries')}</span>
                  {inquiryStats.new > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {inquiryStats.new}
                    </Badge>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  <span>{getTabTitle('messages')}</span>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'inquiries' && (
              <InquiryHistoryPage
                userRole={currentUser.role}
                userId={currentUser.id}
              />
            )}

            {activeTab === 'messages' && (
              <MessagingInterface
                currentUserId={currentUser.id}
                selectedConversationId={selectedConversationId}
                onConversationSelect={setSelectedConversationId}
              />
            )}
          </div>
        </Tabs>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 p-4 h-auto"
            onClick={() => setActiveTab('inquiries')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-left">
              <div className="font-medium">View All Inquiries</div>
              <div className="text-sm text-gray-500">Manage property inquiries</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 p-4 h-auto"
            onClick={() => setActiveTab('messages')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <div className="text-left">
              <div className="font-medium">Open Messages</div>
              <div className="text-sm text-gray-500">Chat with contacts</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 p-4 h-auto"
            onClick={() => {
              loadUnreadCount();
              loadInquiryStats();
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div className="text-left">
              <div className="font-medium">Refresh</div>
              <div className="text-sm text-gray-500">Update counters</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};