import { User, UserRole } from '../../models/User';
import { Property } from '../../models/Property';
import { UserFavorite } from '../../models/UserFavorite';
import { SavedSearch } from '../../models/SavedSearch';

export async function seedUserInteractions(users: User[]) {
  const buyers = users.filter(u => u.role === UserRole.BUYER);
  const properties = await Property.findAll({ limit: 10 });

  // Create user favorites
  for (let i = 0; i < Math.min(buyers.length, properties.length); i++) {
    try {
      await UserFavorite.create({
        user_id: buyers[i].id,
        property_id: properties[i].id,
      });
      console.log(`  ❤️ Created favorite for user ${buyers[i].first_name}`);
    } catch (error) {
      console.error('❌ Error creating favorite:', error);
    }
  }

  // Create saved searches
  const savedSearches = [
    {
      user_id: buyers[0]?.id,
      search_name: 'Apartments in Mumbai under 50L',
      search_criteria: {
        city: 'Mumbai',
        property_type: 'apartment',
        max_price: 5000000,
        bedrooms: [2, 3],
      },
    },
    {
      user_id: buyers[1]?.id,
      search_name: 'Houses in Bangalore',
      search_criteria: {
        city: 'Bangalore',
        property_type: 'house',
        min_bedrooms: 3,
      },
    },
    {
      user_id: buyers[2]?.id,
      search_name: 'Villas in Goa',
      search_criteria: {
        city: 'Goa',
        property_type: 'villa',
        listing_type: 'sale',
      },
    },
  ];

  for (const searchData of savedSearches) {
    if (searchData.user_id) {
      try {
        await SavedSearch.create(searchData);
        console.log(`  🔍 Created saved search: ${searchData.search_name}`);
      } catch (error) {
        console.error('❌ Error creating saved search:', error);
      }
    }
  }
}
