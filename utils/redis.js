import { createClient } from "redis";

class RedisClient {
  constructor() {
    const client = createClient();
    client.on('error', err => console.log('Redis Constructor Client Error: ', err));
  }

  async IsAlive(self) {
    // Method to test if redis is able to be connected to
    // Returns true on connection and false when cannot connect

    try {
      await self.client.connect();
      // ping() returns the str "PONG" if it can connect
      const isConnected = await self.client.ping();
      return isConnected === 'PONG';
    } catch (err) {
      // Returns false if ping() can not connect
      return false;
    }
  }

  async get(self, key) {
    // Gets a value at a specific key from the cache
    if (typeof key !== 'string') {
      // key variable if not a string
      console.log('Redis get method key must be a string');
      return;
    }
    const value = await self.client.get(key);
    return value;
  }

}

module.exports = RedisClient;
