/**
 * BarterTap Hostinger Uyğunlaşdırılmış Express Server
 * 
 * Bu server faylı həm yerli inkişaf mühitində, həm də Hostinger kimi paylaşılan hosting mühitlərində işləmək üçün hazırlanmışdır.
 * - Yerli rejimdə tam Express server işlədir
 * - Hostinger rejimində statik faylları təqdim etmək üçün işlədilir
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: '*',
  credentials: true
}));

// MIME tipi düzəlişi - JS modulları üçün düzgün MIME tipləri təyin edir
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.mjs')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});

// Serve static files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir, {
  setHeaders: (res, filePath) => {
    // JS faylları üçün düzgün MIME tipi təyin et
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Separately serve uploads directory for images to guarantee access
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Basic API routes
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    // Bearer token alınması
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Avtorizasiya tələb olunur' });
    }

    const token = authHeader.split(' ')[1];

    // Development üçün bəsit autentikasiya (JWT və ya session cookie istifadə edilməli)
    if (!token) {
      return res.status(401).json({ message: 'Avtorizasiya tokeni tələb olunur' });
    }

    // Tokendən istifadəçi ID-sini əldə etmək (real mühitdə JWT-dən decode edilməli)
    const userId = parseInt(token);
    if (isNaN(userId)) {
      return res.status(401).json({ message: 'Düzgün olmayan token formatı' });
    }

    // Verilənlər bazasına qoşulmaq
    const connection = await (await import('pg')).default.connect(process.env.DATABASE_URL);

    // İstifadəçini tapmaq
    const result = await connection.query(
      'SELECT id, username, email, "fullName", role, active FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'İstifadəçi tapılmadı' });
    }

    const user = result.rows[0];
    res.json(user);

    // Əlaqəni bağlamaq
    connection.release();
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ 
      message: 'Cari istifadəçi məlumatlarını almaq mümkün olmadı',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(`Login attempt for username: ${username}`);

    // Verilənlər bazasına qoşulmaq
    const connection = await (await import('pg')).default.connect(process.env.DATABASE_URL);

    // İstifadəçini yoxlamaq
    const result = await connection.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      // console.log(`User not found: ${username}`);
      return res.status(401).json({ message: 'İstifadəçi adı və ya şifrə yanlışdır' });
    }

    const user = result.rows[0];
    // console.log(`User found: ${user.username}, checking password...`);

    // Şifrəni yoxlamaq üçün bcrypt əvəzinə bəsit yoxlama (development üçün)
    if (password === user.password) {
      // console.log(`Password correct for user: ${user.username}`);

      // Həssas məlumatları təmizləmək
      delete user.password;

      return res.json(user);
    }

    // console.log(`Password incorrect for user: ${user.username}`);
    return res.status(401).json({ message: 'İstifadəçi adı və ya şifrə yanlışdır' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Giriş zamanı xəta baş verdi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const userData = req.body;
    // console.log('Registration attempt:', userData);

    if (!userData.username || !userData.password || !userData.email) {
      return res.status(400).json({ 
        message: 'İstifadəçi adı, şifrə və email tələb olunur' 
      });
    }

    // Verilənlər bazasına qoşulmaq
    const connection = await (await import('pg')).default.connect(process.env.DATABASE_URL);

    // İstifadəçi adının unikallığını yoxlamaq
    const existingUser = await connection.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [userData.username, userData.email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Bu istifadəçi adı və ya email artıq istifadə olunur' 
      });
    }

    // İstifadəçi yaratmaq - burada şifrəni hash etmədən qeyd edirik (development üçün)
    const result = await connection.query(
      `INSERT INTO users(
        username, password, email, "fullName", role, active, "createdAt"
      ) VALUES($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [
        userData.username,
        userData.password, // Real layihədə hash etmək lazımdır
        userData.email,
        userData.fullName || userData.username,
        'user',
        true
      ]
    );

    const newUser = result.rows[0];

    // Həssas məlumatları təmizləmək
    delete newUser.password;

    // console.log(`User registered successfully: ${newUser.username} (ID: ${newUser.id})`);

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Qeydiyyat zamanı xəta baş verdi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Seed API - basit test veri yaratan yardımcı endpoint
app.post('/api/seed', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Seed feature is temporarily disabled'
    });
  } catch (error) {
    console.error('Error during seed operation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Polling API endpoint - WebSocket əvəzedicisi
app.get('/api/messages/polling', async (req, res) => {
  try {
    const lastId = parseInt(req.query.lastId) || 0;
    const userId = parseInt(req.query.userId) || 0;

    if (!userId) {
      return res.status(400).json({ error: 'UserId tələb olunur' });
    }

    // Verilənlər bazasına qoşulmaq
    const connection = await (await import('pg')).default.connect(process.env.DATABASE_URL);

    // İstifadəçinin qəbul etdiyi yeni mesajları əldə etmək üçün sorğu
    const query = `
      SELECT m.*, c.id as "conversationId", 
             u.id as "senderId", u.username as "senderUsername", u."fullName" as "senderFullName"
      FROM messages m
      JOIN conversations c ON m."conversationId" = c.id
      JOIN conversation_participants cp ON c.id = cp."conversationId"
      JOIN users u ON m."senderId" = u.id
      WHERE cp."userId" = $1 
        AND m.id > $2
      ORDER BY m."createdAt" ASC
      LIMIT 100
    `;

    const result = await connection.query(query, [userId, lastId]);

    // Mesajları formatla
    const messages = result.rows.map(row => ({
      id: row.id,
      conversationId: row.conversationId,
      content: row.content,
      createdAt: row.createdAt,
      status: row.isRead ? 'read' : 'delivered',
      sender: {
        id: row.senderId,
        username: row.senderUsername,
        fullName: row.senderFullName
      }
    }));

    res.json({ messages });

    // Əlaqəni bağlamaq
    connection.release();
  } catch (error) {
    console.error('Error while polling messages:', error);
    res.status(500).json({ 
      error: 'Mesajları yükləmək mümkün olmadı',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// HTTP fallback for sending messages when WebSocket is not available
app.post('/api/messages/send', async (req, res) => {
  try {
    const { type, conversationId, content } = req.body;

    if (type !== 'message' || !conversationId || !content) {
      return res.status(400).json({ error: 'Düzgün formatda mesaj deyil' });
    }

    // Verilənlər bazasına qoşulmaq
    const connection = await (await import('pg')).default.connect(process.env.DATABASE_URL);

    // Mesajı saxla və göndər
    const userId = 1; // TODO: Real authentifikasiya əsasında istifadəçi ID-sini təyin et

    const result = await connection.query(
      `INSERT INTO messages("conversationId", "senderId", content, "isRead", "createdAt")
       VALUES($1, $2, $3, false, NOW())
       RETURNING id, "createdAt"`,
      [conversationId, userId, content]
    );

    const newMessage = result.rows[0];

    // WebSocket vasitəsilə alıcıya bildiriş göndərmək
    const participantsQuery = `
      SELECT "userId" FROM conversation_participants
      WHERE "conversationId" = $1 AND "userId" != $2
    `;

    const participantsResult = await connection.query(participantsQuery, [conversationId, userId]);

    for (const row of participantsResult.rows) {
      const receiverId = row.userId;
      const targetClient = clients.get(receiverId);

      if (targetClient && targetClient.readyState === WS_OPEN) {
        targetClient.send(JSON.stringify({
          type: 'message',
          message: {
            id: newMessage.id,
            conversationId,
            content,
            createdAt: newMessage.createdAt,
            sender: { id: userId }
          }
        }));
      }
    }

    res.json({ success: true, messageId: newMessage.id });

    // Əlaqəni bağlamaq
    connection.release();
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Mesajı göndərmək mümkün olmadı',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Əşyaların axtarışı üçün API endpoint
app.get('/api/items', async (req, res) => {
  try {
    // Verilənlər bazasına qoşulmaq
    const connection = await (await import('pg')).default.connect(process.env.DATABASE_URL);

    // Parametrləri hazırlamaq
    const search = req.query.search || '';
    const category = req.query.category || '';
    const city = req.query.city || '';
    const condition = req.query.condition || '';
    const sort = req.query.sort || 'newest';
    const minPrice = parseInt(String(req.query.minPrice)) || 0;
    const maxPrice = parseInt(String(req.query.maxPrice)) || 10000;
    const limit = parseInt(String(req.query.limit)) || 50; // Limit artırıldı
    const offset = parseInt(String(req.query.offset)) || 0;

    console.log(`Searching items with params: 
      search: "${search}", 
      category: "${category}", 
      city: "${city}", 
      condition: "${condition}",
      sort: "${sort}",
      limit: ${limit},
      offset: ${offset}
    `);

    // SQL sorğusunu hazırlamaq
    let query = `
      SELECT i.*, 
             u.username AS "ownerUsername", 
             u."fullName" AS "ownerFullName",
             (SELECT COUNT(*) FROM favorites f WHERE f."itemId" = i.id) AS "favoriteCount"
      FROM items i
      LEFT JOIN users u ON i."userId" = u.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    // Axtarış parametrlərini əlavə etmək
    if (search) {
      query += ` AND (i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND i.category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    if (city) {
      query += ` AND i.city = $${paramCount}`;
      queryParams.push(city);
      paramCount++;
    }

    if (condition) {
      query += ` AND i.condition = $${paramCount}`;
      queryParams.push(condition);
      paramCount++;
    }

    if (minPrice > 0) {
      query += ` AND i.price >= $${paramCount}`;
      queryParams.push(minPrice);
      paramCount++;
    }

    if (maxPrice < 10000) {
      query += ` AND i.price <= $${paramCount}`;
      queryParams.push(maxPrice);
      paramCount++;
    }

    // Sıralama
    switch (sort) {
      case 'oldest':
        query += ` ORDER BY i."createdAt" ASC`;
        break;
      case 'price_asc':
        query += ` ORDER BY i.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY i.price DESC`;
        break;
      case 'title_asc':
        query += ` ORDER BY i.title ASC`;
        break;
      case 'title_desc':
        query += ` ORDER BY i.title DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY i."createdAt" DESC`;
    }

    // Limit və offset
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit);
    paramCount++;
    queryParams.push(offset);

    // Debug log
    // console.log(`Executing query: ${query} with params: ${JSON.stringify(queryParams)}`);

    // Sorğunu yerinə yetirmək
    const result = await connection.query(query, queryParams);
    // console.log(`Found ${result.rows.length} items`);

    // Əşyaların şəkillərini alırıq
    const items = [];

    for (const item of result.rows) {
      // Əşyanın şəkillərini ayrıca sorğu ilə almaq
      const imageQuery = `
        SELECT id, url, "isMain"
        FROM images 
        WHERE "itemId" = $1
        ORDER BY "isMain" DESC, "createdAt" ASC
      `;

      const imageResult = await connection.query(imageQuery, [item.id]);
      const images = imageResult.rows;

      // Əsas şəkil təyin etmək
      let mainImage = null;
      if (images && images.length > 0) {
        const mainImageObj = images.find(img => img.isMain) || images[0];
        mainImage = mainImageObj.url;
      }

      // Cavaba əlavə et
      items.push({
        ...item,
        mainImage: mainImage || '/uploads/placeholder.jpg',
        images: images || []
      });
    }

    res.json(items);

    // Əlaqəni bağlamaq
    connection.release();

  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ 
      error: 'Əşyaları yükləmək mümkün olmadı',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// WebSocket server konfiqurasiyası
const wss = new WebSocketServer({ 
  server, 
  path: '/ws'
});

// WebSocket müştərilərini saxlamaq üçün Map
const clients = new Map();

// OPEN sabit dəyəri doğrudan WebSocket-dən götürək (WebSocket.OPEN = 1)
const WS_OPEN = WebSocket.OPEN;

// console.log('WebSocket server konfiqurasiya edildi. Yol:', '/ws');

wss.on('connection', (ws, req) => {
  // URL-dən userId parametrini əldə etmək
  const url = req.url || '';
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  const userId = parseInt(urlParams.get('userId') || '0');

  // console.log('WebSocket client connected. User ID:', userId);

  // Əgər userId varsa, clients Map-ə əlavə et
  if (userId > 0) {
    clients.set(userId, ws);
  }

  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to BarterTap WebSocket Server',
    userId: userId
  }));

  ws.on('message', (message) => {
    try {
      const messageStr = message.toString();
      // console.log('Received message:', messageStr.substring(0, 100));

      // Mesajı JSON kimi analiz etməyə çalış
      const data = JSON.parse(messageStr);

      // Mesaj tipinə görə müxtəlif əməliyyatlar
      if (data.type === 'chat' && data.to && data.content) {
        // Fərdi mesaj göndərmə
        const targetClient = clients.get(parseInt(data.to));
        if (targetClient && targetClient.readyState === WS_OPEN) {
          targetClient.send(JSON.stringify({
            type: 'chat',
            from: userId,
            content: data.content,
            timestamp: new Date().toISOString()
          }));
        }
      } else {
        // Digər mesaj tipləri (ping, status və s.)
        ws.send(JSON.stringify({
          type: 'echo',
          data: data,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Mesaj formatı yanlışdır',
        error: error instanceof Error ? error.message : 'Bilinməyən xəta'
      }));
    }
  });

  ws.on('close', () => {
    // İstifadəçi bağlantısını Map-dən silmək
    if (userId > 0) {
      clients.delete(userId);
    }
    // console.log('WebSocket client disconnected. User ID:', userId);
  });
});

// Broadcast to all connected clients
const broadcast = (data) {
  wss.clients.forEach(client => {
    if (client.readyState === WS_OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicDir, 'index.html'));
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  // console.log(`BarterTap server running on port ${PORT}`);
  // console.log(`Server mode: ${process.env.NODE_ENV || 'development'}`);
});