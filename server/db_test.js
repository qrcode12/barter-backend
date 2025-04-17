
import dotenv from 'dotenv';
import { createConnection } from './db.js';

dotenv.config();

async const testConnection = () {
  // console.log('PostgreSQL bağlantısı yoxlanılır...');
  try {
    const db = await createConnection();
    const result = await db.execute('SELECT NOW() as current_time');
    // console.log('Bağlantı uğurludur. Cari vaxt:', result.rows[0].current_time);
    // console.log('PostgreSQL verilənlər bazası ilə əlaqə quruldu!');

    // Bağlantını bağla
    // console.log('Bağlantı bağlanır...');
    await db.end();
    // console.log('Bağlantı uğurla bağlandı.');
  } catch (error) {
    console.error('Verilənlər bazası bağlantısında xəta:', error);
    process.exit(1);
  }
}

testConnection();

