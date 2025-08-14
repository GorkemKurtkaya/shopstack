import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // 1. deneme: 500ms, 2. deneme: 1000ms, 3. deneme: 2000ms, max 5000ms
      const delay = Math.min(500 * Math.pow(2, retries), 5000);
      console.log(`Redis bağlantısı kayboldu. ${retries + 1}. deneme ${delay}ms sonra yapılacak.`);
      return delay;
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err.message);
});

redisClient.on('ready', () => {
  console.log('Redis bağlantısı başarılı!');
});

redisClient.on('reconnecting', () => {
  console.log('Redis bağlantısı yeniden kuruluyor...');
});


(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('İlk bağlantı sırasında hata oluştu:', err.message);
  }
})();

export default redisClient;