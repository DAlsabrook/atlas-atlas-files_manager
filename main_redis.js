import redisClient from './utils/redis';

(async () => {
  console.log('Testing if redis is alive');
  console.log(redisClient.isAlive());

  console.log('Get a value');
  console.log(await redisClient.get('myKey'));

  console.log('Set a Value');
  await redisClient.set('myKey', 12, 5);
  console.log(await redisClient.get('myKey'));

  setTimeout(async () => {
    console.log(await redisClient.get('myKey'));
  }, 1000 * 10)
})();
