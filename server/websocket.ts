
import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// WebSocket bağlantılarını saxlamaq üçün map
const clients = new Map<number, WebSocket>();

export function setupWebSocketServer(server: HttpServer): void {
  try {
    // WebSocket serverini qur, yolu /api/ws edin
    const wss = new WebSocketServer({ 
      server,
      path: '/api/ws',
      // Bağlantını təsdiqlə
      verifyClient: () => true
    });

    console.log('WebSocket serveri quruldu və /api/ws yolunda dinləyir');

    // Bağlantı hadisəsini dinləmək
    wss.on('connection', (ws, req) => {
      try {
        // URL-dən istifadəçi ID-ni almaq
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const userId = parseInt(url.searchParams.get('userId') || '0');
        const appToken = url.searchParams.get('appToken') || '';

        console.log(`WebSocket bağlantısı quruldu: UserId=${userId}, Token=${appToken}, IP=${req.socket.remoteAddress}`);

        // İstifadəçi ID-sinə görə bağlantını saxla
        clients.set(userId, ws);

        // Bağlantının uğurlu olduğunu bildirmək
        ws.send(JSON.stringify({
          type: 'connection_status',
          status: 'connected',
          userId: userId,
          timestamp: new Date().toISOString()
        }));

        // Xoş gəldiniz mesajı göndər
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'welcome',
              message: 'WebSocket serverinə xoş gəlmisiniz!',
              timestamp: new Date().toISOString()
            }));
          }
        }, 1000);

        // Mesaj qəbul edildikdə
        ws.on('message', (message) => {
          try {
            console.log(`Mesaj alındı, UserId=${userId}: ${message.toString()}`);
            
            // Mesajı emal et və JSON-a çevir
            const data = JSON.parse(message.toString());
            
            // Echo mesajı göndər (test məqsədilə)
            ws.send(JSON.stringify({
              type: 'echo',
              originalMessage: data,
              timestamp: new Date().toISOString()
            }));

          } catch (error) {
            console.error('Mesaj emalı zamanı xəta:', error);
            try {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Mesaj emalı zamanı xəta baş verdi',
                timestamp: new Date().toISOString()
              }));
            } catch (e) {
              console.error('Xəta mesajı göndərilə bilmədi:', e);
            }
          }
        });

        // Bağlantı bağlandığında
        ws.on('close', (code, reason) => {
          console.log(`WebSocket bağlantısı bağlandı: UserId=${userId}, Kod=${code}, Səbəb=${reason}`);
          clients.delete(userId);
        });

        // Xəta baş verdikdə
        ws.on('error', (error) => {
          console.error(`WebSocket xətası, UserId=${userId}:`, error);
        });

      } catch (error) {
        console.error('WebSocket bağlantısı zamanı xəta:', error);
        try {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Serverdə daxili xəta baş verdi',
            timestamp: new Date().toISOString()
          }));
          ws.close();
        } catch (e) {
          console.error('Xəta mesajı göndərilə bilmədi:', e);
        }
      }
    });

    // WSS server xətaları
    wss.on('error', (error) => {
      console.error('WebSocket server xətası:', error);
    });

    // WebSocket serverinin hazır olduğunu bildirmək
    console.log('WebSocket serveri işləyir və bağlantıları qəbul edir');
    
    // Test URL-i log et
    const baseUrl = process.env.REPL_SLUG && process.env.REPL_OWNER
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      : 'http://localhost:5000';
      
    console.log(`WebSocket test səhifəsi: ${baseUrl}/websocket-test-simple.html`);
    
  } catch (error) {
    console.error('WebSocket serverini qurmaq mümkün olmadı:', error);
  }
}

// Müəyyən bir istifadəçiyə mesaj göndərmək üçün metod
export function sendMessageToUser(userId: number, message: any): boolean {
  if (clients.has(userId)) {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`UserId=${userId} üçün mesaj göndərilə bilmədi:`, error);
        return false;
      }
    }
  }
  return false;
}

// Bütün bağlı istifadəçilərə mesaj göndərmək üçün metod
export function broadcastMessage(message: any): void {
  clients.forEach((client, userId) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error(`UserId=${userId} üçün broadcast mesaj göndərilə bilmədi:`, error);
      }
    }
  });
}
