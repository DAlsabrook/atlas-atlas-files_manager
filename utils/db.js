
const MongoClient = require('mongodb').MongoClient;

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || '27017';
        const database = process.env.DB_DATABASE || 'files_manager';
        // mongo server www.mongodb://localhost:27017
        const url = `mongodb://${host}:${port}`;

        this.client = new MongoClient(url, { useUnifiedTopology: true });
        this.db = null;
        this.connected = false;

        this.connectToDatabase(database);
    }

    async connectToDatabase(database) {
        try {
            await this.client.connect();
            this.db = this.client.db(database);
            this.connected = true;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            this.connected = false;
        }
    }

    isAlive() {
        return this.connected;
    }

    async nbUsers() {
        if (!this.isAlive()) return 0;
        try {
            const users = this.db.collection('users');
            return await users.countDocuments();
        } catch (error) {
            console.error('Error counting users:', error);
            return 0;
        }
    }

    async nbFiles() {
        if (!this.isAlive()) return 0;
        try {
            const files = this.db.collection('files');
            return await files.countDocuments();
        } catch (error) {
            console.error('Error counting files:', error);
            return 0;
        }
    }

    async createUser(user = {name: 'TestGuy123', email: 'testGuy123@blahblah.com'}) {
      if (!this.isAlive()) return 0;
      try {
        const users = this.db.collection('users');
        const result = await users.insertOne(user);
        return result.insertedCount;
      } catch (error) {
        console.error('Error creating user:', error);
        return 0;
      }
    }
}

const dbClient = new DBClient();
module.exports = dbClient;
