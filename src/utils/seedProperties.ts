import { User } from '../models/User';
import { Property, PropertyType, ListingType, PropertyStatus } from '../models/Property';
import { PropertyImage } from '../models/PropertyImage';
import { Project, ProjectStatus, ProjectType } from '../models/Project';
import { ProjectUnit, UnitStatus } from '../models/ProjectUnit';
import { ProjectImage } from '../models/ProjectImage';
import { Inquiry, InquiryStatus } from '../models/Inquiry';

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
    if (existingProperties < 15) {
      console.log(`Database has ${existingProperties} properties. Adding sample data...`);
      await seedIndividualProperties(createdUsers);
    } else {
      console.log(`Database already has ${existingProperties} properties. Skipping property seed.`);
    }

    // Seed Projects for the builder
    const builderUser = createdUsers.find(u => u.role === 'builder');
    if (builderUser) {
      const existingProjects = await Project.count({ where: { builder_id: builderUser.id } });
      if (existingProjects < 3) {
        console.log(`Builder has ${existingProjects} projects. Adding sample projects...`);
        await seedBuilderProjects(builderUser);
      } else {
        console.log(`Builder already has ${existingProjects} projects. Skipping project seed.`);
      }
    }

    // Seed Inquiries for both properties and projects
    const existingInquiries = await Inquiry.count();
    if (existingInquiries < 10) {
      console.log(`Database has ${existingInquiries} inquiries. Adding sample inquiries...`);
      await seedInquiries(createdUsers);
    } else {
      console.log(`Database already has ${existingInquiries} inquiries. Skipping inquiry seed.`);
    }

    console.log(`\n🎉 Seeding completed successfully!`);

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

async function seedBuilderProjects(builderUser: User) {
  const projectsToSeed = [
    {
      name: 'Elysian Towers',
      description: 'A landmark of luxury living in the heart of Pune, offering unparalleled views and world-class amenities. Elysian Towers is designed for those who seek a lifestyle of comfort and sophistication.',
      location: 'Koregaon Park',
      address: '123 Luxe Avenue, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      status: ProjectStatus.UNDER_CONSTRUCTION,
      project_type: ProjectType.RESIDENTIAL,
      start_date: new Date('2023-01-15'),
      expected_completion_date: new Date('2025-12-31'),
      rera_number: 'P52100001234',
      amenities: {
        "Swimming Pool": true,
        "Gym/Fitness Center": true,
        "Clubhouse": true,
        "24/7 Power Backup": true,
        "Security": true,
        "Parking": true,
        "Garden/Landscaping": true,
        "Children's Play Area": true,
      },
      images: [
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      ],
      units: [
        { unit_number: 'A-101', unit_type: '3BHK', floor_number: 1, tower: 'A', area_sqft: 1800, carpet_area: 1440, built_up_area: 1620, super_built_up_area: 1800, price: 25000000, bedrooms: 3, bathrooms: 3, facing: 'East', status: UnitStatus.AVAILABLE },
        { unit_number: 'A-102', unit_type: '3BHK', floor_number: 1, tower: 'A', area_sqft: 1850, carpet_area: 1480, built_up_area: 1665, super_built_up_area: 1850, price: 25500000, bedrooms: 3, bathrooms: 3, facing: 'West', status: UnitStatus.SOLD },
        { unit_number: 'A-201', unit_type: '3BHK', floor_number: 2, tower: 'A', area_sqft: 1800, carpet_area: 1440, built_up_area: 1620, super_built_up_area: 1800, price: 26000000, bedrooms: 3, bathrooms: 3, facing: 'North', status: UnitStatus.AVAILABLE },
        { unit_number: 'B-501', unit_type: '4BHK', floor_number: 5, tower: 'B', area_sqft: 2500, carpet_area: 2000, built_up_area: 2250, super_built_up_area: 2500, price: 35000000, bedrooms: 4, bathrooms: 4, facing: 'North', status: UnitStatus.AVAILABLE, is_corner_unit: true },
        { unit_number: 'B-502', unit_type: '4BHK', floor_number: 5, tower: 'B', area_sqft: 2550, carpet_area: 2040, built_up_area: 2295, super_built_up_area: 2550, price: 35500000, bedrooms: 4, bathrooms: 4, facing: 'South', status: UnitStatus.BLOCKED },
        { unit_number: 'B-801', unit_type: '4BHK Penthouse', floor_number: 8, tower: 'B', area_sqft: 3200, carpet_area: 2560, built_up_area: 2880, super_built_up_area: 3200, price: 50000000, bedrooms: 4, bathrooms: 5, facing: 'East', status: UnitStatus.AVAILABLE, has_terrace: true },
      ]
    },
    {
      name: 'Orion Business Hub',
      description: 'State-of-the-art commercial complex on SG Highway, designed for modern businesses. Offering flexible office spaces and retail showrooms with excellent connectivity.',
      location: 'SG Highway',
      address: '55, Corporate Road, SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      status: ProjectStatus.READY_TO_MOVE,
      project_type: ProjectType.COMMERCIAL,
      start_date: new Date('2022-03-01'),
      expected_completion_date: new Date('2024-06-30'),
      rera_number: 'GJRERA2022A00055',
      amenities: {
        "Parking": true,
        "Security": true,
        "Cafeteria": true,
        "24/7 Power Backup": true,
        "High-Speed Elevators": true,
        "Conference Rooms": true,
      },
      images: [
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
      ],
      units: [
        { unit_number: 'OF-201', unit_type: 'Office', floor_number: 2, area_sqft: 1200, carpet_area: 960, built_up_area: 1080, super_built_up_area: 1200, price: 9000000, bedrooms: 0, bathrooms: 1, facing: 'North', status: UnitStatus.AVAILABLE },
        { unit_number: 'OF-202', unit_type: 'Office', floor_number: 2, area_sqft: 1500, carpet_area: 1200, built_up_area: 1350, super_built_up_area: 1500, price: 11000000, bedrooms: 0, bathrooms: 2, facing: 'East', status: UnitStatus.SOLD },
        { unit_number: 'OF-301', unit_type: 'Office', floor_number: 3, area_sqft: 2000, carpet_area: 1600, built_up_area: 1800, super_built_up_area: 2000, price: 15000000, bedrooms: 0, bathrooms: 2, facing: 'South', status: UnitStatus.AVAILABLE },
        { unit_number: 'RT-G01', unit_type: 'Retail', floor_number: 0, area_sqft: 2000, carpet_area: 1600, built_up_area: 1800, super_built_up_area: 2000, price: 25000000, bedrooms: 0, bathrooms: 2, facing: 'Street', status: UnitStatus.AVAILABLE },
        { unit_number: 'RT-G02', unit_type: 'Retail', floor_number: 0, area_sqft: 1500, carpet_area: 1200, built_up_area: 1350, super_built_up_area: 1500, price: 18000000, bedrooms: 0, bathrooms: 1, facing: 'Street', status: UnitStatus.SOLD },
      ]
    },
    {
      name: 'Greenwood Villas',
      description: 'Exclusive gated community of luxurious villas nestled in nature. Experience serene living with modern comforts in Bangalore. Each villa comes with a private garden and premium finishes.',
      location: 'Sarjapur Road',
      address: 'Greenwood County, Sarjapur Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560035',
      status: ProjectStatus.PRE_LAUNCH,
      project_type: ProjectType.VILLA,
      start_date: new Date('2024-06-01'),
      expected_completion_date: new Date('2026-12-31'),
      rera_number: 'KA/RERA/2024/GW001',
      amenities: {
        "Clubhouse": true,
        "Garden/Landscaping": true,
        "Jogging Track": true,
        "Security": true,
        "Swimming Pool": true,
        "Tennis Court": true,
        "Children's Play Area": true,
      },
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      ],
      units: [
        { unit_number: 'V-001', unit_type: '3BHK Villa', floor_number: 0, area_sqft: 2800, carpet_area: 2240, built_up_area: 2520, super_built_up_area: 2800, price: 18000000, bedrooms: 3, bathrooms: 4, facing: 'East', status: UnitStatus.AVAILABLE },
        { unit_number: 'V-002', unit_type: '4BHK Villa', floor_number: 0, area_sqft: 3500, carpet_area: 2800, built_up_area: 3150, super_built_up_area: 3500, price: 25000000, bedrooms: 4, bathrooms: 5, facing: 'North', status: UnitStatus.AVAILABLE },
        { unit_number: 'V-003', unit_type: '4BHK Villa', floor_number: 0, area_sqft: 3500, carpet_area: 2800, built_up_area: 3150, super_built_up_area: 3500, price: 25000000, bedrooms: 4, bathrooms: 5, facing: 'West', status: UnitStatus.BLOCKED },
      ]
    }
  ];

  for (const projectData of projectsToSeed) {
    const { images, units, ...coreProjectData } = projectData;

    // Create Project
    const project = await Project.create({
      ...coreProjectData,
      builder_id: builderUser.id,
      total_units: 0,
      available_units: 0,
      sold_units: 0,
      blocked_units: 0,
      approval_status: '',
      is_active: false,
      featured: false,
      amenities: Object.keys(coreProjectData.amenities).filter(key => (coreProjectData.amenities as any)[key])
    });
    console.log(`✅ Created project: ${project.name} in ${project.city}`);

    // Create Project Images
    if (images && images.length > 0) {
      const imagePayload = images.map((url, index) => ({
        project_id: project.id,
        image_url: url,
        alt_text: `${project.name} - Image ${index + 1}`,
        is_primary: index === 0,
        display_order: index + 1,
        image_type: 'gallery' as const,
      }));
      await ProjectImage.bulkCreate(imagePayload);
      console.log(`   📸 Added ${images.length} images`);
    }

    // Create Project Units
    if (units && units.length > 0) {
      const unitPayload = units.map(unit => ({
        ...unit,
        project_id: project.id,
        price_per_sqft: Math.round(unit.price / unit.area_sqft),
        area_sqm: Math.round(unit.area_sqft * 0.092903), // Convert sqft to sqm
        parking_spaces: unit.bedrooms >= 3 ? 2 : 1,
        balconies: unit.bedrooms >= 2 ? 2 : 1,
        is_corner_unit: (unit as any).is_corner_unit || false,
        has_terrace: (unit as any).has_terrace || false,
      }));
      await ProjectUnit.bulkCreate(unitPayload);
      console.log(`   🏠 Added ${units.length} units`);

      // Update project unit counts
      const total_units = units.length;
      const available_units = units.filter(u => u.status === UnitStatus.AVAILABLE).length;
      const sold_units = units.filter(u => u.status === UnitStatus.SOLD).length;
      const blocked_units = units.filter(u => u.status === UnitStatus.BLOCKED).length;

      await project.update({
        total_units,
        available_units,
        sold_units,
        blocked_units,
      });
      console.log(`   📊 Units: ${total_units} total, ${available_units} available, ${sold_units} sold, ${blocked_units} blocked`);
    }
  }

  console.log(`\n✅ Created ${projectsToSeed.length} builder projects with units and images`);
}

async function seedIndividualProperties(createdUsers: User[]) {
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
      status: PropertyStatus.NEW,
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
      console.log(`✅ Created property: ${property.title} in ${property.city}, ${property.state}`);

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
      console.error(`❌ Error creating property: ${propertyData.title}`, error);
    }
  }

  console.log(`\n✅ Created ${createdCount} individual properties with images`);
}

async function seedInquiries(createdUsers: User[]) {
  try {
    // Get some existing properties and projects to create inquiries for
    const properties = await Property.findAll({ limit: 5 });
    const projects = await Project.findAll({ limit: 3 });

    if (properties.length === 0 && projects.length === 0) {
      console.log('No properties or projects found to create inquiries for');
      return;
    }

    const inquiriesToSeed = [
      // Property inquiries
      ...(properties.length > 0 ? [
        {
          property_id: properties[0]?.id,
          project_id: null,
          inquirer_id: createdUsers[0]?.id, // Buyer
          name: 'Rahul Verma',
          email: 'rahul.verma@example.com',
          phone: '+91-9876543220',
          message: 'I am interested in this property. Could you please share more details about the pricing and availability? Also, I would like to schedule a site visit.',
          status: InquiryStatus.NEW,
        },
        {
          property_id: properties[1]?.id,
          project_id: null,
          inquirer_id: createdUsers[0]?.id, // Buyer
          name: 'Priya Patel',
          email: 'priya.patel@example.com',
          phone: '+91-9876543221',
          message: 'Hi, I saw your property listing and I am very interested. Can we discuss the loan options and possession timeline?',
          status: InquiryStatus.CONTACTED,
        },
        {
          property_id: properties[2]?.id,
          project_id: null,
          inquirer_id: null, // Guest inquiry
          name: 'Amit Sharma',
          email: 'amit.sharma@example.com',
          phone: '+91-9876543222',
          message: 'I am looking for a property in this area for investment purposes. Please share the rental yield and appreciation potential.',
          status: InquiryStatus.NEW,
        },
        {
          property_id: properties[3]?.id,
          project_id: null,
          inquirer_id: createdUsers[0]?.id, // Buyer
          name: 'Sneha Gupta',
          email: 'sneha.gupta@example.com',
          phone: '+91-9876543223',
          message: 'This property looks perfect for my family. Can you arrange a virtual tour? Also, what are the maintenance charges?',
          status: InquiryStatus.CLOSED,
        },
        {
          property_id: properties[4]?.id,
          project_id: null,
          inquirer_id: null, // Guest inquiry
          name: 'Vikram Singh',
          email: 'vikram.singh@example.com',
          phone: '+91-9876543224',
          message: 'I am interested in this commercial property for my business. Please share the lease terms and parking availability.',
          status: InquiryStatus.CONTACTED,
        }
      ] : []),

      // Project inquiries
      ...(projects.length > 0 ? [
        {
          property_id: null,
          project_id: projects[0]?.id,
          inquirer_id: createdUsers[0]?.id, // Buyer
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@example.com',
          phone: '+91-9876543225',
          message: 'I am interested in booking a 3BHK unit in this project. Can you share the floor plans, pricing, and payment schedule?',
          status: InquiryStatus.NEW,
        },
        {
          property_id: null,
          project_id: projects[0]?.id,
          inquirer_id: null, // Guest inquiry
          name: 'Meera Joshi',
          email: 'meera.joshi@example.com',
          phone: '+91-9876543226',
          message: 'What is the current construction status? When can I expect possession? Also, please share details about the amenities.',
          status: InquiryStatus.CONTACTED,
        },
        {
          property_id: null,
          project_id: projects[1]?.id,
          inquirer_id: createdUsers[0]?.id, // Buyer
          name: 'Arjun Reddy',
          email: 'arjun.reddy@example.com',
          phone: '+91-9876543227',
          message: 'I am looking for office space in this commercial project. What are the available sizes and rental rates?',
          status: InquiryStatus.NEW,
        },
        {
          property_id: null,
          project_id: projects[2]?.id,
          inquirer_id: null, // Guest inquiry
          name: 'Kavya Nair',
          email: 'kavya.nair@example.com',
          phone: '+91-9876543228',
          message: 'These villas look amazing! Can I get more information about the villa specifications, garden area, and club facilities?',
          status: InquiryStatus.NEW,
        },
        {
          property_id: null,
          project_id: projects[0]?.id,
          inquirer_id: createdUsers[0]?.id, // Buyer
          name: 'Deepak Agarwal',
          email: 'deepak.agarwal@example.com',
          phone: '+91-9876543229',
          message: 'I visited the site yesterday and I am impressed. Can we discuss the booking process and documentation required?',
          status: InquiryStatus.CONTACTED,
        }
      ] : [])
    ];

    // Filter out inquiries with null property_id or project_id
    const validInquiries = inquiriesToSeed.filter(inquiry =>
      inquiry.property_id !== null || inquiry.project_id !== null
    );

    if (validInquiries.length === 0) {
      console.log('No valid inquiries to create');
      return;
    }

    // Create inquiries
    let createdCount = 0;
    for (const inquiryData of validInquiries) {
      try {
        const inquiry = await Inquiry.create(inquiryData);
        const type = inquiry.property_id ? 'property' : 'project';
        const targetId = inquiry.property_id || inquiry.project_id;
        console.log(`✅ Created ${type} inquiry: ${inquiry.name} for ${type} ID ${targetId}`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error creating inquiry for ${inquiryData.name}:`, error);
      }
    }

    console.log(`\n✅ Created ${createdCount} inquiries (${validInquiries.filter(i => i.property_id).length} property inquiries, ${validInquiries.filter(i => i.project_id).length} project inquiries)`);
  } catch (error) {
    console.error('Error seeding inquiries:', error);
    throw error;
  }
}
