import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { Layout } from "@/shared/components/layout/Layout";
import { DashboardLayout } from "../components/common/DashboardLayout";
import { useAuth } from "@/shared/contexts/AuthContext";
import { toast } from "sonner";
import { api } from "@/shared/lib/api";

interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface PropertyImage {
  id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
}

interface Property {
  id: number;
  title: string;
  price: number;
  images?: PropertyImage[];
}

interface Conversation {
  id: number;
  subject: string;
  property_id: number;
  created_at: string;
  property?: Property;
  participants?: Array<{
    user_id: number;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  }>;
}

/**
 * Messages Page - migrated to dashboard feature
 * Uses new dashboard layout while maintaining existing functionality
 */
export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { state: { user, isAuthenticated } } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await api.getConversations({ limit: 50 });
        if (response.success) {
          setConversations(response.data.conversations);
          
          // If we have a conversationId, find and set the active conversation
          if (conversationId) {
            const conversation = response.data.conversations.find((c: Conversation) => 
              c.id === parseInt(conversationId)
            );
            if (conversation) {
              setActiveConversation(conversation);
              loadMessages(parseInt(conversationId));
            }
          }
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadConversations();
    }
  }, [conversationId, isAuthenticated]);

  // Load messages for a conversation
  const loadMessages = async (convId: number) => {
    try {
      setMessagesLoading(true);
      const response = await api.getMessages(convId, { limit: 100 });
      if (response.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} CRORE`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} LAKH`;
    } else {
      return `₹ ${price.toLocaleString()}`;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const response = await api.sendMessage(activeConversation.id, newMessage);
      if (response.success) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage("");
        toast.success("Message sent!");
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!conversation.participants || !user) return null;
    return conversation.participants.find(p => p.user_id !== user.id)?.user;
  };

  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversation(conversation);
    navigate(`/dashboard/messages/${conversation.id}`);
    loadMessages(conversation.id);
  };

  const getPropertyImage = (property: Property) => {
    if (!property.images || property.images.length === 0) return null;
    
    // Try to get primary image first
    const primaryImage = property.images.find(img => img.is_primary);
    if (primaryImage) return primaryImage.image_url;
    
    // Fallback to first image
    return property.images[0].image_url;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <DashboardLayout>
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center gap-2">
                <Icon icon="solar:loading-bold" className="size-6 animate-spin text-primary" />
                <span>Loading conversations...</span>
              </div>
            </div>
          </DashboardLayout>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <DashboardLayout>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground">
                  Manage your property conversations
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Conversations List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon icon="solar:chat-dots-bold" className="size-5" />
                    Conversations
                    <Badge variant="secondary" className="ml-auto">
                      {conversations.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    {conversations.length === 0 ? (
                      <div className="p-6 text-center">
                        <Icon icon="solar:chat-dots-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No conversations yet</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {conversations.map((conversation) => {
                          const otherParticipant = getOtherParticipant(conversation);
                          const isActive = activeConversation?.id === conversation.id;
                          const propertyImage = conversation.property ? getPropertyImage(conversation.property) : null;
                          
                          return (
                            <div
                              key={conversation.id}
                              className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
                                isActive ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                              }`}
                              onClick={() => handleConversationClick(conversation)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  {propertyImage ? (
                                    <img 
                                      src={propertyImage} 
                                      alt={conversation.property?.title}
                                      className="size-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <Icon icon="solar:user-bold" className="size-5 text-primary" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium truncate">
                                      {otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Unknown User'}
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(conversation.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mb-2">
                                    {conversation.property?.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {conversation.subject}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-2">
                {activeConversation ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="border-b">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon icon="solar:user-bold" className="size-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {(() => {
                              const otherParticipant = getOtherParticipant(activeConversation);
                              return otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Unknown User';
                            })()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {activeConversation.property?.title}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {activeConversation.property ? formatPrice(activeConversation.property.price) : ''}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/properties/${activeConversation.property_id}`)}
                          >
                            <Icon icon="solar:eye-bold" className="size-4 mr-1" />
                            View Property
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="p-0">
                      <ScrollArea className="h-[calc(100vh-450px)] p-4">
                        {messagesLoading ? (
                          <div className="flex items-center justify-center h-32">
                            <Icon icon="solar:loading-bold" className="size-6 animate-spin text-primary" />
                          </div>
                        ) : messages.length > 0 ? (
                          <div className="space-y-4">
                            {messages.map((message) => {
                              const isOwn = message.sender_id === user?.id;
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                      isOwn
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                    <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                      {new Date(message.created_at).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                          </div>
                        )}
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="border-t p-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                          >
                            <Icon icon="solar:plain-2-bold" className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Icon icon="solar:chat-dots-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                      <p className="text-muted-foreground">
                        Choose a conversation from the list to start messaging
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </div>
    </Layout>
  );
}