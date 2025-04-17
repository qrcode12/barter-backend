import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
// @ts-ignore
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export const log = (message: string, source = "express") => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // console.log(`${formattedTime} [${source}] ${message}`);
}

export const setupVite = async (app: Express, server: Server) => {
  const serverOptions = {
    middlewareMode: true as const,
    hmr: { server },
    allowedHosts: ["localhost", "0.0.0.0", ".replit.dev", ".repl.co"], //This line is modified
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export const serveStatic = (app: Express) => {
  // Serve static files from the dist directory
  app.use(express.static(path.join(process.cwd(), 'dist'), {
    maxAge: '1d',
    etag: true,
    index: false
  }));

  // Serve uploads directory separately
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads'), {
    maxAge: '1d'
  }));

  // Serve locales directory separately
  app.use('/locales', express.static(path.join(process.cwd(), 'public/locales'), {
    maxAge: '1d'
  }));

  // Always serve index.html for any non-API request
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/locales')) {
      return;
    }
    // console.log('Serving index.html for path:', req.path);
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}