const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const getStatus = () => {
  const redisIsAlive = redisClient.isAlive();
  const dbIsAlive = dbClient.isAlive();
  return { 'redis': redisIsAlive, 'db': dbIsAlive }
};

const stats = () => {
  return { "users": dbClient.nbUsers, "files": dbClient.nbfiles }
}

module.exports = {
  getStatus,
  stats
}
