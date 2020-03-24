import config from '../../config';
import User from '../../models/User';
import { ErrorHandler } from '../../utils/error';

const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // const token = req.header('Authorization').replace('Bearer ', '');
    const token = req.cookies[config.authCookieName];
    if (!token) {
      throw new ErrorHandler(401, 'Please Authenticate');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
    if (!user) {
      throw new ErrorHandler(401, 'Please Authenticate');
    }

    req.token = token;
    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
};

export default auth;
