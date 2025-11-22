// Buyer-specific types and interfaces

export interface BuyerStats {
  savedProperties: number;
  savedSearches: number;
  messages: number;
}

export interface BuyerStatsData {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle: string;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
}

export interface BuyerDashboardProps {
  stats: BuyerStats;
}

export interface BuyerActivity {
  id: number;
  type: 'favorite_added' | 'search_saved' | 'inquiry_sent' | 'message_received';
  title: string;
  description: string;
  timestamp: string;
  property_id?: number;
  search_id?: number;
}