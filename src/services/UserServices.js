import mongoose from 'mongoose';
import User from '../models/User';
import { ErrorHandler } from '../utils/error';
import config from '../config';
import EmailServices from './EmailServices';

const jwt = require('jsonwebtoken');

const get = async (query) => {
  let { skip, limit } = query;

  skip = skip ? Number(skip) : 0;
  limit = limit ? Number(limit) : 0;
  delete query.skip;
  delete query.limit;

  if (query._id) {
    try {
      query._id = new mongoose.mongo.ObjectID(query._id);
    } catch (error) {
      throw new ErrorHandler(400, 'Provided ID invalid');
    }
  }

  const data = await User
    .find(query)
    .skip(skip)
    .limit(limit);

  return data;
};

const userLogin = async (userDTO) => {
  const user = await User.findByCredentials(userDTO.email, userDTO.password);
  const token = await user.generateAuthToken();

  return { user, token };
};

const userRemoveToken = async (user, userToken) => {
  user.tokens = await user.tokens.filter((token) => token.token !== userToken);

  await user.save();
};

const userLogout = async (user, userToken) => {
  user.tokens = await user.tokens.filter((token) => token.token !== userToken);

  await user.save();
};

const userRegister = async (userDTO) => {
  const {
    email, name, password, confirmPassword, token: registerToken,
  } = userDTO;

  if (config.register.mode === 'invite-only' && !registerToken) {
    throw new ErrorHandler(400, 'Invalid registration token. User registration limited to invite only.');
  }

  if (registerToken) {
    let decoded;
    try {
      decoded = jwt.verify(registerToken, config.jwtSecret);
    } catch (error) {
      throw new ErrorHandler(400, 'Invalid registration token.');
    }
    if (userDTO.email.toLowerCase() !== decoded.email.toLowerCase()) {
      throw new ErrorHandler(400, 'Invalid registration token.'
        + ' Please acquire a valid registration token.'
        + ' If you believe this is a mistake, please email contact@sleepwell.ai for help.');
    }
  }


  const currentUser = await User.findOne({ email });

  if (currentUser) {
    throw new ErrorHandler(400, 'A user with that email already exists.');
  }

  if (password !== confirmPassword) {
    throw new ErrorHandler(400, 'Passwords must match.');
  }

  if (!name) {
    throw new ErrorHandler(400, 'Must include your fullname.');
  }

  const user = new User({ email, name, password });
  await user.save();
  const token = await user.generateAuthToken();
  EmailServices.sendWelcomeEmail(user.email, user.name);
  EmailServices.registerMarketingRecipient(user.email, user.name);

  return { user, token };
};

const userEdit = async (user, userDTO) => {
  const allowedUpdates = ['name', 'email', 'password', 'currentPassword', 'confirmPassword'];

  let updates = Object.keys(userDTO);
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new ErrorHandler(400, `Invalid update parameters sent. Currently accepting ${allowedUpdates.join(', ')}`);
  }

  if (userDTO.password !== userDTO.confirmPassword) {
    throw new ErrorHandler(400, 'Passwords must match.');
  }

  if (userDTO.password) {
    if (!(await user.checkPassword(userDTO.currentPassword))) {
      throw new ErrorHandler(400, 'Current password is invalid.');
    } else if (await user.checkPassword(userDTO.password)) {
      throw new ErrorHandler(400, 'New password cannot match current password.');
    } else {
      updates = updates.filter((update) => update !== 'currentPassword' || update !== 'confirmPassword');
    }
  }

  updates.forEach((update) => {
    user[update] = userDTO[update];
  });

  const editedUser = await user.save();

  return editedUser;
};

const userDelete = async (user) => {
  await user.remove();
};

const usersGet = async () => {
  const users = await User.find({ active: true });
  return users;
};

const getUser = async (_id) => {
  const user = await User.findById(_id);
  return user;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const setDeviceToken = async (user, device, token) => {
  if (!user) {
    throw new Error('User object is required');
  }
  if (!device) {
    throw new Error('Missing device to save token towards. [oura, withings, fitbit]');
  }

  user.accounts[device].token = { ...token };
  user.accounts[device].connected = true;

  await user.save();
};

const insertTags = async (tags, user) => {
  user.settings.tags = [...new Set(tags)];
  await user.save();

  return user.settings.tags;
};


const upsertTags = async (tags, user) => {
  let added = [];

  if (user.settings.tags && user.settings.tags.length) {
    added = user.settings.tags.addToSet(...tags);
  } else {
    added = [...new Set(tags)];
    user.settings.tags = added;
  }

  await user.save();

  return user.settings.tags;
};

const removeTags = async (tags, user) => {
  user.settings.tags = user.settings.tags
    .filter((tag) => !tags.includes(tag));

  await user.save();

  return user.settings.tags;
};

export default {
  get,
  userLogin,
  userLogout,
  userRemoveToken,
  userRegister,
  userEdit,
  userDelete,
  usersGet,
  setDeviceToken,
  getUser,
  getUserByEmail,
  insertTags,
  upsertTags,
  removeTags,
};
