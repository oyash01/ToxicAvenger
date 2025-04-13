const mongoose = require('mongoose');
const MongoUrl = require('../models/MongoUrl');
const logger = require('./logger');
const crypto = require('crypto');

class MongoHelper {
  async getMongoDbStats(mongoUrl) {
    try {
      // Decrypt URL
      const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'default-key');
      let decrypted = decipher.update(mongoUrl.urlHash, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      // Create new connection
      const conn = await mongoose.createConnection(decrypted, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      // Get database stats
      const stats = await conn.db.stats();
      
      // Close connection
      await conn.close();

      // Update connection status
      await MongoUrl.findByIdAndUpdate(mongoUrl._id, {
        lastConnectionStatus: 'success',
        lastChecked: new Date()
      });

      return {
        totalSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        collections: stats.collections,
        avgObjSize: stats.avgObjSize,
        objects: stats.objects
      };

    } catch (error) {
      logger.error(`MongoDB stats error: ${error.message}`, 'DATABASE');
      
      // Update connection status
      await MongoUrl.findByIdAndUpdate(mongoUrl._id, {
        lastConnectionStatus: 'failed',
        lastChecked: new Date()
      });

      throw new Error('Failed to get MongoDB statistics');
    }
  }

  async testConnection(mongoUrl) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'default-key');
      let decrypted = decipher.update(mongoUrl.urlHash, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const conn = await mongoose.createConnection(decrypted, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      await conn.close();
      return true;
    } catch (error) {
      logger.error(`MongoDB connection test error: ${error.message}`, 'DATABASE');
      return false;
    }
  }

  async getCollectionStats(mongoUrl, collectionName) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'default-key');
      let decrypted = decipher.update(mongoUrl.urlHash, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const conn = await mongoose.createConnection(decrypted, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      const stats = await conn.db.collection(collectionName).stats();
      await conn.close();

      return {
        size: stats.size,
        count: stats.count,
        avgObjSize: stats.avgObjSize,
        storageSize: stats.storageSize,
        nindexes: stats.nindexes,
        totalIndexSize: stats.totalIndexSize
      };

    } catch (error) {
      logger.error(`Collection stats error: ${error.message}`, 'DATABASE');
      throw new Error('Failed to get collection statistics');
    }
  }
}

module.exports = new MongoHelper();