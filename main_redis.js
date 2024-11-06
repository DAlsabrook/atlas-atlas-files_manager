import redisClient from './utils/redis';

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
  }, 1000 * 10);
})();
