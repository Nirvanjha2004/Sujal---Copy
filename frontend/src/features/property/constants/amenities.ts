// Comprehensive amenities configuration
export const AMENITY_CATEGORIES = {
  basic: {
    label: 'Basic Amenities',
    icon: 'solar:home-bold',
    amenities: [
      'Parking',
      'Security',
      'Elevator',
      'Power Backup',
      'Water Supply',
      'Internet/Wi-Fi'
    ]
  },
  recreational: {
    label: 'Recreational',
    icon: 'solar:gameboy-bold',
    amenities: [
      'Swimming Pool',
      'Gym/Fitness Center',
      'Club House',
      'Children Play Area',
      'Jogging Track',
      'Tennis Court',
      'Basketball Court',
      'Badminton Court',
      'Yoga/Meditation Area',
      'Indoor Games Room'
    ]
  },
  wellness: {
    label: 'Health & Wellness',
    icon: 'solar:heart-bold',
    amenities: [
      'Spa',
      'Sauna',
      'Jacuzzi',
      'Steam Room',
      'Massage Room',
      'Pharmacy',
      'Medical Center',
      'Physiotherapy Center'
    ]
  },
  convenience: {
    label: 'Convenience',
    icon: 'solar:shop-bold',
    amenities: [
      'Shopping Center',
      'Supermarket',
      'ATM',
      'Bank Branch',
      'Post Office',
      'Laundry Service',
      'Housekeeping',
      'Concierge Service',
      'Valet Parking'
    ]
  },
  outdoor: {
    label: 'Outdoor Spaces',
    icon: 'solar:leaf-bold',
    amenities: [
      'Garden/Landscaping',
      'Terrace Garden',
      'Rooftop Area',
      'Barbecue Area',
      'Outdoor Seating',
      'Walking Trails',
      'Cycling Track',
      'Pet Park',
      'Amphitheater'
    ]
  },
  business: {
    label: 'Business & Work',
    icon: 'solar:case-bold',
    amenities: [
      'Business Center',
      'Conference Room',
      'Co-working Space',
      'Library',
      'Study Room',
      'Meeting Rooms',
      'Video Conferencing',
      'Printing Services'
    ]
  },
  entertainment: {
    label: 'Entertainment',
    icon: 'solar:tv-bold',
    amenities: [
      'Movie Theater',
      'Party Hall',
      'Banquet Hall',
      'Music Room',
      'Dance Studio',
      'Gaming Zone',
      'Billiards Room',
      'Karaoke Room'
    ]
  },
  safety: {
    label: 'Safety & Security',
    icon: 'solar:shield-bold',
    amenities: [
      '24/7 Security',
      'CCTV Surveillance',
      'Intercom System',
      'Video Door Phone',
      'Access Control',
      'Fire Safety',
      'Smoke Detectors',
      'Emergency Exit',
      'Security Patrol'
    ]
  },
  transport: {
    label: 'Transportation',
    icon: 'solar:bus-bold',
    amenities: [
      'Metro Station Nearby',
      'Bus Stop Nearby',
      'Taxi Stand',
      'Airport Connectivity',
      'Railway Station Nearby',
      'Shuttle Service',
      'Car Rental',
      'Bike Rental'
    ]
  },
  education: {
    label: 'Education & Healthcare',
    icon: 'solar:book-bold',
    amenities: [
      'School Nearby',
      'College Nearby',
      'Hospital Nearby',
      'Clinic Nearby',
      'Daycare Center',
      'Coaching Center',
      'Skill Development Center'
    ]
  }
};

// Flat list of all amenities with metadata
export const AMENITIES_CONFIG: Record<string, {
  label: string;
  category: keyof typeof AMENITY_CATEGORIES;
  icon: string;
  description: string;
  premium: boolean;
  searchKeywords: string[];
}> = {
  // Basic Amenities
  'parking': {
    label: 'Parking',
    category: 'basic',
    icon: 'solar:car-bold',
    description: 'Dedicated parking space for vehicles',
    premium: false,
    searchKeywords: ['parking', 'car', 'vehicle', 'garage']
  },
  'security': {
    label: '24/7 Security',
    category: 'safety',
    icon: 'solar:shield-bold',
    description: 'Round-the-clock security services',
    premium: false,
    searchKeywords: ['security', 'guard', 'safety', 'protection']
  },
  'elevator': {
    label: 'Elevator',
    category: 'basic',
    icon: 'solar:lift-bold',
    description: 'Elevator access to all floors',
    premium: false,
    searchKeywords: ['elevator', 'lift', 'vertical transport']
  },
  'power_backup': {
    label: 'Power Backup',
    category: 'basic',
    icon: 'solar:battery-bold',
    description: 'Backup power supply during outages',
    premium: false,
    searchKeywords: ['power backup', 'generator', 'ups', 'electricity']
  },
  'water_supply': {
    label: '24/7 Water Supply',
    category: 'basic',
    icon: 'solar:water-bold',
    description: 'Continuous water supply',
    premium: false,
    searchKeywords: ['water supply', 'water', 'plumbing']
  },
  'internet': {
    label: 'Internet/Wi-Fi',
    category: 'basic',
    icon: 'solar:wifi-bold',
    description: 'High-speed internet connectivity',
    premium: false,
    searchKeywords: ['internet', 'wifi', 'broadband', 'connectivity']
  },

  // Recreational Amenities
  'swimming_pool': {
    label: 'Swimming Pool',
    category: 'recreational',
    icon: 'solar:swimming-bold',
    description: 'Swimming pool facility',
    premium: true,
    searchKeywords: ['swimming pool', 'pool', 'swimming', 'water sports']
  },
  'gym': {
    label: 'Gym/Fitness Center',
    category: 'recreational',
    icon: 'solar:dumbbell-bold',
    description: 'Fully equipped fitness center',
    premium: true,
    searchKeywords: ['gym', 'fitness', 'workout', 'exercise', 'health']
  },
  'club_house': {
    label: 'Club House',
    category: 'recreational',
    icon: 'solar:buildings-2-bold',
    description: 'Community club house for events',
    premium: true,
    searchKeywords: ['club house', 'community center', 'events', 'social']
  },
  'playground': {
    label: 'Children Play Area',
    category: 'recreational',
    icon: 'solar:playground-bold',
    description: 'Safe play area for children',
    premium: false,
    searchKeywords: ['playground', 'children', 'kids', 'play area']
  },
  'jogging_track': {
    label: 'Jogging Track',
    category: 'recreational',
    icon: 'solar:running-bold',
    description: 'Dedicated jogging and walking track',
    premium: true,
    searchKeywords: ['jogging track', 'running', 'walking', 'fitness']
  },

  // Outdoor Spaces
  'garden': {
    label: 'Garden/Landscaping',
    category: 'outdoor',
    icon: 'solar:leaf-bold',
    description: 'Beautiful landscaped gardens',
    premium: false,
    searchKeywords: ['garden', 'landscaping', 'greenery', 'plants']
  },
  'balcony': {
    label: 'Balcony',
    category: 'outdoor',
    icon: 'solar:home-2-bold',
    description: 'Private balcony space',
    premium: false,
    searchKeywords: ['balcony', 'terrace', 'outdoor space']
  },

  // Wellness
  'spa': {
    label: 'Spa',
    category: 'wellness',
    icon: 'solar:spa-bold',
    description: 'Spa and wellness center',
    premium: true,
    searchKeywords: ['spa', 'wellness', 'relaxation', 'massage']
  },
  'sauna': {
    label: 'Sauna',
    category: 'wellness',
    icon: 'solar:fire-bold',
    description: 'Sauna facility for relaxation',
    premium: true,
    searchKeywords: ['sauna', 'steam', 'wellness', 'relaxation']
  },

  // Business
  'conference_room': {
    label: 'Conference Room',
    category: 'business',
    icon: 'solar:presentation-bold',
    description: 'Professional meeting spaces',
    premium: true,
    searchKeywords: ['conference room', 'meeting', 'business', 'work']
  },
  'library': {
    label: 'Library',
    category: 'business',
    icon: 'solar:book-bold',
    description: 'Quiet study and reading space',
    premium: true,
    searchKeywords: ['library', 'books', 'study', 'reading']
  },

  // Convenience
  'shopping_center': {
    label: 'Shopping Center',
    category: 'convenience',
    icon: 'solar:shop-bold',
    description: 'On-site shopping facilities',
    premium: true,
    searchKeywords: ['shopping center', 'mall', 'retail', 'stores']
  },
  'cafeteria': {
    label: 'Cafeteria',
    category: 'convenience',
    icon: 'solar:cup-bold',
    description: 'Food and beverage services',
    premium: false,
    searchKeywords: ['cafeteria', 'restaurant', 'food', 'dining']
  },

  // Transportation
  'metro_station': {
    label: 'Metro Station Nearby',
    category: 'transport',
    icon: 'solar:train-bold',
    description: 'Close proximity to metro station',
    premium: false,
    searchKeywords: ['metro', 'subway', 'train', 'public transport']
  },
  'bus_stop': {
    label: 'Bus Stop Nearby',
    category: 'transport',
    icon: 'solar:bus-bold',
    description: 'Convenient bus connectivity',
    premium: false,
    searchKeywords: ['bus stop', 'bus', 'public transport', 'connectivity']
  },

  // Education & Healthcare
  'school_nearby': {
    label: 'School Nearby',
    category: 'education',
    icon: 'solar:school-bold',
    description: 'Educational institutions nearby',
    premium: false,
    searchKeywords: ['school', 'education', 'learning', 'children']
  },
  'hospital_nearby': {
    label: 'Hospital Nearby',
    category: 'education',
    icon: 'solar:hospital-bold',
    description: 'Healthcare facilities nearby',
    premium: false,
    searchKeywords: ['hospital', 'healthcare', 'medical', 'clinic']
  }
};

// Amenity importance levels for different property types
export const AMENITY_IMPORTANCE_BY_TYPE = {
  apartment: {
    essential: ['parking', 'security', 'elevator', 'power_backup'],
    important: ['gym', 'swimming_pool', 'playground'],
    nice_to_have: ['spa', 'club_house', 'conference_room']
  },
  house: {
    essential: ['parking', 'security', 'garden'],
    important: ['power_backup', 'water_supply'],
    nice_to_have: ['swimming_pool', 'gym']
  },
  villa: {
    essential: ['parking', 'security', 'garden', 'swimming_pool'],
    important: ['gym', 'spa', 'club_house'],
    nice_to_have: ['tennis_court', 'home_theater']
  },
  commercial: {
    essential: ['parking', 'security', 'elevator', 'power_backup'],
    important: ['conference_room', 'internet', 'cafeteria'],
    nice_to_have: ['gym', 'library']
  },
  plot: {
    essential: ['road_access', 'electricity_connection'],
    important: ['water_connection', 'drainage'],
    nice_to_have: ['street_lights', 'security']
  },
  land: {
    essential: ['road_access', 'water_source'],
    important: ['electricity_connection', 'soil_quality'],
    nice_to_have: ['irrigation', 'fencing']
  }
};

// Amenity search filters
export const AMENITY_FILTERS = {
  popular: ['parking', 'security', 'gym', 'swimming_pool', 'garden'],
  luxury: ['spa', 'sauna', 'club_house', 'tennis_court', 'home_theater'],
  family: ['playground', 'school_nearby', 'hospital_nearby', 'garden'],
  business: ['conference_room', 'library', 'internet', 'parking'],
  fitness: ['gym', 'swimming_pool', 'jogging_track', 'yoga_area'],
  convenience: ['shopping_center', 'metro_station', 'bus_stop', 'atm']
};