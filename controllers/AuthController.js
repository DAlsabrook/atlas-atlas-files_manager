const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).send('No Basic header');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');
    const hashedPassword = sha1(password);
    const userID = await dbClient.findUserByEmailAndPassowrd(email, hashedPassword);

    if (!userID) {
      return res.status(401).send('Unauthorized');
    }

    const token = uuidv4();
    const key = `auth_${token}`;

    const cacheCheck = redisClient.isAlive();
    if (!cacheCheck) {
      return res.status(400).send('Cache not connected')
    }

    redisClient.set(key, userID.toString(), 86400)

    return res.status(200).send({ "token": token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).send('Unauthorized: No X-Token in header')
    }

    const cacheCheck = redisClient.isAlive();
    if (!cacheCheck) {
      return res.status(400).send('Cache not connected')
    }

    const redisKey = `auth_${token}`
    const value = await redisClient.get(redisKey);
    if (!value) {
      return res.status(401).send('Unauthorized');
    }
    await redisClient.del(redisKey);
    return res.status(204).send();
  }
}

module.exports = AuthController;
