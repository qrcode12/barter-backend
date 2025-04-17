import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { registerSimplifiedRoutes } from "./routes-simplified.js";
import { setupVite, serveStatic, log } from "./vite.js";
import path, { dirname } from "path";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import { configureSession } from "./session.js";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import multer from "multer";
import { setupWebSocketServer } from './websocket.js';
import * as http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Şəkil qovluqları
const uploadsDir = path.join(process.cwd(), 'public/uploads');
const itemsDir = path.join(uploadsDir, 'items');
const avatarsDir = path.join(uploadsDir, 'avatars');

// Qovluqları yarad
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(itemsDir)) fs.mkdirSync(itemsDir, { recursive: true });
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

const app = express();

// Middleware-lər
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS konfiqurasiyası
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://bartertap.az', 'https://www.bartertap.az']
    : true,
  credentials: true
}));

// Serve static files with correct MIME types
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

app.set("trust proxy", 1);

const sessionMiddleware = configureSession();
app.use(sessionMiddleware);

// Lokallaşma və şəkil qovluqları statik servis kimi
app.use('/locales', express.static(path.join(process.cwd(), 'public/locales')));
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));
app.use('/assets', express.static(path.join(process.cwd(), 'public/assets')));

// WebSocket test səhifələrini kök qovluqdan yüklə
app.get('/websocket-test.html', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client/public/websocket-test.html'));
});

app.get('/websocket-test-simple.html', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client/public/websocket-test-simple.html'));
});

// WebSocket serveri daha yaxşı test etmək üçün əlavə endpoint
app.get('/api/websocket-test', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WebSocket endpoint is available',
    websocketUrl: `${req.protocol === 'https' ? 'wss' : 'ws'}://${req.headers.host}/api/ws`,
  });
});

// Root səhifəsi üçün basit yönləndirmə
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="az">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BarterTap - Mübadilə Platforması</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #2563eb;
          text-align: center;
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 200px;
          height: auto;
        }
        .container {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
          background-color: #f9fafb;
        }
        .btn {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 10px 15px;
          text-decoration: none;
          border-radius: 4px;
          margin: 10px 0;
        }
        ul {
          margin-top: 20px;
        }
        li {
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="logo">
        <img src="/images/barter-logo.png" alt="BarterTap Logo" />
      </div>
      <h1>BarterTap WebSocket Test Serveri</h1>
      <div class="container">
        <p>WebSocket serveri uğurla işləyir. Test səhifələri:</p>
        <ul>
          <li><a href="/websocket-test.html" class="btn">WebSocket Test Səhifəsi</a></li>
          <li><a href="/websocket-test-simple.html" class="btn">Sadə WebSocket Test</a></li>
        </ul>
        <p>Serverə qoşulmada hər hansı problem yaşayırsınızsa, əmin olun ki:</p>
        <ul>
          <li>WebSocket URL düzgün konfiqurasiya edilib</li>
          <li>Brauzeriniz WebSocket texnologiyasını dəstəkləyir</li>
          <li>Şəbəkə bağlantınız sabitdir</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// Multer ilə şəkil yükləmə ayarları
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, itemsDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// ✅ Şəkil yükləmə endpoint
app.post("/api/upload", upload.single("image"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "Şəkil yüklənmədi" });
  }
  const imageUrl = `/uploads/items/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
});

// Sağlamlıq yoxlama endpoint-i
app.get('/api/healthcheck', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'BarterTap WebSocket server is running' });
});

// Error handling və route qeydiyyatı
(async () => {
  try {
    // Setup a simple HTTP server for WebSocket support
    const server = http.createServer(app);

    // Register simplified routes first
    registerSimplifiedRoutes(app);

    // Then register main routes
    // const server = await registerRoutes(app);

    // Setup WebSocket Server
    setupWebSocketServer(server);
    console.log("WebSocket serveri konfiqurasiya edildi və qoşulmaları qəbul etməyə hazırdır");

    // WebSocket test URL-ini log etmək
    const baseUrl = process.env.REPL_SLUG && process.env.REPL_OWNER
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      : 'http://localhost:5000';

    console.log(`WebSocket test URL: ${baseUrl}/websocket-test-simple.html`);
    console.log(`WebSocket API URL: ${baseUrl}/api/ws?userId=1&appToken=test_token`);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Application error:", err);
      res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
      log(`WebSocket test page available at: http://localhost:${port}/websocket-test.html`);

      // Replit mühitində xüsusi URL göstər
      if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        log(`or: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/websocket-test.html`);
      } else {
        log(`Or access through your Replit URL in the Webview panel`);
      }

      console.log("WebSocket server is running");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();