const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      const existingUser = await dbClient.db
        .collection('users')
        .findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);
      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: hashedPassword,
      });

      return res.status(201).json({
        id: result.insertedId,
        email,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).send('Unauthorized: No X-Token in header')
    }

    const cacheCheck = redisClient.isAlive();
    if (!cacheCheck) {
      return res.status(400).send('Cache not connected')
    }

    const redisKey = `auth_${token}`
    const userID = await redisClient.get(redisKey);
    const user = await dbClient.findUserByID(userID);
    if (!userID || !user) {
      return res.status(401).send('Unauthorized');
    }
    
    const email = user.email;
    return res.status(200).send({ id: userID, email });
  }

}

module.exports = UsersController;

// 4ee6abe3-163e-4221-8e3a-1de9be066456

