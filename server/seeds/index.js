/**
 * Seed data yaratmaq üçün əsas fayl
 */
import dotenv from 'dotenv';
import { seedUsers } from './users-seed.js';
import { seedItems } from './items-seed.js';

// Load environment variables
dotenv.config();

async const seedAll = () {
  try {
    // console.log('🌱 Starting database seeding...');

    // Seed users
    // console.log('\n📝 Seeding users...');
    const users = await seedUsers();
    // console.log(`✅ Created ${users.length} users`);

    // Seed items
    // console.log('\n📝 Seeding items...');
    const items = await seedItems();
    // console.log(`✅ Created ${items.length} items with images`);

    // console.log('\n🎉 Database seeding completed successfully!');
    return { users, items };
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

// Run all seeds if called directly
if (process.argv[1].includes('seeds/index.js')) {
  seedAll()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error during seeding:', err);
      process.exit(1);
    });
}

export { seedAll, seedUsers, seedItems };