import config from '../config';
import UserUtil from '../utils/user';
import { ErrorHandler } from '../utils/error';

const jwt = require('jsonwebtoken');

export const generateInviteLink = async (email) => {
  const user = await UserUtil.getUserByEmail(email);
  if (user) {
    throw new ErrorHandler(400, `User (${email}) already exists.`);
  }

  const registerToken = jwt.sign({
    email,
  },
  config.jwtSecret,
  {
    expiresIn: '7d',
  });

  const link = `${config.frontEndUri}/register/${registerToken}`;

  return link;
};

export const test = async () => {

};
