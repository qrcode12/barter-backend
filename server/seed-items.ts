// Seed file to create example items in the database
import { storage } from './storage.js';

// Sample data for item categories and conditions
const categories = [
  'Elektronika', 'Geyim', 'Kitablar', 'Mebel', 'İdman', 'Oyuncaqlar', 'Kompüter', 
  'Nəqliyyat', 'Kolleksiya', 'Ev və bağ', 'Təhsil', 'Hobbi', 'Musiqi', 'Aksesuar'
];

const conditions = ['Yeni', 'Əla', 'Yaxşı', 'Kafi'];

const cities = ['Bakı', 'Gəncə', 'Sumqayıt', 'Mingəçevir', 'Lənkəran', 'Şəki', 'Quba'];

const sampleImages = [
  'https://i.imgur.com/ZC0BrYd.jpg', // Electronics
  'https://i.imgur.com/jNPcWOj.jpg', // Clothing
  'https://i.imgur.com/HpbB7aE.jpg', // Books
  'https://i.imgur.com/SvQ7sN2.jpg', // Furniture
  'https://i.imgur.com/QxMZRVJ.jpg', // Sports
  'https://i.imgur.com/zKxKYP9.jpg', // Toys
  'https://i.imgur.com/T7rA6sX.jpg', // Computer
  'https://i.imgur.com/6REUlIl.jpg', // Transport
  'https://i.imgur.com/EnGK2jC.jpg', // Collection
  'https://i.imgur.com/c7EIDVL.jpg'  // Home and garden
];

// Sample titles for each category
const titlesByCat: Record<string, string[]> = {
  'Elektronika': [
    'Samsung Galaxy S22 Ultra Telefon', 
    'Apple iPhone 14 Pro 256GB', 
    'Xiaomi Mi Band 6 Fitness Tracker',
    'Sony WH-1000XM4 Qulaqlıq',
    'JBL Bluetooth Səs Ucaldıcı',
    'Canon EOS 850D Fotoaparat',
    'DJI Mini 3 Pro Drone'
  ],
  'Geyim': [
    'Adidas Orijinal İdman Kostyumu',
    'Nike Air Max Ayaqqabı',
    'Zara Kişi Pencəyi',
    'H&M Qış Gödəkçəsi',
    'Mango Qadın Paltarı',
    'Levi\'s Blue Jeans',
    'Gucci Əl Çantası'
  ],
  'Kitablar': [
    '1984 - George Orwell',
    'Harry Potter Seriyası',
    'Xarici Dil Dərslikləri',
    'Proqramlaşdırma Kitabları',
    'Psixologiya və Şəxsi İnkişaf',
    'Klassik Ədəbiyyat Kolleksiyası',
    'Azərbaycan Tarixi Üzrə Kitablar'
  ],
  'Mebel': [
    'IKEA Oturma Dəsti',
    'Yataq və Döşək',
    'İş Masası və Stul',
    'Yemək Masası Dəsti',
    'Kitab Rəfi',
    'Divan və Kreslo',
    'Uşaq Otağı Mebeli'
  ]
};

// Default descriptions 
const defaultDescriptions = [
  'Əla vəziyyətdə, az istifadə olunub.',
  'Yaxşı qiymətə satılır, real alıcılar yazsın.',
  'Sərfəli qiymətə, başqa əşyalarla dəyişdirmək mümkündür.',
  'Sənədləri və qutusu let, əlavə aksesuar verilir.',
  'Əlaqə nömrəsi: +994 55 555 55 55, axşam saatlarında zəng edin.',
  'Barter təklifi: telefon/noutbuk ilə dəyişərəm.',
  'Razılaşma yolu ilə qiymətdə endirim olunur.',
  'Təcili satılır, qiyməti sərfəlidir.',
  'Sifariş əsasında, rəng seçimi mümkündür.',
  'Şəkildəki kimi, əla vəziyyətdə.'
];

// Function to create a random date within the last 30 days
const randomDate = () => {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
  return pastDate;
}

// Function to create random items
const createRandomItems = async (count: number) => {
  try {
    // Get all users to assign items to
    const users = await storage.getAllUsers('');

    if (users.length === 0) {
      console.error('No users found. Please create users first.');
      return;
    }

    // console.log(`Creating ${count} random items...`);

    for (let i = 0; i < count; i++) {
      // Select random user, category, condition, and city
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];

      // Select a title for this category
      const categoryTitles = titlesByCat[randomCategory] || titlesByCat['Elektronika'];
      const randomTitle = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];

      // Select a description
      const randomDescription = defaultDescriptions[Math.floor(Math.random() * defaultDescriptions.length)];

      // Create item
      const item = await storage.createItem({
        userId: randomUser.id,
        title: randomTitle,
        description: randomDescription,
        category: randomCategory,
        condition: randomCondition,
        city: randomCity,
        status: 'active'
      });

      // console.log(`Created item ${i+1}/${count}: ${item.title} (ID: ${item.id})`);

      // Add a random image
      const randomImageIndex = Math.floor(Math.random() * sampleImages.length);
      await storage.createImage({
        itemId: item.id,
        filePath: sampleImages[randomImageIndex],
        isMain: true
      });

      // Add a slight delay
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // console.log('Done creating items.');
  } catch (error) {
    console.error('Error creating items:', error);
  }
}

// Create 30 items
createRandomItems(30).then(() => {
  // console.log('Seed script completed.');
}).catch(err => {
  console.error('Seed script failed:', err);
});