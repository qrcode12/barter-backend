/**
 * Test elanları yaratmaq üçün seed script
 */
import { createDbConnection } from '../db.js';
import { items, images } from '../../shared/schema.js';
import { seedUsers } from './users-seed.js';

// Verilənlər bazasına bağlantı
let db;

// Condition constants
const CONDITIONS = ['Yeni', 'Əla', 'Yaxşı', 'Normal', 'İşlənmiş'];
// Status constants
const STATUSES = ['active', 'pending', 'sold', 'expired'];
// Azerbaijan cities
const CITIES = ['Bakı', 'Sumqayıt', 'Gəncə', 'Mingəçevir', 'Şəki', 'Quba', 'Lənkəran', 'Şirvan'];

// Sample image URLs by category
const IMAGES_BY_CATEGORY = {
  'Elektronika': [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format',
    'https://images.unsplash.com/photo-1598327105854-2b779d93607c?w=600&auto=format',
    'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=600&auto=format',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format'
  ],
  'Geyim': [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format',
    'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&auto=format',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format'
  ],
  'Kitablar': [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&auto=format',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format'
  ],
  'Ev və bağ': [
    'https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=600&auto=format',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format',
    'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=600&auto=format'
  ],
  'İdman': [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format',
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format',
    'https://images.unsplash.com/photo-1515775538093-d2d95c5ee4f5?w=600&auto=format'
  ],
  'Oyuncaqlar': [
    'https://images.unsplash.com/photo-1584822764032-67d6da0c0444?w=600&auto=format',
    'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=600&auto=format',
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format'
  ],
  'Nəqliyyat': [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format',
    'https://images.unsplash.com/photo-1581497396202-5645e76a3a8e?w=600&auto=format' 
  ],
  'Kolleksiya': [
    'https://images.unsplash.com/photo-1581330672578-6e392ee4c99e?w=600&auto=format',
    'https://images.unsplash.com/photo-1593467686384-c56d1ffe8953?w=600&auto=format',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format'
  ],
  'Digər': [
    'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format',
    'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&auto=format',
    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format'
  ]
};

// Sample item titles by category
const TITLES_BY_CATEGORY = {
  'Elektronika': [
    'Apple iPhone 12 Pro - 128GB',
    'Samsung Galaxy S21 - Əla vəziyyətdə',
    'Sony PlayStation 5 - Yeni',
    'Apple MacBook Pro 2022',
    'JBL Bluetooth səs ucaldıcı',
    'Xiaomi Mi Robot Vacuum',
    'Nintendo Switch Konsol - Az istifadə olunub',
    'Canon EOS R7 kamera dəsti',
    'Dell XPS 15 noutbuku',
    'Huawei MatePad Pro 12.6'
  ],
  'Geyim': [
    'Nike Air Force 1 - Orijinal 42 ölçü',
    'Zara kişi cemperi - Yeni (L)',
    'Adidas idman forması',
    'Qadın dəri gödəkçəsi',
    'Tommy Hilfiger kişi köynəyi',
    'Gucci kəmər - Orijinal',
    'Qış ayaqqabıları - 39 ölçü',
    'H&M yaz kolleksiyası dəsti',
    'Calvin Klein cins şalvar',
    'The North Face qış gödəkçəsi'
  ],
  'Kitablar': [
    'Harry Potter kolleksiyası - 7 kitab dəsti',
    'Azərbaycan ədəbiyyatı toplusu',
    'İngilis dili öyrənmək üçün kitablar',
    'Game of Thrones - bütün seriya',
    'Psixologiya kitabları dəsti',
    'Biznesi necə qurmalı - Seth Godin',
    'Məntiq və fəlsəfə kitabları',
    'Tarix və geostrategiya',
    'Dünya klassik ədəbiyyatı seçilmişlər',
    'Uşaq nağılları - böyük format'
  ],
  'Ev və bağ': [
    'IKEA yemək masası dəsti (6 nəfərlik)',
    'Yeni mətbəx dəsti - istifadə olunmayıb',
    'Bağ əşyaları dəsti',
    'Müasir divar saatı',
    'BOSCH qabyuyan maşın - az istifadə olunub',
    'Yataq dəsti - IKEA (Tək)',
    'Mətbəx qab-qacaq kolleksiyası',
    'Bağ üçün su nasosları',
    'Yumşaq künc divan',
    'LED daxili işıqlandırma dəsti'
  ],
  'İdman': [
    'Adidas idman dəsti - M ölçü',
    'Ağırlıq dəsti 100kg',
    'Cardio velosiped - Kettler',
    'Profisional tennis raketkası',
    'Futbol topları dəsti',
    'İdman ətirləri kolleksiyası',
    'Yoga lələkləri və aksesuarları',
    'Qış idmanı - snoubord',
    'Profesional boks əlcəkləri',
    'Nike basketbol ayaqqabıları - 44'
  ],
  'Oyuncaqlar': [
    'LEGO Technic Porsche 911',
    'Müxtəlif plüş oyuncaqlar',
    'Nintendo Switch ilə oyunlar',
    'Uşaq elektromobili',
    'RC helikopter və dron dəsti',
    'Barbie ev kolleksiyası',
    'Əyləncəli stolüstü oyunlar',
    'Hot Wheels maşın kolleksiyası',
    'İnteraktiv öyrənmə oyuncaqları',
    'Qış əyləncəsi - plastik xizək'
  ],
  'Nəqliyyat': [
    'Mercedes-Benz E-Class 2017',
    'Toyota Prius hibrid - az yanacaq sərfi',
    'Honda CBR motosikl - əla vəziyyətdə',
    'Elektrikli Scooter - Xiaomi',
    'Dağ velosipedi - profesional',
    'Land Rover Discovery - yeni təkərlər',
    'Avtomobil aksessuarları dəsti',
    'Ford Focus 2019 - Tam avtomat',
    'BMW X5 - az sürülmüş',
    'Elektrik velosiped - Qənaətcil'
  ],
  'Kolleksiya': [
    'Qədim sikkələr kolleksiyası',
    'Pul vahidləri toplusu',
    'Azərbaycan poçt markaları',
    'Vintage saatlar kolleksiyası',
    'Keçmiş SSRİ məhsulları',
    'Antik kitablar toplusu',
    'Futbol klub imzalı köynəklər',
    'Nadir vinyl vallar kolleksiyası',
    'İmzalı idman əşyaları',
    'Vintage filmli kamera kolleksiyası'
  ],
  'Digər': [
    'Rəsm alətləri dəsti',
    'Musiqi alətləri toplusu',
    'El işi əl çantaları',
    'Smart ev cihazları',
    'Fərdi inkişaf məhsulları',
    'Təbii bəzək əşyaları',
    'İncəsənət əşyaları',
    'Dərslər və vəsaitlər',
    'Nadir sənət əsərləri',
    'Ustalıq avadanlığı'
  ]
};

// Sample descriptions by category
const DESCRIPTIONS_BY_CATEGORY = {
  'Elektronika': [
    'Əla vəziyyətdə, heç bir cızığı yoxdur. Orijinal qutusu və aksessuarları mövcuddur. Real alıcılar əlaqə saxlaya bilər.',
    'İdeal işlək vəziyyətdə, batareyası uzun müddət davam edir. Qiymət müzakirə oluna bilər. Ehtiyat hissələri də let.',
    'Yeni, istifadə olunmayıb, açılmamış qutuda. İstənilən sınaq və yoxlama ilə razıyam.',
    'Az istifadə olunub, yaxşı vəziyyətdədir. Bütün funksiyaları işləyir. Barter digər elektronika ilə mümkündür.',
    'Tam işlək vəziyyətdə. Enerji qənaətli model. Qarantiysı let. Şəhər daxilində pulsuz çatdırılma.',
  ],
  'Geyim': [
    'Orijinal brend, istifadə olunmayıb, etiketləri üzərindədir. Ölçü balaca gəldiyi üçün satılır.',
    'Bir dəfə istifadə olunub, əla vəziyyətdədir. Orijinal qəbz let. Digər geyimlərlə barter ola bilər.',
    'Yüksək keyfiyyətli parça, əl ilə istehsal olunub. Xaricdən gətirilib, mağaza qiyməti daha yüksəkdir.',
    'Hədiyyə kimi alınıb, heç geyinilməyib. Ölçü uyğun gəlmədiyi üçün satılır. Şəkildəki kimi mükəmməl vəziyyətdədir.',
    'Fəsil dəyişdiyi üçün satıram. Az istifadə olunub, yuyulub, təmizdir.',
  ],
  'Kitablar': [
    'Yeni vəziyyətdə, heç oxunmayıb. Mövzu ilə maraqlanmadığım üçün satıram. Digər kitablarla barter ola bilər.',
    'Kolleksiyamdan artıq nüsxə. Səhifələri təmiz, cırilma yoxdur. Nadir tapılan nəşrdir.',
    'Bütün seriya mövcuddur, eyni nəşriyyatdan. Təmiz saxlanılıb, sifarişlə xaricdən gətirilib.',
    'Qədim, kolleksiya üçün ideal. Tarix və ədəbiyyat həvəskarları üçün əla seçim.',
    'Dərslik və köməkçi materiallar dəsti. Sinaq imtahanları da daxildir.',
  ],
  'Ev və bağ': [
    'Yeni vəziyyətdə, quraşdırılmayıb. IKEA-dan alınıb, qəbzi və təlimatı mövcuddur.',
    'Yüksək keyfiyyətli material, praktik dizayn. Köçdüyüm üçün satıram.',
    'Almaniyanın Bosch brendindən. 2 il rəsmi zəmanəti let. Enerji qənaətli A+++ sinif.',
    'Dizayner əl işi, unikal model. Evə pulsuz çatdırılma təklif olunur. Müxtəlif rəng seçimi let.',
    'Həyət evi üçün ideal alət dəsti. Keyfiyyətli materialdan hazırlanıb, uzunömürlüdür.',
  ],
  'İdman': [
    'Yeni idman dəsti, orijinal Adidas. M ölçü, təlim və yarışlar üçün ideal.',
    'Demək olar ki, yeni vəziyyətdə, 2-3 dəfə istifadə olunub. Real alıcılara endirim edə bilərəm.',
    'Profisional səviyyə, yarış keyfiyyəti. Aktiv idmançılar üçün əla seçim.',
    'Tam dəst, hər şey daxildir. Evdə idman üçün ideal. İstifadə təlimatları da let.',
    'Brend avadanlıq, zalda istifadə olunan modelin eyni. Ev şəraitində məşq üçün mükəmməldir.',
  ],
  'Oyuncaqlar': [
    'Orijinal LEGO dəsti, tam komplekt, heç bir detalı əksik deyil. Təlimati və qutusu let.',
    'Uşağım böyüdüyü üçün satıram. Təmiz və yaxşı vəziyyətdədir. Digər oyuncaqlarla dəyişdirə bilərəm.',
    'Didaktik oyuncaq dəsti, uşaqların inkişafı üçün ideal. 3-6 yaş arası uşaqlar üçün.',
    'Yeni, hədiyyə kimi alınıb, istifadə olunmayıb. Orijinal qutusunda, açılmayıb.',
    'Kolleksiya üçün nadir tapılan model. Limitli buraxılış, hal-hazırda istehsal olunmur.',
  ],
  'Nəqliyyat': [
    'Bir sahibi olub, qarajda saxlanılıb. Bütün servis tarixçəsi mövcuddur. Qəzasız.',
    'Az sürülüb, 60,000 km yürüş. Yeni texniki baxışdan keçib. Sənədləri qaydasındadır.',
    'Əla texniki vəziyyətdə, yeni təkərlər və əyləc sistemi. Yanacaq sərfi aşağıdır.',
    'Elektrikli model, ətraf mühit üçün təmiz. Tam dolma ilə 50km məsafə qət edir.',
    'İdeal vəziyyətdə, tam təchiz olunub. Servis kitabçası və tarixçəsi let. Real alıcıya endirim mümkündür.',
  ],
  'Kolleksiya': [
    'Nadir tapılan kolleksiya əşyası. 100 ildən çox yaşı let. Sertifikatı mövcuddur.',
    'Məhdud sayda buraxılış, artıq istehsal olunmur. Kolleksiyaçılar üçün əla fürsət.',
    'Ideal saxlanma vəziyyəti, tarix həvəskarları üçün mükəmməl. Orijinallığı təsdiqlənib.',
    'SSRİ dövrünə aid orijinal əşya. Nostalji və kolleksiya üçün əla seçim.',
    'İmzalı, sertifikatlı məhsul. Əsl həvəskarlar üçün. Müxtəlif ödəniş üsulları mümkündür.',
  ],
  'Digər': [
    'Yüksək keyfiyyətli material, profisional və həvəskarlar üçün ideal. Komplektdə hər şey let.',
    'Əl işi, unikal dizayn. Birbaşa ustadan. Sifarişlə hazırlana bilər.',
    'Təbii materiallardan hazırlanıb, ekoloji təmiz. Allergiyanız yoxdursa istifadə edə bilərsiniz.',
    'Multifunksional, praktik və istifadəsi asan. Təlimat daxildir.',
    'İnnovativ məhsul, bazarda yeni. İlk alıcılar üçün xüsusi şərtlər.',
  ]
};

// Subcategories by category
const SUBCATEGORIES_BY_CATEGORY = {
  'Elektronika': ['Telefonlar', 'Noutbuklar', 'Qulaqlıqlar', 'Fotoaparatlar', 'TV', 'Planşetlər', 'Aksesuarlar'],
  'Geyim': ['Kişi geyimləri', 'Qadın geyimləri', 'Ayaqqabılar', 'Aksesuarlar', 'İdman geyimləri', 'Çantalar'],
  'Kitablar': ['Bədii ədəbiyyat', 'Dərsliklər', 'Biznes', 'Tarix', 'Uşaq kitabları', 'İngilis dili'],
  'Ev və bağ': ['Mebel', 'Məişət texnikası', 'Bağ alətləri', 'İşıqlandırma', 'Mətbəx', 'Dekorasiya'],
  'İdman': ['Fitnes', 'Futbol', 'Tennis', 'Üzgüçülük', 'Kampinq', 'Velosiped'],
  'Oyuncaqlar': ['LEGO', 'Plüş oyuncaqlar', 'Stolüstü oyunlar', 'Elektron oyuncaqlar', 'Uşaq inkişaf'],
  'Nəqliyyat': ['Avtomobil', 'Motosikl', 'Velosiped', 'Ehtiyat hissələri', 'Aksesuarlar'],
  'Kolleksiya': ['Sikkələr', 'Markalar', 'Antik əşyalar', 'Saatlar', 'Vintage'],
  'Digər': ['Musiqi alətləri', 'Sənət ləvazimatları', 'Əl işləri', 'Smart cihazlar']
};

// Generate a random number in a range
const randomInt = (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick a random item from an array
const randomItem = (array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Create a random date in the past 30 days
const randomDate = () {
  const today = new Date();
  const pastDays = randomInt(0, 30);
  const date = new Date(today);
  date.setDate(today.getDate() - pastDays);
  return date;
}

export async const seedItems = () {
  // console.log('>> Seeding items...');

  // Initialize database connection if not already initialized
  if (!db) {
    db = await createDbConnection();
  }

  // Check if items already exist
  const existingItems = await db.select().from(items);
  if (existingItems.length > 0) {
    // console.log(`>> ${existingItems.length} items already exist, skipping seed`);
    return existingItems;
  }

  // Get users or create if none exist
  let userList = await db.select().from(users);
  if (userList.length === 0) {
    // console.log('>> No users found, creating test users first...');
    userList = await seedUsers();
  }

  // Create 50 sample items
  const createdItems = [];
  const itemsToCreate = 50;

  for (let i = 0; i < itemsToCreate; i++) {
    // Select a random user
    const user = randomItem(userList);

    // Select a random category
    const categoryKeys = Object.keys(TITLES_BY_CATEGORY);
    const category = randomItem(categoryKeys);

    // Select a random title for that category
    const title = randomItem(TITLES_BY_CATEGORY[category]);

    // Select a random description
    const description = randomItem(DESCRIPTIONS_BY_CATEGORY[category]);

    // Select a random subcategory
    const subcategory = randomItem(SUBCATEGORIES_BY_CATEGORY[category]);

    // Select a random condition
    const condition = randomItem(CONDITIONS);

    // Select a random city
    const city = randomItem(CITIES);

    // Generate a random price (15-2000 AZN)
    const price = randomInt(15, 2000);

    // Random view count
    const viewCount = randomInt(5, 500);

    // Select a random wanted exchange text
    const wantedExchange = `${randomItem(TITLES_BY_CATEGORY[randomItem(categoryKeys)])} və ya oxşar`;

    // Create the item
    const newItem = {
      userId: user.id,
      title,
      description,
      category,
      subcategory,
      condition,
      city,
      status: randomItem(STATUSES),
      price,
      wantedExchange,
      viewCount,
      createdAt: randomDate(),
      updatedAt: new Date()
    };

    // Insert the item
    const [createdItem] = await db.insert(items).values(newItem).returning();

    // Get corresponding images for the category
    const categoryImages = IMAGES_BY_CATEGORY[category];

    // Add 1-3 images for the item
    const imageCount = randomInt(1, 3);
    for (let j = 0; j < imageCount && j < categoryImages.length; j++) {
      const isMain = j === 0; // First image is the main one
      await db.insert(images).values({
        itemId: createdItem.id,
        filePath: categoryImages[j],
        isMain
      });
    }

    createdItems.push(createdItem);
    // console.log(`>> Created item ${i + 1}/${itemsToCreate}: ${title}`);
  }

  // console.log(`>> Successfully created ${createdItems.length} items with images`);
  return createdItems;
}

// Run directly if needed
if (process.argv[1].includes('items-seed.js')) {
  seedItems()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error seeding items:', err);
      process.exit(1);
    });
}