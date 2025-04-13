const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const MongoUrl = require('../models/MongoUrl');
const Log = require('../models/Log');
const logger = require('../utils/logger');
const mongoHelper = require('../utils/mongoHelper');

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      Log.countDocuments(),
      ApiKey.countDocuments({ isActive: true }),
      MongoUrl.countDocuments({ isActive: true })
    ]);

    // Get recent system activity
    const recentLogs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'username');

    res.json({
      totalUsers: stats[0],
      totalLogs: stats[1],
      activeApiKeys: stats[2],
      activeMongoUrls: stats[3],
      recentActivity: recentLogs
    });
  } catch (error) {
    logger.error(`Admin dashboard stats error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error(`Get users error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-deactivation
    if (req.user.id === id && !isActive) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();

    logger.info(`User updated: ${user.username}`, 'USER_UPDATE', req.user.id);

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`User deleted: ${user.username}`, 'USER_DELETE', req.user.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      startDate, 
      endDate, 
      level, 
      actionType,
      userId 
    } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (level) query.level = level;
    if (actionType) query.actionType = actionType;
    if (userId) query.userId = userId;

    const logs = await Log.find(query)
      .populate('userId', 'username')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Log.countDocuments(query);

    res.json({
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error(`Get logs error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

exports.getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find()
      .select('-keyHash')
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(apiKeys);
  } catch (error) {
    logger.error(`Get API keys error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error fetching API keys' });
  }
};

exports.addApiKey = async (req, res) => {
  try {
    const { name, key, description } = req.body;

    const apiKey = await ApiKey.create({
      name,
      keyHash: key,
      description,
      createdBy: req.user.id
    });

    logger.info(`API key added: ${name}`, 'API_KEY_CREATE', req.user.id);

    res.status(201).json({
      message: 'API key added successfully',
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        description: apiKey.description,
        isActive: apiKey.isActive
      }
    });
  } catch (error) {
    logger.error(`Add API key error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error adding API key' });
  }
};

exports.updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const apiKey = await ApiKey.findByIdAndUpdate(
      id,
      {
        name,
        description,
        isActive,
        updatedBy: req.user.id
      },
      { new: true }
    ).select('-keyHash');

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    logger.info(`API key updated: ${name}`, 'API_KEY_UPDATE', req.user.id);

    res.json({
      message: 'API key updated successfully',
      apiKey
    });
  } catch (error) {
    logger.error(`Update API key error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error updating API key' });
  }
};

exports.deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findByIdAndDelete(id);
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    logger.info(`API key deleted: ${apiKey.name}`, 'API_KEY_DELETE', req.user.id);

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    logger.error(`Delete API key error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error deleting API key' });
  }
};

exports.getMongoUrls = async (req, res) => {
  try {
    const mongoUrls = await MongoUrl.find()
      .select('-urlHash')
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(mongoUrls);
  } catch (error) {
    logger.error(`Get MongoDB URLs error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error fetching MongoDB URLs' });
  }
};

exports.addMongoUrl = async (req, res) => {
  try {
    const { name, url, description } = req.body;

    // Test connection before saving
    const testConn = await mongoHelper.testConnection({ urlHash: url });
    if (!testConn) {
      return res.status(400).json({ message: 'Invalid MongoDB URL' });
    }

    const mongoUrl = await MongoUrl.create({
      name,
      urlHash: url,
      description,
      createdBy: req.user.id
    });

    logger.info(`MongoDB URL added: ${name}`, 'MONGO_URL_CREATE', req.user.id);

    res.status(201).json({
      message: 'MongoDB URL added successfully',
      mongoUrl: {
        id: mongoUrl._id,
        name: mongoUrl.name,
        description: mongoUrl.description,
        isActive: mongoUrl.isActive
      }
    });
  } catch (error) {
    logger.error(`Add MongoDB URL error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error adding MongoDB URL' });
  }
};

exports.updateMongoUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const mongoUrl = await MongoUrl.findByIdAndUpdate(
      id,
      {
        name,
        description,
        isActive,
        updatedBy: req.user.id
      },
      { new: true }
    ).select('-urlHash');

    if (!mongoUrl) {
      return res.status(404).json({ message: 'MongoDB URL not found' });
    }

    logger.info(`MongoDB URL updated: ${name}`, 'MONGO_URL_UPDATE', req.user.id);

    res.json({
      message: 'MongoDB URL updated successfully',
      mongoUrl
    });
  } catch (error) {
    logger.error(`Update MongoDB URL error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error updating MongoDB URL' });
  }
};

exports.deleteMongoUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const mongoUrl = await MongoUrl.findByIdAndDelete(id);
    if (!mongoUrl) {
      return res.status(404).json({ message: 'MongoDB URL not found' });
    }

    logger.info(`MongoDB URL deleted: ${mongoUrl.name}`, 'MONGO_URL_DELETE', req.user.id);

    res.json({ message: 'MongoDB URL deleted successfully' });
  } catch (error) {
    logger.error(`Delete MongoDB URL error: ${error.message}`, 'ADMIN');
    res.status(500).json({ message: 'Error deleting MongoDB URL' });
  }
};