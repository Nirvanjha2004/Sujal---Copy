import { User, UserRole } from '../../models/User';

export async function seedUsers() {
  const usersData = [
    // Buyers (5 users)
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
    {
      email: 'buyer3@example.com',
      password_hash: 'buyer123',
      first_name: 'Arjun',
      last_name: 'Mehta',
      role: UserRole.BUYER,
      phone: '+91-9876543220',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'buyer4@example.com',
      password_hash: 'buyer123',
      first_name: 'Sneha',
      last_name: 'Reddy',
      role: UserRole.BUYER,
      phone: '+91-9876543221',
      is_verified: false,
      is_active: true,
    },
    {
      email: 'buyer5@example.com',
      password_hash: 'buyer123',
      first_name: 'Karan',
      last_name: 'Malhotra',
      role: UserRole.BUYER,
      phone: '+91-9876543222',
      is_verified: true,
      is_active: true,
    },

    // Property Owners (5 users)
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
    {
      email: 'owner3@example.com',
      password_hash: 'owner123',
      first_name: 'Ramesh',
      last_name: 'Iyer',
      role: UserRole.OWNER,
      phone: '+91-9876543223',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'owner4@example.com',
      password_hash: 'owner123',
      first_name: 'Kavita',
      last_name: 'Desai',
      role: UserRole.OWNER,
      phone: '+91-9876543224',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'owner5@example.com',
      password_hash: 'owner123',
      first_name: 'Suresh',
      last_name: 'Nair',
      role: UserRole.OWNER,
      phone: '+91-9876543225',
      is_verified: true,
      is_active: true,
    },

    // Real Estate Agents (4 users)
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
    {
      email: 'agent3@example.com',
      password_hash: 'agent123',
      first_name: 'Rohit',
      last_name: 'Kapoor',
      role: UserRole.AGENT,
      phone: '+91-9876543226',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'agent4@example.com',
      password_hash: 'agent123',
      first_name: 'Anjali',
      last_name: 'Verma',
      role: UserRole.AGENT,
      phone: '+91-9876543227',
      is_verified: true,
      is_active: true,
    },

    // Builders/Developers (5 users)
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
    {
      email: 'builder4@example.com',
      password_hash: 'builder123',
      first_name: 'Lodha',
      last_name: 'Builders',
      role: UserRole.BUILDER,
      phone: '+91-9876543228',
      is_verified: true,
      is_active: true,
    },
    {
      email: 'builder5@example.com',
      password_hash: 'builder123',
      first_name: 'Sobha',
      last_name: 'Limited',
      role: UserRole.BUILDER,
      phone: '+91-9876543229',
      is_verified: true,
      is_active: true,
    },

    // System Admin (2 users)
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
    {
      email: 'admin2@example.com',
      password_hash: 'admin123',
      first_name: 'Support',
      last_name: 'Admin',
      role: UserRole.ADMIN,
      phone: '+91-9876543230',
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
