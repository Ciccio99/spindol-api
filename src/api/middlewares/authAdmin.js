import config from '../../config';
import User from '../../models/User';
import { ErrorHandler } from '../../utils/error';
import roles from '../../utils/roles';

const jwt = require('jsonwebtoken');

const authAdmin = async (req, res, next) => {
  try {
    const token = req.cookies[config.authCookieName];
    if (!token) {
      throw new ErrorHandler(401, 'Please Authenticate');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, role: roles.admin, 'tokens.token': token });
    if (!user) {
      throw new ErrorHandler(403, 'Access Forbidden');
    }

    req.token = token;
    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
};

export default authAdmin;
