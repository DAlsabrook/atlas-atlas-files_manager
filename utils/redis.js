import { createClient } from "redis";

class RedisClient {
  // Uses the latest redis version

  constructor() {
    this.client = createClient();
    this.client.on('error', err => console.log('Redis Constructor Client Error: ', err));
  }

  async isAlive() {
    // Method to test if redis is able to be connected to
    // Returns true on connection and false when cannot connect
    try {
      await this.client.connect();
      // ping() returns the str "PONG" if it can connect
      const isConnected = await this.client.ping();
      console.log(isConnected)
      if (isConnected === 'PONG') {
        return true;
      };
    } catch (err) {
      // Returns false if ping() can not connect
      console.log(err)
      return false;
    }
  }

  async get(key) {
    // Gets a value at a specific key from the cache
    if (typeof key !== 'string') {
      // key variable is not a string
      console.log('Redis get method key must be a string');
      return;
    }

    const value = await this.client.get(key);
    return value;
  }

  async set(key, value, duration) {
    // Set a value with a duration in cache
    if (typeof key !== 'string') {
      // key variable is not a string
      console.log('Redis get method key must be a string');
      return;
    };

    try {
      await this.client.set(key, value);
      await this.client.expire(key, duration);
    } catch (err) {
      console.log('Error setting key in Redis:', err);
    }
  }

  async del(key) {
    // Remove a value from the cache
    if (typeof key !== 'string') {
      console.log('Redis del method key must be a string');
      return;
    }

    try {
      await this.client.del(key);
    } catch (err) {
      console.log('Error deleting key in Redis:', err);
    }
  }

  async flushAll() {
    try {
      await this.client.flushAll();
      console.log('All keys have been cleared from Redis');
    } catch (err) {
      console.log('Error clearing Redis cache:', err);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
