import { connectDatabase } from '../config/database';
import { seedProperties } from '../utils/seedProperties';

async function runSeed() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('Database connected successfully');

    console.log('\nSeeding properties...');
    await seedProperties();

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
