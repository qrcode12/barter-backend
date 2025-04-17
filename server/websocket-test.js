/**
 * WebSocket bağlantısını test etmək üçün alət
 * Bu skript server tərəfdə WebSocket bağlantılarını bir sıra testlərlə yoxlayır
 */

import WebSocket from 'ws';
import http from 'http';
import url from 'url';

/**
 * WebSocket server URL qurur
 * @param {string} host - WebSocket server host
 * @param {number|string} port - WebSocket server port
 * @returns {string} - WebSocket URL
 */
const buildWebSocketUrl = (host, port) {
  // Detect if local development or production
  const protocol = host.includes('localhost') ? 'ws:' : 'wss:';
  return `${protocol}//${host}${port ? ':' + port : ''}/api/ws`;
}

/**
 * WebSocket bağlantısını test edir
 * @param {string} wsUrl - WebSocket URL
 * @param {number} userId - Test üçün istifadəçi ID
 */
const testWebSocketConnection = (wsUrl, userId = 1) {
  // console.log(`\nWebSocket testi "${wsUrl}" adresində başladılır...`);

  // Test userId parametrini əlavə et
  const fullUrl = `${wsUrl}?userId=${userId}&appToken=test_${Date.now()}`;
  // console.log(`Tam URL: ${fullUrl}`);

  const ws = new WebSocket(fullUrl);

  ws.on('open', () => {
    // console.log('✅ Bağlantı uğurla quruldu!');

    // Send a test message
    const testMessage = {
      type: 'test',
      content: 'This is a test message',
      timestamp: new Date().toISOString()
    };

    try {
      ws.send(JSON.stringify(testMessage));
      // console.log('📤 Test mesajı göndərildi:', testMessage);
    } catch (err) {
      console.error('❌ Mesaj göndərilə bilmədi:', err.message);
    }

    // Close after 5 seconds
    setTimeout(() => {
      try {
        ws.close();
        // console.log('Bağlantı bağlandı');
      } catch (e) {
        console.error('Bağlantı bağlanarkən xəta:', e.message);
      }
    }, 5000);
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      // console.log('📩 Mesaj alındı:', message);
    } catch (err) {
      // console.log('📩 Mesaj alındı (raw):', data.toString());
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket xətası:', error.message);
  });

  ws.on('close', (code, reason) => {
    // console.log(`❎ Bağlantı bağlandı. Kod: ${code}, Səbəb: ${reason || 'None'}`);
  });
}

// Run tests with different configurations
const TEST_CASES = [
  {
    name: 'Replit mühiti',
    host: 'c056e967-b65a-4297-9ccb-49677d92c73d-00-on60u9modgpd.worf.replit.dev',
    port: '', // Empty for Replit as it uses the default port
    userId: 1
  },
  {
    name: 'Localhost testing',
    host: 'localhost',
    port: 3000,
    userId: 1
  }
];

// Run each test case with a delay between them
const runTests = () {
  let index = 0;

  const runNextTest = () {
    if (index >= TEST_CASES.length) {
      // console.log('\n🏁 Bütün testlər tamamlandı');
      return;
    }

    const test = TEST_CASES[index];
    // console.log(`\n🧪 Test #${index + 1}: ${test.name}`);

    const wsUrl = buildWebSocketUrl(test.host, test.port);
    testWebSocketConnection(wsUrl, test.userId);

    index++;

    // Wait 10 seconds before next test
    setTimeout(runNextTest, 10000);
  }

  runNextTest();
}

// console.log('🔌 WebSocket bağlantı testləri başladılır...');
runTests();