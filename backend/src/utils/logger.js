const Log = require('../models/Log');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return `${timestamp} ${level}: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
});

const logger = createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

const logToDB = async (level, message, actionType, userId = null, metadata = {}) => {
  try {
    await Log.create({
      level,
      message,
      userId,
      actionType,
      metadata,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Failed to write to database log', { error: error.message });
  }
};

module.exports = {
  debug: (message, actionType = 'SYSTEM', userId = null, metadata = {}) => {
    logger.debug(message, { ...metadata });
    if (process.env.NODE_ENV !== 'test') {
      logToDB('debug', message, actionType, userId, metadata);
    }
  },
  info: (message, actionType = 'SYSTEM', userId = null, metadata = {}) => {
    logger.info(message, { ...metadata });
    if (process.env.NODE_ENV !== 'test') {
      logToDB('info', message, actionType, userId, metadata);
    }
  },
  warn: (message, actionType = 'SYSTEM', userId = null, metadata = {}) => {
    logger.warn(message, { ...metadata });
    if (process.env.NODE_ENV !== 'test') {
      logToDB('warn', message, actionType, userId, metadata);
    }
  },
  error: (message, actionType = 'SYSTEM', userId = null, metadata = {}) => {
    logger.error(message, { ...metadata });
    if (process.env.NODE_ENV !== 'test') {
      logToDB('error', message, actionType, userId, metadata);
    }
  }
};