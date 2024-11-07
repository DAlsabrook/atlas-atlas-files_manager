const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const getStatus = async (req, res) => {
  try {
    const redisIsAlive = await redisClient.isAlive();
    const dbIsAlive = dbClient.isAlive();
    res.status(200).send({ redis: redisIsAlive, db: dbIsAlive });
  } catch (error) {
    res.status(500).send({ error: 'Error getting status of redis and db' });
  }
};

const stats = async (req, res) => {
  try {
    dbClient.createUser();
    const numUsers = await dbClient.nbUsers();
    const numFiles = await dbClient.nbFiles();
    res.status(200).send({ users: numUsers, files: numFiles });
  } catch (error) {
    res.status(500).send({ error: 'Error getting stats' });
  }
};

module.exports = {
  getStatus,
  stats,
};
