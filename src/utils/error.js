import Logger from '../loaders/logger';

class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (err, req, res) => {
  const { message } = err;
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    Logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: statusCode === 500 ? 'Server Error' : message,
  });
};

export {
  ErrorHandler,
  handleError,
};
