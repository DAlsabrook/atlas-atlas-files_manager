const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const mime = require('mime-types');

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cacheCheck = redisClient.isAlive();
      if (!cacheCheck) return res.status(400).send('Cache not connected');

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, type, parentId, isPublic, data } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      let parentIdObj = null;
      if (parentId) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }

        parentIdObj = ObjectId(parentId);
      }

      const fileData = {
        userId: ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentIdObj || 0,
      };

      if (type === 'folder') {
        const result = await dbClient.db.collection('files').insertOne(fileData);
        const file = {
          id: result.insertedId.toString(),
          ...fileData,
        };
        return res.status(201).json(file);
      } else {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        fs.mkdirSync(folderPath, { recursive: true });

        const localPath = path.join(folderPath, uuidv4());
        const decodedData = Buffer.from(data, 'base64');

        await fs.writeFileSync(localPath, decodedData);

        fileData.localPath = localPath;

        const result = await dbClient.db.collection('files').insertOne(fileData);
        const file = {
          id: result.insertedId.toString(),
          ...fileData,
        };
        return res.status(201).json(file);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: `Internal Server ${error}` });
    }
  }

  static async getShow(req, res) {
    try {
      const token = req.headers['x-token'];

      const cacheCheck = redisClient.isAlive();
      if (!cacheCheck) return res.status(400).send('Cache not connected');

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const file = await dbClient.db.collection('files').findOne({
        _id: ObjectId(req.params.id),
        userId: ObjectId(userId)
      });

      if (!file) return res.status(404).json({ error: 'Not found' });

      return res.json(file);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    try {
      const token = req.headers['x-token'];

      const cacheCheck = redisClient.isAlive();
      if (!cacheCheck) return res.status(400).send('Cache not connected');

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const page = parseInt(req.query.page) || 0;
      const files = await dbClient.db.collection('files')
        .aggregate([
          {
            $match: {
              userId: ObjectId(userId),
              parentId: req.query.parentId ? ObjectId(req.query.parentId) : 0
            }
          },
          { $skip: page * 20 },
          // 20 page limit set here, which I believe is working
          { $limit: 20 }
        ]).toArray();

      return res.json(files);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    try {
      const token = req.headers['x-token'];

      const cacheCheck = redisClient.isAlive();
      if (!cacheCheck) return res.status(400).send('Cache not connected');

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const fileId = req.params.id;

      // find the file
      const file = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId)
      });

      if (!file) {
        return res.status(404).json({ error: 'Not Found' });
      }

      // update the found file
      const updateResult = await dbClient.db.collection('files').updateOne(
        {
          _id: ObjectId(fileId),
          userId: ObjectId(userId)
        },
        {
          $set: { isPublic: true }
        }
      );

      if (updateResult.modifiedCount === 0) {
        return res.status(500).json({ error: 'Failed to update the document' });
      }

      // get the new updated file to return
      const updatedFile = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId)
      });

      return res.status(200).json({ updatedFile });
    } catch (error) {
      console.error('Error updating document:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putUnpublish(req, res) {
    try {
      const token = req.headers['x-token'];

      const cacheCheck = redisClient.isAlive();
      if (!cacheCheck) return res.status(400).send('Cache not connected');

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const fileId = req.params.id;

      // Find the file
      const file = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId)
      });

      if (!file) {
        return res.status(404).json({ error: 'Not Found' });
      }

      // update the found file
      const updateResult = await dbClient.db.collection('files').updateOne(
        {
          _id: ObjectId(fileId),
          userId: ObjectId(userId)
        },
        {
          $set: { isPublic: false }
        }
      );

      if (updateResult.modifiedCount === 0) {
        return res.status(500).json({ error: 'Failed to update the document' });
      }

      // get the new updated file to return
      const updatedFile = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId)
      });

      return res.status(200).json({ updatedFile });
    } catch (error) {
      console.error('Error updating document:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getFile(req, res) {
    try {
      const token = req.headers['x-token'];

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const fileId = req.params.id;
      console.log(fileId)

      // Find the file
      const file = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId),
        isPublic: true
      });
      console.log(file)
      if (!file) {
        return res.status(404).json({ error: 'Not Found' });
      } else if (file.type === 'folder') {
        return res.status(400).json({
          error: "A folder doesn't have content"
        })
      }

      const filePath = path.join(__dirname, 'files', file.localPath);
      // Method is breaking here because the file does exists locally but the task makes you check if the file is local or not
      // Makes no sense because we are storing it in a db but im too tired to figure it out. Looking tomorrow
      // check if the file exists locally
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Not Found' });
      }

      const mimeType = mime.lookup(file.name);
      const fileContent = fs.readFileSync(filePath);
      res.setHeader('Content-Type', mimeType);

      return res.status(200).send(fileContent);
    } catch (error) {
      console.error('Error getting document:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
