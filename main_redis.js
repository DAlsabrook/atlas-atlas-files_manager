import redisClient from './utils/redis';

// Command to run this file
// npm run dev main_redis.js

(async () => {
  console.log('Testing if redis is alive');
  const isAlive = await redisClient.isAlive();
  console.log('Is Redis alive:', isAlive);

  console.log('Get a value');
  const value = await redisClient.get('myKey');
  console.log('Value:', value);

  console.log('Set a Value');
  await redisClient.set('myKey', 12, 5);
  const newValue = await redisClient.get('myKey');
  console.log('New Value:', newValue);

  setTimeout(async () => {
    const expiredValue = await redisClient.get('myKey');
    console.log('Value after expiration:', expiredValue);
    redisClient.flushAll();
  }, 1000 * 10);
})();
