const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const getStatus = async () => {
  const redisIsAlive = await redisClient.isAlive();
  const dbIsAlive = await dbClient.isAlive();
  return { 'redis': redisIsAlive, 'db': dbIsAlive }
};

const stats = async () => {
  const numUsers = await dbClient.nbUsers();
  const numFiles = await dbClient.nbfiles()
  return { "users": numUsers, "files": numFiles }
}

module.exports = {
  getStatus,
  stats
}
