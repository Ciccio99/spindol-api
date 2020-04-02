import mongoose from 'mongoose';
import Logger from '../loaders/logger';

class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (err, req, res) => {
  if (err instanceof mongoose.Error.ValidationError) {
    err.statusCode = 400;
  }
  if (err.name === 'MongoError' && err.code === 11000) {
    err.statusCode = 400;
    err.message = 'Duplicate found. Cannot have more than one.';
  }
  const { message } = err;
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    Logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack Trace - ${err.stack}`);
  } else {
    Logger.info(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack Trace - ${err.stack}`);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: statusCode === 500 ? 'Server Error' : message,
    details: err.details,
  });
};

export {
  ErrorHandler,
  handleError,
};
