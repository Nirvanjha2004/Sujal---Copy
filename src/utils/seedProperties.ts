import { User, UserRole } from '../models/User';
import { Property, PropertyType, ListingType, PropertyStatus } from '../models/Property';
import { PropertyImage } from '../models/PropertyImage';
import { Inquiry, InquiryStatus } from '../models/Inquiry';
import { UserFavorite } from '../models/UserFavorite';
import { SavedSearch } from '../models/SavedSearch';

export async function seedProperties() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Create all user types including admin
    const users = await seedUsers();
    console.log(`✅ Created ${users.length} users`);

    // Seed individual properties (only defined property types)
    await seedIndividualProperties(users);
    console.log('✅ Individual properties seeded');

    // Seed inquiries
    await seedInquiries(users);
    console.log('✅ Inquiries seeded');

    // Seed user favorites and saved searches
    await seedUserInteractions(users);
    console.log('✅ User interactions seeded');

    console.log('\n🎉 Database seeding completed successfully!');
    
    // Print summary
    await printSeedingSummary();

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function seedUsers() {
  const usersData = [
    // Buyers
    {
      email: 'buyer1@example.com',
      password_hash: 'buyer123',
      first_name: 'Rajesh',
      last_name: 'Kumar',
      role: UserRole.BUYER,
      phone: '+91-9876543210',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'buyer2@example.com',
      password_hash: 'buyer123',
      first_name: 'Priya',
      last_name: 'Sharma',
      role: UserRole.BUYER,
      phone: '+91-9876543211',
      is_verified: true,
      is_active: true,
    },

    // Property Owners
    {
      email: 'owner1@example.com',
      password_hash: 'owner123',
      first_name: 'Vikram',
      last_name: 'Singh',
      role: UserRole.OWNER,
      phone: '+91-9876543212',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'owner2@example.com',
      password_hash: 'owner123',
      first_name: 'Sunita',
      last_name: 'Patel',
      role: UserRole.OWNER,
      phone: '+91-9876543213',
      is_verified: true,
      is_active: true,
    },

    // Real Estate Agents
    {
      email: 'agent1@example.com',
      password_hash: 'agent123',
      first_name: 'Amit',
      last_name: 'Agarwal',
      role: UserRole.AGENT,
      phone: '+91-9876543214',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'agent2@example.com',
      password_hash: 'agent123',
      first_name: 'Neha',
      last_name: 'Gupta',
      role: UserRole.AGENT,
      phone: '+91-9876543215',
      is_verified: true,
      is_active: true,
    },

    // Builders/Developers
    {
      email: 'builder1@example.com',
      password_hash: 'builder123',
      first_name: 'DLF',
      last_name: 'Developers',
      role: UserRole.BUILDER,
      phone: '+91-9876543216',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'builder2@example.com',
      password_hash: 'builder123',
      first_name: 'Godrej',
      last_name: 'Properties',
      role: UserRole.BUILDER,
      phone: '+91-9876543217',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'builder3@example.com',
      password_hash: 'builder123',
      first_name: 'Prestige',
      last_name: 'Group',
      role: UserRole.BUILDER,
      phone: '+91-9876543218',
      is_verified: true,
      is_active: true,
    },

    // System Admin
    {
      email: 'admin@example.com',
      password_hash: 'admin123',
      first_name: 'System',
      last_name: 'Administrator',
      role: UserRole.ADMIN,
      phone: '+91-9876543219',
      is_verified: true,
      is_active: true,
    },
  ];

  const createdUsers = [];
  for (const userData of usersData) {
    let user = await User.findOne({ where: { email: userData.email } });
    if (!user) {
      user = await User.create(userData);
      console.log(`  👤 Created user: ${user.first_name} ${user.last_name} (${user.role})`);
    } else {
      console.log(`  🔄 User already exists: ${user.email}`);
    }
    createdUsers.push(user);
  }

  return createdUsers;
}

async function seedIndividualProperties(users: User[]) {
  const owners = users.filter(u => u.role === UserRole.OWNER);
  const agents = users.filter(u => u.role === UserRole.AGENT);

  const properties = [
    // APARTMENTS
    {
      user_id: owners[0].id,
      title: 'Luxury 4BHK Penthouse in Bandra West',
      description: 'Ultra-luxury penthouse with 360-degree city and sea views, private terrace, premium Italian marble flooring, and world-class amenities.',
      property_type: PropertyType.APARTMENT,
      listing_type: ListingType.SALE,
      status: PropertyStatus.ACTIVE,
      price: 55000000,
      area_sqft: 3500,
      bedrooms: 4,
      bathrooms: 5,
      address: 'Palais Royale, Worli Sea Face',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400025',
      amenities: {
        parking: true,
        gym: true,
        swimming_pool: true,
        security: true,
        elevator: true,
        power_backup: true,
        air_conditioning: true,
        club_house: true
      },
      is_featured: true,
      is_active: true,
    },
    {
      user_id: agents[0].id,
      title: '2BHK Ready-to-Move Apartment in Andheri',
      description: 'Spacious 2BHK apartment with modern amenities, near metro station and shopping complexes. Perfect for young professionals.',
      property_type: PropertyType.APARTMENT,
      listing_type: ListingType.RENT,
      status: PropertyStatus.ACTIVE,
      price: 45000,
      area_sqft: 1200,
      bedrooms: 2,
      bathrooms: 2,
      address: 'Lokhandwala Complex, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400053',
      amenities: {
        parking: true,
        security: true,
        elevator: true,
        gym: true
      },
      is_featured: false,
      is_active: true,
    },
    {
      user_id: owners[1].id,
      title: '3BHK Luxury Apartment in Koramangala',
      description: 'Premium 3BHK apartment in prime Koramangala location with modern amenities and excellent connectivity.',
      property_type: PropertyType.APARTMENT,
      listing_type: ListingType.SALE,
      status: PropertyStatus.ACTIVE,
      price: 18500000,
      area_sqft: 1800,
      bedrooms: 3,
      bathrooms: 3,
      address: 'Koramangala 5th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560095',
      amenities: {
        parking: true,
        security: true,
        elevator: true,
        gym: true,
        swimming_pool: true
      },
      is_featured: true,
      is_active: true,
    },

    // HOUSES
    {
      user_id: owners[1].id,
      title: 'Independent 3BHK House with Garden',
      description: 'Spacious independent house with private garden, car parking, and peaceful neighborhood. Ideal for families.',
      property_type: PropertyType.HOUSE,
      listing_type: ListingType.SALE,
      status: PropertyStatus.ACTIVE,
      price: 12500000,
      area_sqft: 2400,
      bedrooms: 3,
      bathrooms: 3,
      address: 'Koramangala 6th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560095',
      amenities: {
        parking: true,
        garden: true,
        security: true
      },
      is_featured: true,
      is_active: true,
    },
    {
      user_id: agents[1].id,
      title: 'Duplex House for Rent in Gurgaon',
      description: '4BHK duplex house in gated community with clubhouse, swimming pool, and 24/7 security.',
      property_type: PropertyType.HOUSE,
      listing_type: ListingType.RENT,
      status: PropertyStatus.ACTIVE,
      price: 65000,
      area_sqft: 2800,
      bedrooms: 4,
      bathrooms: 4,
      address: 'DLF Phase 4, Sector 28',
      city: 'Gurgaon',
      state: 'Haryana',
      postal_code: '122002',
      amenities: {
        parking: true,
        security: true,
        swimming_pool: true,
        club_house: true,
        gym: true
      },
      is_featured: false,
      is_active: true,
    },

    // VILLAS
    {
      user_id: owners[0].id,
      title: 'Luxury Beach Villa in ECR',
      description: 'Stunning 5BHK beach villa with direct beach access, infinity pool, and breathtaking ocean views.',
      property_type: PropertyType.VILLA,
      listing_type: ListingType.SALE,
      status: PropertyStatus.ACTIVE,
      price: 45000000,
      area_sqft: 4200,
      bedrooms: 5,
      bathrooms: 6,
      address: 'East Coast Road, Mahabalipuram',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postal_code: '603104',
      amenities: {
        parking: true,
        garden: true,
        swimming_pool: true,
        security: true
      },
      is_featured: true,
      is_active: true,
    },

    // COMMERCIAL
    {
      user_id: owners[0].id,
      title: 'Premium Office Space in Business District',
      description: 'Grade A office space with modern amenities, central AC, and excellent connectivity to metro and airports.',
      property_type: PropertyType.COMMERCIAL,
      listing_type: ListingType.RENT,
      status: PropertyStatus.ACTIVE,
      price: 120000,
      area_sqft: 2500,
      bedrooms: 0,
      bathrooms: 3,
      address: 'Cyber City, DLF Phase 2',
      city: 'Gurgaon',
      state: 'Haryana',
      postal_code: '122002',
      amenities: {
        parking: true,
        elevator: true,
        security: true,
        power_backup: true,
        air_conditioning: true
      },
      is_featured: true,
      is_active: true,
    },
    {
      user_id: agents[0].id,
      title: 'Retail Showroom in Shopping Mall',
      description: 'Prime retail space in busy shopping mall with high footfall and excellent visibility.',
      property_type: PropertyType.COMMERCIAL,
      listing_type: ListingType.RENT,
      status: PropertyStatus.ACTIVE,
      price: 80000,
      area_sqft: 1200,
      bedrooms: 0,
      bathrooms: 2,
      address: 'Phoenix MarketCity, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560066',
      amenities: {
        parking: true,
        security: true,
        air_conditioning: true
      },
      is_featured: false,
      is_active: true,
    },

    // PLOTS
    {
      user_id: owners[1].id,
      title: 'Premium Residential Plot in New Town',
      description: 'Well-located residential plot in approved layout with all utilities. Perfect for building your dream home.',
      property_type: PropertyType.PLOT,
      listing_type: ListingType.SALE,
      status: PropertyStatus.ACTIVE,
      price: 8500000,
      area_sqft: 2400,
      bedrooms: 0,
      bathrooms: 0,
      address: 'New Town, Action Area 1',
      city: 'Kolkata',
      state: 'West Bengal',
      postal_code: '700156',
      amenities: {
        electricity: true,
        water_supply: true
      },
      is_featured: false,
      is_active: true,
    },
    {
      user_id: agents[1].id,
      title: 'Commercial Plot on Main Road',
      description: 'Prime commercial plot on busy main road with high visibility and excellent footfall potential.',
      property_type: PropertyType.PLOT,
      listing_type: ListingType.SALE,
      status: PropertyStatus.ACTIVE,
      price: 15000000,
      area_sqft: 1800,
      bedrooms: 0,
      bathrooms: 0,
      address: 'Ring Road, Surat',
      city: 'Surat',
      state: 'Gujarat',
      postal_code: '395007',
      amenities: {
        electricity: true,
        water_supply: true
      },
      is_featured: true,
      is_active: true,
    },
  ];

  let createdCount = 0;
  for (const propertyData of properties) {
    try {
      const property = await Property.create(propertyData);
      console.log(`  🏠 Created property: ${property.title} in ${property.city}`);

      // Add sample images
      await addPropertyImages(property.id, property.property_type);
      createdCount++;
    } catch (error) {
      console.error(`❌ Error creating property: ${propertyData.title}`, error);
    }
  }

  console.log(`✅ Created ${createdCount} individual properties`);
}

async function addPropertyImages(propertyId: number, propertyType: PropertyType) {
  // Complete imageMap covering all PropertyType enum values
  const imageMap: Record<PropertyType, string[]> = {
    [PropertyType.LAND]: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    [PropertyType.APARTMENT]: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    [PropertyType.HOUSE]: [
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    [PropertyType.VILLA]: [
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    ],
    [PropertyType.COMMERCIAL]: [
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
    ],
    [PropertyType.PLOT]: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    ],
  };

  const images = imageMap[propertyType];
  
  for (let i = 0; i < images.length; i++) {
    await PropertyImage.create({
      property_id: propertyId,
      image_url: images[i],
      alt_text: `Property Image ${i + 1}`,
      is_primary: i === 0,
      display_order: i + 1,
    });
  }
}

async function seedInquiries(users: User[]) {
  const buyers = users.filter(u => u.role === UserRole.BUYER);
  const properties = await Property.findAll({ limit: 5 });

  const inquiries = [
    // Property inquiries - using only the fields defined in Inquiry model
    ...properties.slice(0, 3).map((property, index) => ({
      property_id: property.id,
      inquirer_id: buyers[index % buyers.length]?.id || null,
      name: ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh'][index],
      email: `inquirer${index + 1}@example.com`,
      phone: `+91-987654321${index}`,
      message: `I am interested in this ${property.property_type}. Please share more details about pricing and availability.`,
      status: [InquiryStatus.NEW, InquiryStatus.CONTACTED, InquiryStatus.CLOSED][index],
    })),
  ];

  for (const inquiryData of inquiries) {
    try {
      await Inquiry.create(inquiryData);
      console.log(`  💬 Created inquiry from ${inquiryData.name}`);
    } catch (error) {
      console.error(`❌ Error creating inquiry:`, error);
    }
  }
}

async function seedUserInteractions(users: User[]) {
  const buyers = users.filter(u => u.role === UserRole.BUYER);
  const properties = await Property.findAll({ limit: 5 });

  // Create some user favorites
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

  // Create some saved searches
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

async function printSeedingSummary() {
  try {
    const userCount = await User.count();
    const propertyCount = await Property.count();
    const inquiryCount = await Inquiry.count();
    const favoriteCount = await UserFavorite.count();
    const savedSearchCount = await SavedSearch.count();

    console.log('\n📊 SEEDING SUMMARY:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏠 Properties: ${propertyCount}`);
    console.log(`💬 Inquiries: ${inquiryCount}`);
    console.log(`❤️ User Favorites: ${favoriteCount}`);
    console.log(`🔍 Saved Searches: ${savedSearchCount}`);
  } catch (error) {
    console.error('❌ Error printing summary:', error);
  }
}
