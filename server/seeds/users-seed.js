/**
 * Test istifadəçiləri yaratmaq üçün seed script
 */
import { createDbConnection } from '../db.js';
import { users } from '../../shared/schema.js';
import { authService } from '../auth.js';

// Verilənlər bazasına bağlantı
let db;

export async const seedUsers = () {
  // console.log('>> Seeding users...');

  // Initialize database connection if not already initialized
  if (!db) {
    db = await createDbConnection();
  }

  // Check if users already exist
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    // console.log(`>> ${existingUsers.length} users already exist, skipping seed`);
    return existingUsers;
  }

  // Create test password hash
  const password = await authService.hashPassword('password123');

  // Sample user data
  const userData = [
    {
      username: 'admin',
      password,
      fullName: 'Admin User',
      email: 'admin@nextbarter.az',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      bio: 'NextBarter admin və təsisçisi',
      phone: '+994501234567',
      city: 'Bakı',
      rating: 5,
      ratingCount: 28,
      role: 'admin',
      active: true
    },
    {
      username: 'elshad_m',
      password,
      fullName: 'Elşad Məmmədov',
      email: 'elshad@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      bio: 'Elektronika həvəskarı və mühəndis',
      phone: '+994551234567',
      city: 'Bakı',
      rating: 4,
      ratingCount: 15,
      role: 'user',
      active: true
    },
    {
      username: 'aysel_h',
      password,
      fullName: 'Aysel Hüseynova',
      email: 'aysel@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
      bio: 'Kitab həvəskarı',
      phone: '+994701234567',
      city: 'Sumqayıt',
      rating: 5,
      ratingCount: 12,
      role: 'user',
      active: true
    },
    {
      username: 'nicat85',
      password,
      fullName: 'Nicat Əliyev',
      email: 'nicat@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/35.jpg',
      bio: 'İdman və sağlam həyat tərzi',
      phone: '+994551234568',
      city: 'Gəncə',
      rating: 3,
      ratingCount: 5,
      role: 'user',
      active: true
    },
    {
      username: 'leyla_r',
      password,
      fullName: 'Leyla Rəhimli',
      email: 'leyla@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
      bio: 'Sənətkar və dizayner',
      phone: '+994701234569',
      city: 'Bakı',
      rating: 5,
      ratingCount: 18,
      role: 'user',
      active: true
    }
  ];

  // Insert users
  const createdUsers = [];
  for (const user of userData) {
    const [createdUser] = await db.insert(users).values(user).returning();
    createdUsers.push(createdUser);
    // console.log(`>> Created user: ${user.username}`);
  }

  // console.log(`>> Successfully created ${createdUsers.length} users`);
  return createdUsers;
}

// Run directly if needed
if (process.argv[1].includes('users-seed.js')) {
  seedUsers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error seeding users:', err);
      process.exit(1);
    });
}