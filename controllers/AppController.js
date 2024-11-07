const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const getStatus = async (req, res) => {
  try {
    const redisIsAlive = await redisClient.isAlive();

    console.log("redisIsAlive status:");
    console.log(redisIsAlive);

    const dbIsAlive = dbClient.isAlive();

    console.log("dbIsAlive status:");
    console.log(dbIsAlive);

    res.status(200).send({ redis: redisIsAlive, db: dbIsAlive });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
};

const stats = async (req, res) => {
  try {
    const numUsers = await dbClient.nbUsers();
    const numFiles = await dbClient.nbFiles();
    res.status(200).send({ users: numUsers, files: numFiles });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
};

module.exports = {
  getStatus,
  stats,
};
