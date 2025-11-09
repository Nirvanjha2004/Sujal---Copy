// Message-related types extracted from Messages component

export interface Message {
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

export interface PropertyImage {
  id: number;
  image_url: string;
  large_url? : string;
  thumbnail_url?: string;
  medium_url? : string; 
  alt_text?: string;
  is_primary: boolean;
}

export interface Property {
  id: number;
  title: string;
  price: number;
  images?: PropertyImage[];
}

export interface Conversation {
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

export interface ConversationOptions {
  limit?: number;
  offset?: number;
}

export interface MessageOptions {
  limit?: number;
  offset?: number;
}