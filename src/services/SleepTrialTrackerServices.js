import moment from 'moment-timezone';
import SleepTrialTracker from '../models/SleepTrialTracker';
import DailyDiaryServices from './DailyDiaryServices';
import { ErrorHandler } from '../utils/error';

const createSleepTrialTracker = async (dto, user) => {
  const existingTracker = await SleepTrialTracker.findOne({
    sleepTrial: dto.sleepTrial,
    owner: user._id,
  });

  if (existingTracker) {
    throw new ErrorHandler(409, 'Sleep trial tracker for this sleep trial already exists.');
  }

  const sleepTrialTracker = new SleepTrialTracker({ ...dto, owner: user._id });
  await sleepTrialTracker.save();
  await DailyDiaryServices.upsertSleepTrialTracker(sleepTrialTracker, user);
  await sleepTrialTracker.populate('sleepTrial').execPopulate();
  return sleepTrialTracker;
};

const getSleepTrialTracker = async (id, user) => {
  const sleepTrialTracker = await SleepTrialTracker
    .findOne({ _id: id, owner: user._id })
    .populate('sleepTrial');
  return sleepTrialTracker;
};

const querySleepTrialTracker = async (query, user) => {
  const {
    match, sort, limit, skip,
  } = query;
  await user.populate({
    path: 'sleepTrialTrackers',
    populate: { path: 'sleepTrial' },
    match,
    options: { sort, limit, skip },
  }).execPopulate();
  return user.sleepTrialTrackers;
};

const updateSleepTrialTracker = async (dto, user) => {
  const sleepTrialTracker = await SleepTrialTracker
    .findOneAndUpdate({ _id: dto._id, owner: user._id }, { ...dto }, { new: true });
  return sleepTrialTracker;
};

const upsertCheckIn = async (dto, user) => {
  const options = { new: true };
  const date = new Date(moment(dto.checkIn.date).startOf('day').format('YYYY-MM-DD'));

  let data = await SleepTrialTracker.findOneAndUpdate(
    {
      _id: dto._id,
      owner: user._id,
      'checkIns.date': { $ne: date },
    }, { $push: { checkIns: dto.checkIn } },
    options,
  );

  if (!data) {
    data = await SleepTrialTracker.findOneAndUpdate(
      {
        _id: dto._id,
        owner: user._id,
        'checkIns.date': date,
      }, { 'checkIns.$.completed': dto.checkIn.completed },
      options,
    );
  }
  await data.populate('sleepTrial').execPopulate();
  return data;
};

export default {
  createSleepTrialTracker,
  getSleepTrialTracker,
  querySleepTrialTracker,
  updateSleepTrialTracker,
  upsertCheckIn,
};
