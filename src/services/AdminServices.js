import config from '../config';
import UserUtil from '../utils/user';
import DailyReminderServices from './DailyReminderServices';
import UserServices from './UserServices';
import SleepSummary from '../models/SleepSummary';
import { ErrorHandler } from '../utils/error';

const jwt = require('jsonwebtoken');

export const generateInviteLink = async (email) => {
  const user = await UserUtil.getUserByEmail(email);
  if (user) {
    throw new ErrorHandler(400, `User (${email}) already exists.`);
  }

  const registerToken = jwt.sign(
    {
      email,
    },
    config.jwtSecret,
    {
      expiresIn: '7d',
    },
  );

  const link = `${config.frontEndUri}/register/${registerToken}`;

  return link;
};

export const updateUserPassword = async (email, newPassword) => {
  const user = await UserUtil.getUserByEmail(email);
  if (!user) {
    throw new ErrorHandler(400, `User (${email}) does not exit.`);
  }
  user.password = newPassword;
  user.tokens = [];
  await user.save();
};

const upsertRemindersHelper = async (user) => {
  const ss = await SleepSummary.findOne({ owner: user._id })
    .sort({ date: -1 })
    .limit(1);
  const timezoneOffset = ss ? ss.timezoneOffset : -300;
  const dueTime = 660 - timezoneOffset;
  const dto = {
    owner: user._id,
    deliveryType: 'email',
    dueTime,
    enable: true,
  };
  const reminder = await DailyReminderServices.upsert(dto);
  return reminder;
};

export const upsertDailyRemindersAllUsers = async () => {
  const users = await UserServices.get({});
  const reminders = [];
  for (let i = 0; i < users.length; i += 1) {
    reminders.push(upsertRemindersHelper(users[i]));
  }
  const results = await Promise.all(reminders);
  return results;
};
