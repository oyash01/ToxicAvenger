const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || '';

  // Log request start
  logger.info(`Incoming ${method} ${originalUrl} from ${ip}`, {
    method,
    url: originalUrl,
    ip,
    userAgent,
    body: method !== 'GET' ? req.body : undefined
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    logger.info(`${method} ${originalUrl} ${statusCode} - ${duration}ms`, {
      method,
      url: originalUrl,
      status: statusCode,
      duration,
      ip,
      userAgent
    });
  });

  next();
};

module.exports = requestLogger;