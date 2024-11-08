const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static async getStatus(req, res) {
    try {
      const redisIsAlive = await redisClient.isAlive();
      const dbIsAlive = dbClient.isAlive();
      res.status(200).send({ redis: redisIsAlive, db: dbIsAlive });
    } catch (error) {
      res.status(500).send({ error: 'Error getting status of redis and db' });
    }
  }

  static async stats(req, res) {
    try {
      // Add a test user to the database
      // await dbClient.createUser();
      const numUsers = await dbClient.nbUsers();
      const numFiles = await dbClient.nbFiles();
      res.status(200).send({ users: numUsers, files: numFiles });
    } catch (error) {
      res.status(500).send({ error: 'Error getting stats' });
    }
  }
}

module.exports = AppController;
