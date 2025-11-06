// Favorites-related types and interfaces
import { Property } from '@/features/property/types';

export interface Favorite {
  id: number;
  user_id: number;
  property_id: number;
  added_at: string;
  created_at: string;
  property: Property;
}

export interface FavoriteProperty extends Property {
  added_at: string;
}

export interface FavoritesPageState {
  selectedProperties: number[];
  viewMode: 'grid' | 'list';
  sortBy: 'date_added' | 'price' | 'title';
}

export interface FavoritesStats {
  totalSaved: number;
  averagePrice: number;
  averageArea: number;
}