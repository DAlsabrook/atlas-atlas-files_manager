const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.log('Redis Client Error:', err));
    this.connected = false;
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }
  }

  async isAlive() {
    try {
      await this.connect();
      const isConnected = await this.client.ping();
      return isConnected === 'PONG';
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async get(key) {
    if (typeof key !== 'string') {
      console.log('Redis get method key must be a string');
      return;
    }

    await this.connect();
    const value = await this.client.get(key);
    return value;
  }

  async set(key, value, duration) {
    if (typeof key !== 'string') {
      console.log('Redis set method key must be a string');
      return;
    }

    try {
      await this.connect();
      await this.client.set(key, value);
      await this.client.expire(key, duration);
    } catch (err) {
      console.log('Error setting key in Redis:', err);
    }
  }

  async del(key) {
    if (typeof key !== 'string') {
      console.log('Redis del method key must be a string');
      return;
    }

    try {
      await this.connect();
      await this.client.del(key);
    } catch (err) {
      console.log('Error deleting key in Redis:', err);
    }
  }

  async flushAll() {
    try {
      await this.connect();
      await this.client.flushAll();
      console.log('All keys have been cleared from Redis');
    } catch (err) {
      console.log('Error clearing Redis cache:', err);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
