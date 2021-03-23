import Pino from 'express-pino-logger';

const { NODE_ENV } = process.env;

// Add Middlewares
export const LogMiddleware = Pino({
  name: 'usersdata',
  enabled:
    NODE_ENV === 'production' ||
    NODE_ENV === 'development' ||
    NODE_ENV === 'test',

});


export const Log = LogMiddleware.logger;

const logLevel = process.env.LOG_LEVEL || 'info';
Log.level = logLevel;
