
const { MongoClient, ObjectId } = require('mongodb');

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || '27017';
        const database = process.env.DB_DATABASE || 'files_manager';
        // mongo server www.mongodb://localhost:27017
        // const url = `mongodb://${host}:${port}`;
        const url = "mongodb+srv://admin:admin@cluster0.3x22f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

    async findUserByEmailAndPassowrd(email, hashedPassword) {
      try {
        const user = await this.db.collection('users').findOne({email: email, password: hashedPassword});
        return user ? user._id : null;
      } catch (error) {
        console.error('Error finding user in DB');
      }
    }

  async findUserByID(ID) {
    try {
      const user = await this.db.collection('users').findOne({ _id: new ObjectId(ID) });
      return user;
    } catch (error) {
      console.error('Error finding user in DB:', error);
      return null;
    }
  }


  async getAllUsers() {
    if (!this.isAlive()) return [];
    try {
      const users = this.db.collection('users');
      return await users.find({}).toArray();
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
