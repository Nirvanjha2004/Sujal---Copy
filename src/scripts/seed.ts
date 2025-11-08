import { connectDatabase } from '../config/database';
import { seedDatabase } from '../utils/seed';


async function runSeed() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('Database connected successfully');

    console.log('\nSeeding properties...');
    await seedDatabase();

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
