const redisClient = require('../utils/redis');
const db

const getStatus = () => {
  const redisIsAlive = redisClient.isAlive();
  const dbIsAlive =
};
