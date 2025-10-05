import { User } from '../models/User';
import { Property, PropertyType, ListingType, PropertyStatus } from '../models/Property';
import { PropertyImage } from '../models/PropertyImage';

export async function seedProperties() {
  try {
    console.log('Starting comprehensive seeding...');

    // Create all 4 types of users
    const users = [
      {
        email: 'buyer@example.com',
        password_hash: 'buyer123',
        first_name: 'Rajesh',
        last_name: 'Kumar',
        role: 'buyer',
        phone: '+91-9876543210',
        is_verified: true,
        is_active: true,
      },
      {
        email: 'owner@example.com',
        password_hash: 'owner123',
        first_name: 'Priya',
        last_name: 'Sharma',
        role: 'owner',
        phone: '+91-9876543211',
        is_verified: true,
        is_active: true,
      },
      {
        email: 'agent@example.com',
        password_hash: 'agent123',
        first_name: 'Amit',
        last_name: 'Singh',
        role: 'agent',
        phone: '+91-9876543212',
        is_verified: true,
        is_active: true,
      },
      {
        email: 'builder@example.com',
        password_hash: 'builder123',
        first_name: 'Sunita',
        last_name: 'Builders',
        role: 'builder',
        phone: '+91-9876543213',
        is_verified: true,
        is_active: true,
      }
    ];

    // Create users if they don't exist
    const createdUsers = [];
    for (const userData of users) {
      let user = await User.findOne({ where: { email: userData.email } });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created user: ${user.first_name} ${user.last_name} (${user.role})`);
      }
      createdUsers.push(user);
    }

    // Check if properties already exist
    const existingProperties = await Property.count();
    if (existingProperties >= 15) {
      console.log(`Database already has ${existingProperties} properties. Skipping property seed.`);
      return;
    }

    console.log(`Database has ${existingProperties} properties. Adding sample data...`);

    // 15 Properties across different Indian states
    const properties = [
      // Mumbai, Maharashtra - Luxury Properties
      {
        user_id: createdUsers[1].id, // Owner
        title: 'Luxury 4BHK Sea View Apartment in Bandra',
        description: 'Premium 4-bedroom apartment with stunning Arabian Sea views, world-class amenities, and prime location in Bandra West. Perfect for luxury living.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.SALE,
        status: PropertyStatus.NEW,
        price: 35000000,
        area_sqft: 2800,
        bedrooms: 4,
        bathrooms: 4,
        address: '15th Floor, Palais Royale, Worli Sea Face',
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
          club_house: true,
          garden: true,
          children_play_area: true,
        },
        is_featured: true,
        is_active: true,
      },
      {
        user_id: createdUsers[2].id, // Agent
        title: 'Spacious 3BHK Apartment in Andheri East',
        description: 'Well-ventilated 3BHK apartment near metro station and IT parks. Great connectivity and modern amenities.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.RENT,
        status: PropertyStatus.NEW,
        price: 65000,
        area_sqft: 1650,
        bedrooms: 3,
        bathrooms: 3,
        address: 'Raj Heights, Chakala, Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400099',
        amenities: {
          parking: true,
          gym: true,
          security: true,
          elevator: true,
          power_backup: true,
        },
        is_featured: false,
        is_active: true,
      },

      // Bangalore, Karnataka - Tech Hub Properties
      {
        user_id: createdUsers[3].id, // Builder
        title: 'Premium Villa in Brigade Orchards',
        description: 'Luxury 4BHK villa with private garden, club access, and premium amenities in Bangalore\'s most sought-after location.',
        property_type: PropertyType.HOUSE,
        listing_type: ListingType.SALE,
        status: PropertyStatus.NEW,
        price: 18500000,
        area_sqft: 3200,
        bedrooms: 4,
        bathrooms: 5,
        address: 'Brigade Orchards, Devanahalli',
        city: 'Bangalore',
        state: 'Karnataka',
        postal_code: '562110',
        amenities: {
          parking: true,
          garden: true,
          security: true,
          club_house: true,
          swimming_pool: true,
          gym: true,
          playground: true,
        },
        is_featured: true,
        is_active: true,
      },
      {
        user_id: createdUsers[1].id, // Owner
        title: '2BHK Flat Near Electronic City',
        description: 'Modern 2BHK apartment perfect for IT professionals. Close to Electronic City and major IT companies.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.RENT,
        status: PropertyStatus.NEW,
        price: 28000,
        area_sqft: 1100,
        bedrooms: 2,
        bathrooms: 2,
        address: 'Prestige Shantiniketan, Electronic City',
        city: 'Bangalore',
        state: 'Karnataka',
        postal_code: '560100',
        amenities: {
          parking: true,
          security: true,
          elevator: true,
          gym: true,
        },
        is_featured: false,
        is_active: true,
      },

      // Delhi NCR - Capital Region Properties
      {
        user_id: createdUsers[2].id, // Agent
        title: 'Luxury Penthouse in Golf Course Road',
        description: 'Ultra-luxury 5BHK penthouse with private terrace, premium interiors, and golf course views in DLF Phase 5.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.SALE,
        status: PropertyStatus.NEW,
        price: 85000000,
        area_sqft: 4500,
        bedrooms: 5,
        bathrooms: 6,
        address: 'DLF Crest, Golf Course Road, Sector 54',
        city: 'Gurgaon',
        state: 'Haryana',
        postal_code: '122002',
        amenities: {
          parking: true,
          elevator: true,
          security: true,
          swimming_pool: true,
          gym: true,
          club_house: true,
          concierge_service: true,
          terrace: true,
        },
        is_featured: true,
        is_active: true,
      },
      {
        user_id: createdUsers[3].id, // Builder
        title: 'Affordable 2BHK in Noida Extension',
        description: 'Budget-friendly 2BHK apartments in a well-planned society with good connectivity to Delhi and Noida.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.SALE,
        status: PropertyStatus.UNDER_CONSTRUCTION,
        price: 4200000,
        area_sqft: 995,
        bedrooms: 2,
        bathrooms: 2,
        address: 'Supertech Ecociti, Sector 137',
        city: 'Noida',
        state: 'Uttar Pradesh',
        postal_code: '201305',
        amenities: {
          parking: true,
          security: true,
          elevator: true,
          playground: true,
        },
        is_featured: false,
        is_active: true,
      },

      // Chennai, Tamil Nadu - South Indian Hub
      {
        user_id: createdUsers[1].id, // Owner
        title: 'Beach Side Villa in ECR',
        description: 'Stunning 3BHK beach villa on East Coast Road with direct beach access and modern amenities.',
        property_type: PropertyType.HOUSE,
        listing_type: ListingType.SALE,
        status: PropertyStatus.NEW,
        price: 22000000,
        area_sqft: 2800,
        bedrooms: 3,
        bathrooms: 4,
        address: 'Muttukadu, East Coast Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '603112',
        amenities: {
          parking: true,
          garden: true,
          security: true,
          swimming_pool: true,
          beach_access: true,
        },
        is_featured: true,
        is_active: true,
      },
      {
        user_id: createdUsers[2].id, // Agent
        title: '1BHK Apartment in T. Nagar',
        description: 'Compact 1BHK apartment in the heart of Chennai\'s shopping district. Great for young professionals.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.RENT,
        status: PropertyStatus.NEW,
        price: 18000,
        area_sqft: 580,
        bedrooms: 1,
        bathrooms: 1,
        address: 'Radhika Apartments, T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600017',
        amenities: {
          security: true,
          elevator: true,
          power_backup: true,
        },
        is_featured: false,
        is_active: true,
      },

      // Hyderabad, Telangana - IT Hub
      {
        user_id: createdUsers[3].id, // Builder
        title: 'Modern 3BHK in HITEC City',
        description: 'Contemporary 3BHK apartment in Hyderabad\'s IT corridor with excellent connectivity and premium amenities.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.SALE,
        status: PropertyStatus.NEW,
        price: 12500000,
        area_sqft: 1850,
        bedrooms: 3,
        bathrooms: 3,
        address: 'My Home Bhooja, HITEC City',
        city: 'Hyderabad',
        state: 'Telangana',
        postal_code: '500081',
        amenities: {
          parking: true,
          gym: true,
          swimming_pool: true,
          security: true,
          elevator: true,
          club_house: true,
        },
        is_featured: false,
        is_active: true,
      },

      // Pune, Maharashtra - Educational Hub
      {
        user_id: createdUsers[1].id, // Owner
        title: 'Student-Friendly 2BHK near Pune University',
        description: 'Well-maintained 2BHK apartment perfect for students and young professionals near Pune University.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.RENT,
        status: PropertyStatus.NEW,
        price: 22000,
        area_sqft: 950,
        bedrooms: 2,
        bathrooms: 2,
        address: 'Aundh, near Pune University',
        city: 'Pune',
        state: 'Maharashtra',
        postal_code: '411007',
        amenities: {
          parking: true,
          security: true,
          internet: true,
          power_backup: true,
        },
        is_featured: false,
        is_active: true,
      },

      // Kolkata, West Bengal
      {
        user_id: createdUsers[2].id, // Agent
        title: 'Heritage Property in Salt Lake City',
        description: 'Spacious 3BHK apartment in the planned city of Salt Lake with parks and good connectivity.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.SALE,
        status: PropertyStatus.RESALE,
        price: 8500000,
        area_sqft: 1450,
        bedrooms: 3,
        bathrooms: 2,
        address: 'Sector V, Salt Lake City',
        city: 'Kolkata',
        state: 'West Bengal',
        postal_code: '700091',
        amenities: {
          parking: true,
          security: true,
          elevator: true,
          park_facing: true,
        },
        is_featured: false,
        is_active: true,
      },

      // Ahmedabad, Gujarat - Commercial Hub
      {
        user_id: createdUsers[3].id, // Builder
        title: 'Commercial Office Space in SG Highway',
        description: 'Premium office space in Ahmedabad\'s business district with modern amenities and excellent connectivity.',
        property_type: PropertyType.COMMERCIAL,
        listing_type: ListingType.RENT,
        status: PropertyStatus.NEW,
        price: 85000,
        area_sqft: 1800,
        bedrooms: 0,
        bathrooms: 2,
        address: 'Avalon Corporate Park, SG Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postal_code: '380015',
        amenities: {
          parking: true,
          elevator: true,
          security: true,
          power_backup: true,
          air_conditioning: true,
          cafeteria: true,
        },
        is_featured: false,
        is_active: true,
      },

      // Jaipur, Rajasthan - Heritage City
      {
        user_id: createdUsers[1].id, // Owner
        title: 'Rajasthani Style Villa in Malviya Nagar',
        description: 'Beautiful 4BHK villa with traditional Rajasthani architecture and modern amenities.',
        property_type: PropertyType.HOUSE,
        listing_type: ListingType.SALE,
        status: PropertyStatus.NEW,
        price: 15000000,
        area_sqft: 2900,
        bedrooms: 4,
        bathrooms: 4,
        address: 'Malviya Nagar, C-Scheme',
        city: 'Jaipur',
        state: 'Rajasthan',
        postal_code: '302017',
        amenities: {
          parking: true,
          garden: true,
          security: true,
          traditional_architecture: true,
          courtyard: true,
        },
        is_featured: true,
        is_active: true,
      },

      // Kochi, Kerala - Coastal Beauty
      {
        user_id: createdUsers[2].id, // Agent
        title: 'Waterfront Apartment in Marine Drive',
        description: 'Luxurious 3BHK apartment with backwater views and modern amenities in the heart of Kochi.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.RENT,
        status: PropertyStatus.NEW,
        price: 45000,
        area_sqft: 1650,
        bedrooms: 3,
        bathrooms: 3,
        address: 'Trident Towers, Marine Drive',
        city: 'Kochi',
        state: 'Kerala',
        postal_code: '682031',
        amenities: {
          parking: true,
          security: true,
          elevator: true,
          water_view: true,
          gym: true,
        },
        is_featured: true,
        is_active: true,
      },

      // Chandigarh - Planned City
      {
        user_id: createdUsers[3].id, // Builder
        title: 'Modern 2BHK in Sector 22',
        description: 'Well-planned 2BHK apartment in Chandigarh\'s prime sector with excellent infrastructure.',
        property_type: PropertyType.APARTMENT,
        listing_type: ListingType.SALE,
        status: PropertyType.APARTMENT,
        price: 7800000,
        area_sqft: 1200,
        bedrooms: 2,
        bathrooms: 2,
        address: 'Sector 22-D, Chandigarh',
        city: 'Chandigarh',
        state: 'Chandigarh',
        postal_code: '160022',
        amenities: {
          parking: true,
          security: true,
          park_facing: true,
          planned_city: true,
        },
        is_featured: false,
        is_active: true,
      },
    ];

    // Sample image URLs from Unsplash (real estate themed)
    const sampleImages = [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', // Modern apartment
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', // Luxury house
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800', // Villa exterior
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // Modern building
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800', // Residential complex
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', // High-rise apartment
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800', // Luxury interior
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800', // Modern house
    ];

    // Create properties
    let createdCount = 0;
    for (const propertyData of properties) {
      try {
        const property = await Property.create(propertyData);
        console.log(`Created property: ${property.title} in ${property.city}, ${property.state}`);

        // Add 1-3 sample images for each property
        const imageCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < imageCount; i++) {
          await PropertyImage.create({
            property_id: property.id,
            image_url: sampleImages[Math.floor(Math.random() * sampleImages.length)],
            alt_text: `${property.title} - Image ${i + 1}`,
            is_primary: i === 0, // First image is primary
            display_order: i + 1,
          });
        }
        createdCount++;
      } catch (error) {
        console.error(`Error creating property: ${propertyData.title}`, error);
      }
    }

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`📊 Created ${createdUsers.length} users across all roles`);
    console.log(`🏠 Created ${createdCount} properties across ${new Set(properties.map(p => p.state)).size} states`);
    console.log(`📸 Added sample images for all properties`);
    
    // Print user summary
    console.log(`\n👥 User Summary:`);
    createdUsers.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.role}) - ${user.email}`);
    });

    // Print state-wise property summary
    const stateCount = properties.reduce((acc, prop) => {
      acc[prop.state] = (acc[prop.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`\n🗺️  Properties by State:`);
    Object.entries(stateCount).forEach(([state, count]) => {
      console.log(`   - ${state}: ${count} properties`);
    });

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}
