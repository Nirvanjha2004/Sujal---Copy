import { seedUsers } from './seeds/seedUsers';
import { seedIndividualProperties } from './seeds/seedIndividualProperties';
import { seedProjects } from './seeds/seedProjects';
import { seedUserInteractions } from './seeds/seedUserInteractions';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Project } from '../models/Project';
import { ProjectUnit } from '../models/ProjectUnit';
import { UserFavorite } from '../models/UserFavorite';
import { SavedSearch } from '../models/SavedSearch';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n');

    // Step 1: Seed Users
    console.log('📝 Seeding users...');
    const users = await seedUsers();
    console.log(`✅ Created ${users.length} users\n`);

    // Step 2: Seed Individual Properties
    console.log('🏠 Seeding individual properties...');
    await seedIndividualProperties(users);
    console.log('✅ Individual properties seeded\n');

    // Step 3: Seed Projects
    console.log('🏗️ Seeding projects...');
    await seedProjects(users);
    console.log('✅ Projects seeded\n');

    // Step 5: Seed User Interactions
    console.log('❤️ Seeding user interactions...');
    await seedUserInteractions(users);
    console.log('✅ User interactions seeded\n');

    console.log('\n🎉 Database seeding completed successfully!');
    
    // Print summary
    await printSeedingSummary();

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function printSeedingSummary() {
  try {
    const userCount = await User.count();
    const propertyCount = await Property.count();
    const projectCount = await Project.count();
    const projectUnitCount = await ProjectUnit.count();
    const favoriteCount = await UserFavorite.count();
    const savedSearchCount = await SavedSearch.count();

    console.log('\n📊 SEEDING SUMMARY:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏠 Properties: ${propertyCount}`);
    console.log(`🏗️ Projects: ${projectCount}`);
    console.log(`🏢 Project Units: ${projectUnitCount}`);
    console.log(`❤️ User Favorites: ${favoriteCount}`);
    console.log(`🔍 Saved Searches: ${savedSearchCount}`);
  } catch (error) {
    console.error('❌ Error printing summary:', error);
  }
}
