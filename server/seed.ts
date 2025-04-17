import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage.js';
import bcrypt from 'bcrypt';

// Sample items data for seeding
const sampleItems = [
  {
    title: 'iPhone 12 Pro',
    description: 'Mükəmməl vəziyyətdə, az işlənmiş iPhone 12 Pro. 128GB yaddaş, göy rəngdə.',
    category: 'electronics',
    condition: 'good',
    city: 'Bakı',
    location: 'Yasamal',
    coordinates: JSON.stringify({ lat: 40.3853, lng: 49.8556 })
  },
  {
    title: 'IKEA masası',
    description: 'İşlənmiş vəziyyətdə IKEA masası. Ölçüləri: 120x60 sm.',
    category: 'furniture',
    condition: 'used',
    city: 'Bakı',
    location: 'Nərimanov',
    coordinates: JSON.stringify({ lat: 40.4053, lng: 49.8656 })
  },
  {
    title: 'Sony PlayStation 5',
    description: 'Yeni PlayStation 5, istifadə olunmayıb, qutuda. 2 pultu var.',
    category: 'electronics',
    condition: 'new',
    city: 'Gəncə',
    location: 'Mərkəz',
    coordinates: JSON.stringify({ lat: 40.6828, lng: 46.3606 })
  },
  {
    title: 'Velosiped - Trek',
    description: 'Trek velosipedi, yaxşı vəziyyətdə. Ölçüsü M, 27.5 təkər.',
    category: 'sports',
    condition: 'good',
    city: 'Bakı',
    location: 'Xətai',
    coordinates: JSON.stringify({ lat: 40.3778, lng: 49.8665 })
  },
  {
    title: 'Kitab kolleksiyası',
    description: 'Müxtəlif janrlarda 50-yə yaxın kitab. Detektiv, roman və tarix kitabları üstünlük təşkil edir.',
    category: 'books',
    condition: 'good',
    city: 'Sumqayıt',
    location: 'Mərkəz',
    coordinates: JSON.stringify({ lat: 40.5892, lng: 49.6393 })
  },
  {
    title: 'Samsung 4K TV',
    description: '55 düym Samsung Smart TV, 4K keyfiyyət. 2 ildir istifadədədir, heç bir problemi yoxdur.',
    category: 'electronics',
    condition: 'good',
    city: 'Bakı',
    location: 'Binəqədi',
    coordinates: JSON.stringify({ lat: 40.4468, lng: 49.8352 })
  },
  {
    title: 'Qış təkərləri',
    description: '4 ədəd qış təkəri Michelin, 205/55 R16 ölçüdə. 1 mövsüm istifadə olunub.',
    category: 'automotive',
    condition: 'good',
    city: 'Bakı',
    location: 'Sabunçu',
    coordinates: JSON.stringify({ lat: 40.4392, lng: 49.9321 })
  },
  {
    title: 'Uşaq çarpayısı',
    description: 'Taxta uşaq çarpayısı, yataq dəsti ilə birlikdə. 3 yaşa qədər istifadə üçün.',
    category: 'baby',
    condition: 'good',
    city: 'Bakı',
    location: 'Nəsimi',
    coordinates: JSON.stringify({ lat: 40.3778, lng: 49.8327 })
  },
  {
    title: 'Apple MacBook Pro 2021',
    description: 'M1 Pro çipli MacBook Pro, 16GB RAM, 512GB SSD. Qutusu və adaptoru var.',
    category: 'electronics',
    condition: 'new',
    city: 'Bakı',
    location: 'Nərimanov',
    coordinates: JSON.stringify({ lat: 40.4053, lng: 49.8556 })
  },
  {
    title: 'Klassik gitara',
    description: 'Yamaha C40 klassik gitara, çexolu ilə birlikdə. Yaxşı vəziyyətdə.',
    category: 'music',
    condition: 'good',
    city: 'Bakı',
    location: 'Səbail',
    coordinates: JSON.stringify({ lat: 40.3661, lng: 49.8372 })
  }
];

// Sample users
const sampleUsers = [
  {
    username: 'testuser',
    password: bcrypt.hashSync('password', 10),
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '+994501234567',
    role: 'user',
    active: true
  },
  {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    email: 'admin@example.com',
    fullName: 'Admin User',
    phone: '+994502345678',
    role: 'admin',
    active: true
  }
];

const createTestUser = async () => {
  try {
    let testUser = await storage.getUserByUsername('testuser');

    if (!testUser) {
      console.log('Creating test user...');
      testUser = await storage.createUser({
        username: 'testuser',
        password: bcrypt.hashSync('password', 10),
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+994501234567',
        role: 'user',
        active: true
      });
      console.log('Test user created:', testUser);
    } else {
      console.log('Test user already exists.');
    }

    return testUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // First create users
    for (const userData of sampleUsers) {
      try {
        const existingUser = await storage.getUserByUsername(userData.username);

        if (!existingUser) {
          const user = await storage.createUser(userData);
          console.log(`Created user: ${user.username}`);
        } else {
          console.log(`User ${userData.username} already exists.`);
        }
      } catch (error) {
        console.error(`Error creating user ${userData.username}:`, error);
      }
    }

    // Get test user for items
    const testUser = await storage.getUserByUsername('testuser');

    if (!testUser) {
      console.error('Test user not found. Cannot create items.');
      return;
    }

    // Then create items for test user
    for (const itemData of sampleItems) {
      try {
        const item = await storage.createItem({
          ...itemData,
          userId: testUser.id,
          status: 'active'
        });

        console.log(`Created item: ${item.title}`);
      } catch (error) {
        console.error(`Error creating item ${itemData.title}:`, error);
      }
    }

    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run seed function if this file is executed directly
if (process.argv[1] === __filename) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}