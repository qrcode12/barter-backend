// Seed file to create example items in the database
import { storage } from './storage.js';

// Sample data for item categories and conditions
const categories = [
  'Elektronika', 'Geyim', 'Kitablar', 'Mebel', 'İdman', 'Oyuncaqlar', 'Kompüter', 
  'Nəqliyyat', 'Kolleksiya', 'Ev və bağ', 'Təhsil', 'Hobbi', 'Musiqi', 'Aksesuar',
  'Uşaq əşyaları', 'Daşınmaz əmlak', 'Telefon', 'İş aləti', 'Məişət texnikası',
  'Heyvanlar', 'Ərzaq', 'Kənd təsərrüfatı', 'Sənət əsərləri', 'Antikvar əşyalar'
];

const subcategories = {
  'Elektronika': ['Telefonlar', 'Tabletlər', 'Qulaqlıqlar', 'Foto və video', 'Televizorlar', 'Saatlar', 'Aksesuarlar'],
  'Geyim': ['Kişi geyimləri', 'Qadın geyimləri', 'Uşaq geyimləri', 'Ayaqqabılar', 'Çantalar', 'Saatlar', 'Aksesuarlar'],
  'Kitablar': ['Bədii ədəbiyyat', 'Elmi', 'Tədris', 'Uşaq ədəbiyyatı', 'Xarici dillər', 'İncəsənət', 'Dərsliklər'],
  'Mebel': ['Yataq otağı', 'Qonaq otağı', 'Mətbəx', 'Uşaq otağı', 'Ofis', 'Bağ', 'Hamam otağı'],
  'İdman': ['Fitnes', 'Futbol', 'Basketbol', 'Üzgüçülük', 'Velosiped', 'Tennis', 'Kampinq'],
  'Nəqliyyat': ['Minik avtomobilləri', 'SUV', 'Motosikletlər', 'Velosipedlər', 'Ehtiyat hissələri', 'Aksesuarlar'],
  'Məişət texnikası': ['Soyuducular', 'Paltaryuyan maşınlar', 'Qab yuyan maşınlar', 'Sobalar', 'Mikrodalğalı sobalar', 'Tozsoranlar']
};

const conditions = ['Yeni', 'Əla', 'Yaxşı', 'Kafi', 'Təmirə ehtiyacı let'];

const cities = ['Bakı', 'Gəncə', 'Sumqayıt', 'Mingəçevir', 'Lənkəran', 'Şəki', 'Quba', 
  'Naxçıvan', 'Şirvan', 'Qusar', 'Salyan', 'Xaçmaz', 'Şamaxı', 'Zaqatala'];

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
  'https://i.imgur.com/c7EIDVL.jpg', // Home and garden
  'https://i.imgur.com/qBcIF44.jpg', // Kids
  'https://i.imgur.com/L44xEbO.jpg', // Real Estate
  'https://i.imgur.com/pSGAERU.jpg', // Phone
  'https://i.imgur.com/HJKpRoD.jpg', // Tools
  'https://i.imgur.com/S8Fhcke.jpg', // Appliances
  'https://i.imgur.com/YeQvL1s.jpg', // Pets
  'https://i.imgur.com/IShDBnx.jpg', // Food
  'https://i.imgur.com/CQvWLQm.jpg'  // Agriculture
];

// Sample titles for each category
const titlesByCat = {
  'Elektronika': [
    'Samsung Galaxy S22 Ultra Telefon', 
    'Apple iPhone 14 Pro 256GB', 
    'Xiaomi Mi Band 6 Fitness Tracker',
    'Sony WH-1000XM4 Qulaqlıq',
    'JBL Bluetooth Səs Ucaldıcı',
    'Canon EOS 850D Fotoaparat',
    'DJI Mini 3 Pro Drone',
    'Xiaomi Smart TV 55" 4K',
    'Apple iPad Pro 12.9" 2022',
    'Huawei MatePad Pro',
    'Dyson Saç Quruducusu'
  ],
  'Geyim': [
    'Adidas Orijinal İdman Kostyumu',
    'Nike Air Max Ayaqqabı',
    'Zara Kişi Pencəyi',
    'H&M Qış Gödəkçəsi',
    'Mango Qadın Paltarı',
    'Levi\'s Blue Jeans',
    'Gucci Əl Çantası',
    'Tommy Hilfiger Kişi Köynəyi',
    'New Balance İdman Ayaqqabısı',
    'Calvin Klein Qadın Alt Paltarı Dəsti',
    'Rolex Orijinal Qol Saatı'
  ],
  'Kitablar': [
    '1984 - George Orwell',
    'Harry Potter Seriyası',
    'Xarici Dil Dərslikləri',
    'Proqramlaşdırma Kitabları',
    'Psixologiya və Şəxsi İnkişaf',
    'Klassik Ədəbiyyat Kolleksiyası',
    'Azərbaycan Tarixi Üzrə Kitablar',
    'Cinayət və Cəza - Dostoyevski',
    'Qurtuluş - Əli və Nino',
    'İngilis dili Üçün Kembric Dərsliyi',
    'Azərbaycan Kulinariyası Kitabı'
  ],
  'Mebel': [
    'IKEA Oturma Dəsti',
    'Yataq və Döşək',
    'İş Masası və Stul',
    'Yemək Masası Dəsti',
    'Kitab Rəfi',
    'Divan və Kreslo',
    'Uşaq Otağı Mebeli',
    'Bellona Yataq Otağı Mebel Dəsti',
    'İstikbal Qonaq Otağı Dəsti',
    'Paltar Şkafı, 3 Qapılı',
    'Mətbəx Mebel Dəsti, Ağ'
  ],
  'İdman': [
    'Treadmill İdman Avadanlığı',
    'Ağırlıq Dəsti 20kg',
    'Velosiped, Dağ Velosipedi',
    'Tennis Raketləri Dəsti',
    'Futbol Topu, Adidas',
    'Yoga Matı, 6mm',
    'Üzgüçülük Dəsti, Professional',
    'Adidas İdman Geyimi Dəsti',
    'Camping Çadırı 4 Nəfərlik',
    'Fitness Qolbağı Garmin'
  ],
  'Nəqliyyat': [
    'Mercedes-Benz C180 2019',
    'Toyota Camry 2020',
    'BMW X5 2018',
    'Motosiklet Aprilia RS 125',
    'Kia Sportage 2021',
    'Avtomobil Təkərləri Continental',
    'Avtomobil Aksesuarları Dəsti',
    'Motosiklet Dəbilqəsi',
    'Velosiped Trek FX 2',
    'Tesla Model 3 2022'
  ],
  'Kompüter': [
    'Apple MacBook Pro 16" 2023',
    'HP Pavilion Gaming Laptop',
    'Gaming PC RTX 3080Ti',
    'Dell UltraSharp 27" Monitor',
    'Acer Predator Helios Laptop',
    'Razer Gaming Siçan və Klaviatura',
    'External SSD 1TB Samsung',
    'Lenovo ThinkPad X1 Carbon',
    'Asus ROG Strix G15',
    'MSI Creator Laptop'
  ],
  'Məişət texnikası': [
    'Samsung No-Frost Soyuducu',
    'Bosch Paltaryuyan Maşın',
    'Electrolux Qab Yuyan Maşın',
    'Arçelik Elektrik Sobasὶ',
    'Dyson V11 Tozsoranı',
    'Phillips Ütü',
    'Braun Blender Dəsti',
    'LG Kondisioner',
    'Beko Qabyuyan Maşın',
    'Tefal Toster'
  ],
  'Uşaq əşyaları': [
    'Uşaq Arabası Chicco',
    'Uşaq Beşiyi, Ağac',
    'Uşaq Oyuncaqları Dəsti',
    'Uşaq Velosipedi',
    'Uşaq Paltarları 2-3 yaş',
    'Uşaq Ayaqqabıları',
    'Uşaq Oturacağı Avtomobil Üçün',
    'Uşaq Kitabları, Resimli',
    'Uşaq Bələk Dəsti',
    'Uşaq Oyun Meydançası'
  ],
  'Daşınmaz əmlak': [
    '3 Otaqlı Mənzil, Nəsimi Rayonu',
    '2 Otaqlı Yeni Tikili, Yasamal',
    'Həyət Evi, Binəqədi',
    'Torpaq Sahəsi 10 sot, Xırdalan',
    'Villa, Mərdəkan',
    'Ofis Sahəsi, Şəhər Mərkəzi',
    'Bağ Evi, Novxanı',
    'Qaraj, Yasamal',
    'Obyekt, Ticarət Mərkəzi',
    'Kottec, Şüvəlan'
  ],
  'Telefon': [
    'iPhone 15 Pro Max 1TB',
    'Samsung Galaxy S23 Ultra',
    'Xiaomi 13 Pro',
    'Google Pixel 7 Pro',
    'Huawei P50 Pro',
    'OnePlus 11',
    'Oppo Find X5 Pro',
    'Vivo X80 Pro',
    'iPhone 14 Plus',
    'Samsung Galaxy Z Fold 4'
  ],
  'Kolleksiya': [
    'Qədim Sikkələr Kolleksiyası',
    'Poçt Markaları Toplusu',
    'Unikal Xalçalar',
    'Antik Mebel Parçaları',
    'Qədim Silahlar',
    'Maraqlı Daşlar Kolleksiyası',
    'Çini Qablar, 19-cu əsr',
    'Vinyl Vallar Toplusu',
    'Qədim Kitablar',
    'Nadir Saat Kolleksiyası'
  ]
};

// Default descriptions with more detail
const defaultDescriptions = [
  'Əla vəziyyətdə, demək olar ki, yeni kimidir. Heç bir cızığı və ya qüsuru yoxdur. Orijinal qutusunda, bütün aksesuarları ilə birlikdə satılır.',
  'Yaxşı qiymətə satılır, real alıcılar yazsın. Qiymət son qiymət deyil, razılaşmaq olar. Şəxsi görüş zamanı yoxlaya bilərsiniz.',
  'Sərfəli qiymətə, başqa əşyalarla dəyişdirmək mümkündür. Maraqlandığınız hər hansı bir məhsulla barter etməyə hazıram, təklif edə bilərsiniz.',
  'Sənədləri və qutusu let, əlavə aksesuar verilir. Orijinallığını təsdiq edən bütün sənədlər mövcuddur. Zəmanət müddəti hələ bitməyib.',
  'Əlaqə nömrəsi: +994 55 555 55 55, axşam saatlarında zəng edin. Whatsapp-da da yaza bilərsiniz. Suallarınızı cavablandırmağa hazıram.',
  'Barter təklifi: telefon/noutbuk ilə dəyişərəm. Xüsusilə son model Apple və Samsung məhsulları maraqlandırır. Nağd + barter variantı da mümkündür.',
  'Razılaşma yolu ilə qiymətdə endirim olunur. Ciddi alıcılar üçün əlavə güzəştlər ediləcək. Topdan alış üçün xüsusi təkliflər let.',
  'Təcili satılır, qiyməti sərfəlidir. Xaricdən gəldiyi üçün geri qaytarmaq mümkün deyil. Bakı daxilində çatdırılma xidməti təklif olunur.',
  'Sifariş əsasında, rəng seçimi mümkündür. Müştərinin istəyinə uyğun olaraq fərqli dizayn və ölçü variantları da təklif olunur.',
  'Şəkildəki kimi, əla vəziyyətdə. Heç bir təmirə ehtiyacı yoxdur, dərhal istifadə edilə bilər. Alıcıya hədiyyələr də təqdim olunur.',
  'Avropa istehsalı, premium keyfiyyət. Bu cür məhsullar adətən mağazalarda daha baha qiymətə satılır. İdxal sənədləri mövcuddur.',
  'İkinci əl olsa da, çox az istifadə edilib. Ailə üzvü tərəfindən bir neçə dəfə istifadə edilib, praktiki olaraq yenidir.',
  'Bu model artıq istehsal olunmur, kolleksiyaçılar üçün əla fürsətdir. Nadir tapılan və yüksək qiymətləndirilən məhsuldur.',
  'Müasir dizayn və funksionallıq bir arada. Həm praktiki, həm də estetik baxımdan üstün məhsuldur. Hər evə uyğun gəlir.',
  'Satışımda başqa maraqlı məhsullar da let, profilimə baxa bilərsiniz. Toplu alış üçün xüsusi endirim təklif edirəm.'
];

// Function to create a random date within the last 30 days
const randomDate = () {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
  return pastDate;
}

// Generate random price between min and max
const randomPrice = (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to create random items
async const createRandomItems = (count) {
  try {
    const users = await storage.getAllUsers();

    if (users.length === 0) {
      console.error('No users found. Please create users first.');
      return;
    }

    // console.log(`Creating ${count} random items...`);

    // Object to keep track of how many items in each category
    const categoryCounter = {};

    // Make sure each category has at least a few items
    for (const category of categories) {
      categoryCounter[category] = 0;
    }

    for (let i = 0; i < count; i++) {
      // Determine category strategy - sometimes target categories with fewer items
      let randomCategory;
      if (i < categories.length * 3) {
        // For first batch, distribute evenly among categories
        randomCategory = categories[i % categories.length];
      } else {
        // Random selection for the rest
        randomCategory = categories[Math.floor(Math.random() * categories.length)];
      }

      categoryCounter[randomCategory] = (categoryCounter[randomCategory] || 0) + 1;

      // Select random user, condition, and city
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];

      // Select a subcategory if available
      const subcategoryList = subcategories[randomCategory] || [];
      const randomSubcategory = subcategoryList.length > 0 ? 
        subcategoryList[Math.floor(Math.random() * subcategoryList.length)] : null;

      // Select a title for this category
      const categoryTitles = titlesByCat[randomCategory] || titlesByCat['Elektronika'];
      const randomTitle = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];

      // Select a description
      const randomDescription = defaultDescriptions[Math.floor(Math.random() * defaultDescriptions.length)];

      // Generate price for some items
      const hasPrice = Math.random() > 0.3; // 70% of items have price
      const price = hasPrice ? randomPrice(10, 5000) : null;

      // Determine status - mostly active but some completed or pending
      const statusRandom = Math.random();
      let status = 'active';
      if (statusRandom > 0.85) status = 'completed';
      else if (statusRandom > 0.7) status = 'pending';

      // Generate what the user wants in exchange (barter)
      const exchangeOptions = [
        'Telefon', 'Noutbuk', 'Pul', 'Velosiped', 'Televizor', 'Qol saatı',
        'Nağd pul', 'Planşet', 'Smart saat', 'Qulaqlıq', 'Konsol', 'Təklif edin',
        'Geyim', 'Ərzaq', 'Mebel', 'Ev texnikası', 'Kitab', 'Başqa barter təklifi'
      ];
      const wantedExchange = exchangeOptions[Math.floor(Math.random() * exchangeOptions.length)];

      // Create item with more detailed info
      const item = await storage.createItem({
        userId: randomUser.id,
        title: randomTitle,
        description: randomDescription,
        category: randomCategory,
        subcategory: randomSubcategory,
        condition: randomCondition,
        city: randomCity,
        status: status,
        price: price,
        wantedExchange: wantedExchange,
        createdAt: randomDate(),
        viewCount: Math.floor(Math.random() * 500) // Random view count for popularity
      });

      // console.log(`Created item ${i+1}/${count}: ${item.title} (ID: ${item.id}, Category: ${randomCategory})`);

      // Add multiple images for some items
      const imageCount = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1;

      for (let j = 0; j < imageCount; j++) {
        // Choose image more relevant to category if possible
        let categoryIndex = categories.indexOf(randomCategory);
        if (categoryIndex >= sampleImages.length) {
          categoryIndex = Math.floor(Math.random() * sampleImages.length);
        }

        // Add some randomness to image selection
        const randomOffset = Math.floor(Math.random() * 3);
        const imageIndex = (categoryIndex + randomOffset) % sampleImages.length;

        await storage.createImage({
          itemId: item.id,
          filePath: sampleImages[imageIndex],
          isMain: j === 0 // First image is main
        });
      }

      // Add a slight delay
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // console.log('Item distribution by category:');
    for (const category in categoryCounter) {
      // console.log(`${category}: ${categoryCounter[category]} elanlar`);
    }

    // console.log('Done creating items.');
  } catch (error) {
    console.error('Error creating items:', error);
  }
}

// Function to create random reviews for users
async const createRandomReviews = () {
  try {
    const users = await storage.getAllUsers();
    const offers = await storage.getItems({ status: 'completed' });

    if (users.length === 0) {
      console.error('No users found. Please create users first.');
      return;
    }

    if (offers.length === 0) {
      console.error('No completed offers found. Cannot create reviews.');
      return;
    }

    // console.log(`Creating random reviews for completed offers...`);

    // Create test offers for completed items if none exist
    const testOffers = [];
    for (const item of offers) {
      // Create a random buyer (different from seller)
      const potentialBuyers = users.filter(user => user.id !== item.userId);
      if (potentialBuyers.length === 0) continue;

      const randomBuyer = potentialBuyers[Math.floor(Math.random() * potentialBuyers.length)];

      // Create an offer (completed)
      const offer = await storage.createOffer({
        fromUserId: randomBuyer.id,
        toUserId: item.userId,
        itemId: item.id,
        message: 'Bu əşya məni maraqlandırır. Barter edək?',
        status: 'completed',
        createdAt: new Date(item.createdAt)
      });

      testOffers.push(offer);
      // console.log(`Created completed offer for item ${item.title}`);
    }

    // Get all completed offers for review
    let reviewableOffers = [...testOffers];
    if (reviewableOffers.length === 0) {
      console.error('No completed offers found even after creating test offers.');
      return;
    }

    // Create reviews for a portion of completed offers
    const reviewCount = Math.min(reviewableOffers.length, 50); // Cap at 50 reviews
    // console.log(`Creating ${reviewCount} random reviews...`);

    for (let i = 0; i < reviewCount; i++) {
      const offer = reviewableOffers[i];

      // Random rating between 3-5 (mostly positive ratings)
      const rating = Math.floor(Math.random() * 3) + 3;

      // Comments based on rating
      const comments = {
        5: [
          "Mükəmməl alış-veriş təcrübəsi! Məhsul təsvir edildiyi kimi idi.",
          "Çox etibarlı satıcı, sürətli cavab verdi və əşya əla vəziyyətdədir.",
          "Əla xidmət! Tez çatdırılma və yüksək keyfiyyətli məhsul.",
          "Təkrar alış-veriş edərdim. Hər şey üçün təşəkkürlər!",
          "Satıcı çox peşəkar və mehriban idi. Tövsiyə edirəm."
        ],
        4: [
          "Yaxşı təcrübə, məhsul gözlədiyim kimi idi. Bir az gecikdirmə oldu.",
          "Ümumiyyətlə razıyam, kiçik problemlər xaricində hər şey yaxşı idi.",
          "Əşya keyfiyyətlidir, satıcı da çox yaxşı idi.",
          "Məmnun qaldım, amma çatdırılma bir az ləng oldu.",
          "Yaxşı alıcı, problemsiz müamilə."
        ],
        3: [
          "Normal təcrübə. Məhsul təsvirdən bir az fərqli idi.",
          "Orta səviyyəli. Kommunikasiya yaxşı idi, amma məhsul gözləntilərimə tam cavab vermədi.",
          "Məqbul. Bəzi kiçik problemlər oldu amma həll olundu.",
          "Ümumilikdə normal. Yaxşılaşdırılacaq məqamlar let.",
          "Əməliyyat bitdi, amma daha yaxşı ola bilərdi."
        ]
      };

      // Select random comment based on rating
      const randomComment = comments[rating][Math.floor(Math.random() * comments[rating].length)];

      // Create review from buyer to seller
      await storage.createReview({
        offerId: offer.id,
        fromUserId: offer.fromUserId, // Buyer
        toUserId: offer.toUserId,     // Seller
        rating: rating,
        comment: randomComment
      });

      // console.log(`Created review for offer ID ${offer.id}, rating: ${rating}`);

      // Sometimes create a reciprocal review (seller reviews buyer)
      if (Math.random() > 0.3) {
        const sellerRating = Math.floor(Math.random() * 3) + 3; // Also 3-5
        const sellerComment = comments[sellerRating][Math.floor(Math.random() * comments[sellerRating].length)];

        await storage.createReview({
          offerId: offer.id,
          fromUserId: offer.toUserId,     // Seller
          toUserId: offer.fromUserId,     // Buyer
          rating: sellerRating,
          comment: sellerComment
        });

        // console.log(`Created reciprocal review for offer ID ${offer.id}, rating: ${sellerRating}`);
      }
    }

    // console.log('Done creating reviews.');
  } catch (error) {
    console.error('Error creating reviews:', error);
  }
}

// Create 200 items for a good demonstration
createRandomItems(200)
  .then(() => createRandomReviews())
  .then(() => {
    // console.log('Seed script completed.');
  })
  .catch(err => {
    console.error('Seed script failed:', err);
  });