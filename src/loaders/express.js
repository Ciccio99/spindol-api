import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from '../config';
import routes from '../api';
import Logger from './logger';
import { ErrorHandler, handleError } from '../utils/error';

const morgan = require('morgan');

export default ({ app }) => {
  // Load in morgan Req logger, Pass through Winston Stream
  app.use(morgan('combined', { stream: Logger.stream }));
  // Load in other middleware
  app.use(cors({
    credentials: true,
    origin: config.corsOrigin,
  }));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  /**
   * Health Check Endpoints
   */
  app.head('/', (req, res) => {
    res.status(200).end();
  });
  app.get('/status', (req, res) => {
    res.status(200).end();
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });
  app.options('/', (req, res) => {
    res.status(200).end();
  });

  // Load API Routes
  app.use(config.api.prefix, routes());

  // Catch 404 errors
  app.use((req, res, next) => {
    const error = new ErrorHandler(404, 'Not Found');
    next(error);
  });

  app.use((err, req, res, next) => {
    handleError(err, req, res);
  });
};
