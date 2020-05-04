import moment from 'moment-timezone';
import SleepTrialTracker from '../models/SleepTrialTracker';
import { ErrorHandler } from '../utils/error';

const createSleepTrialTracker = async (dto) => {
  const existingTracker = await SleepTrialTracker.findOne({
    sleepTrial: dto.sleepTrial,
    owner: dto.owner,
  });

  if (existingTracker) {
    throw new ErrorHandler(409, 'Sleep trial tracker for this sleep trial already exists.');
  }

  const sleepTrialTracker = new SleepTrialTracker({ ...dto });
  await sleepTrialTracker.save();
  await sleepTrialTracker.populate('sleepTrial').execPopulate();
  return sleepTrialTracker;
};

const getSleepTrialTracker = async (id) => {
  const sleepTrialTracker = await SleepTrialTracker.findById(id).populate('sleepTrial');
  return sleepTrialTracker;
};

const querySleepTrialTracker = async (query) => {
  const {
    match, sort, limit, skip,
  } = query;

  const sleepTrialTrackers = await SleepTrialTracker.find(match)
    .populate('sleepTrial')
    .sort(sort)
    .limit(limit)
    .skip(skip);
  return sleepTrialTrackers;
};

const updateSleepTrialTracker = async (dto) => {
  const sleepTrialTracker = await SleepTrialTracker
    .findByIdAndUpdate(dto._id, { ...dto }, { new: true });
  return sleepTrialTracker;
};

const upsertCheckIn = async (dto) => {
  const options = { new: true };
  const date = new Date(moment(dto.checkIn.date).startOf('day').format('YYYY-MM-DD'));

  let data = await SleepTrialTracker.findOneAndUpdate(
    {
      _id: dto._id,
      'checkIns.date': { $ne: date },
    }, { $push: { checkIns: dto.checkIn } },
    options,
  );

  if (!data) {
    data = await SleepTrialTracker.findOneAndUpdate(
      {
        _id: dto._id,
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
