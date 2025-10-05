import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  conversation_id: string;
  sender_id: number;
  recipient_id: number;
  content: string;
  status: 'sent' | 'read';
  created_at: string;
  read_at?: string;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  recipient: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  property?: {
    id: number;
    title: string;
  };
}

interface Conversation {
  conversation_id: string;
  participant: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  property?: {
    id: number;
    title: string;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: number;
  };
  unread_count: number;
  total_messages: number;
}

interface MessagingInterfaceProps {
  currentUserId: number;
  selectedConversationId?: string;
  onConversationSelect?: (conversationId: string) => void;
}

export const MessagingInterface: React.FC<MessagingInterfaceProps> = ({
  currentUserId,
  selectedConversationId,
  onConversationSelect,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await api.communication.getConversations();
      setConversations(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await api.communication.getMessages(conversationId);
      setMessages(response.data);
      
      // Mark messages as read
      await api.communication.markAsRead(conversationId);
      
      // Update conversation unread count
      setConversations(prev =>
        prev.map(conv =>
          conv.conversation_id === conversationId
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    setSendingMessage(true);
    try {
      // Find the recipient from the selected conversation
      const conversation = conversations.find(c => c.conversation_id === selectedConversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const messageData = {
        recipient_id: conversation.participant.id,
        content: newMessage.trim(),
        property_id: conversation.property?.id,
      };

      const response = await api.communication.sendMessage(messageData);
      
      // Add the new message to the list
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      // Update the conversation's last message
      setConversations(prev =>
        prev.map(conv =>
          conv.conversation_id === selectedConversationId
            ? {
                ...conv,
                last_message: {
                  content: newMessage.trim(),
                  created_at: new Date().toISOString(),
                  sender_id: currentUserId,
                },
                total_messages: conv.total_messages + 1,
              }
            : conv
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.conversation_id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversationId === conversation.conversation_id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onConversationSelect?.(conversation.conversation_id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {conversation.participant.profile_image ? (
                      <img
                        src={conversation.participant.profile_image}
                        alt={`${conversation.participant.first_name} ${conversation.participant.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {conversation.participant.first_name[0]}{conversation.participant.last_name[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.participant.first_name} {conversation.participant.last_name}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    {conversation.property && (
                      <p className="text-xs text-gray-500 truncate">
                        Re: {conversation.property.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.last_message.content}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            {/* Messages Header */}
            <div className="p-4 border-b border-gray-200">
              {(() => {
                const conversation = conversations.find(c => c.conversation_id === selectedConversationId);
                return conversation ? (
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {conversation.participant.first_name} {conversation.participant.last_name}
                    </h4>
                    {conversation.property && (
                      <p className="text-sm text-gray-600">
                        About: {conversation.property.title}
                      </p>
                    )}
                  </div>
                ) : null;
              })()}
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === currentUserId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p
                        className={`text-xs ${
                          message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatMessageTime(message.created_at)}
                      </p>
                      {message.sender_id === currentUserId && (
                        <span
                          className={`text-xs ${
                            message.status === 'read' ? 'text-blue-100' : 'text-blue-200'
                          }`}
                        >
                          {message.status === 'read' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={2}
                  className="flex-1 resize-none"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="self-end"
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582 8-8s8 3.582 8 8z" />
              </svg>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};