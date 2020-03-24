import appRoot from 'app-root-path';

const winston = require('winston');

const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    maxsize: 542880, // 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.json(),
    ),
  },
  console: {
    level: 'debug',
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.simple(),
    ),
  },
};

const transports = [];
transports.push(new winston.transports.Console(options.console));

if (process.env.NODE_ENV !== 'development') {
  transports.push(new winston.transports.File(options.file));
}

const Logger = winston.createLogger({
  transports,
  exitOnError: false,
});

Logger.stream = {
  write(message) {
    Logger.info(message);
  },
};

export default Logger;
