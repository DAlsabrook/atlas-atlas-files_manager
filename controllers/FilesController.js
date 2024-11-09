const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

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
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
