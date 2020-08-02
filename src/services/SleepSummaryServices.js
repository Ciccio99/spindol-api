import mongoose from 'mongoose';
import SleepSummary from '../models/SleepSummary';
import DailyDiaryServices from './DailyDiaryServices';
import { ErrorHandler } from '../utils/error';

const getById = async (id, user) => {
  const sleepSummary = await SleepSummary.findOne({ _id: id, owner: user._id });
  return sleepSummary;
};

const query = async (queryString, user) => {
  const {
    match, sort, limit, skip,
  } = queryString;
  await user.populate({
    path: 'sleepSummaries',
    match,
    options: { sort, skip, limit },
  }).execPopulate();
  return user.sleepSummaries;
};

const get = async (queryDto) => {
  let { skip, limit } = queryDto;

  skip = skip ? Number(skip) : 0;
  limit = limit ? Number(limit) : 0;
  delete queryDto.skip;
  delete queryDto.limit;

  if (queryDto._id) {
    try {
      queryDto._id = new mongoose.mongo.ObjectID(queryDto._id);
    } catch (error) {
      throw new ErrorHandler(400, 'Provided ID invalid');
    }
  }

  const data = await SleepSummary
    .find(queryDto)
    .skip(skip)
    .limit(limit);

  return data;
};

const create = async (dto, user) => {
  let sleepSummary = await SleepSummary.findOne({ date: dto.date, owner: user._id });
  if (sleepSummary) {
    throw new Error(`SleepSummary date duplicate - ${dto.date} - User - ${user.email}`);
  }
  sleepSummary = new SleepSummary({ ...dto, owner: user._id });
  await sleepSummary.save();
  await DailyDiaryServices.upsertSleepSummary(sleepSummary, user);
  return sleepSummary;
};

const createMany = async (sleepSummaryArr, user) => {
  const sleepSummaries = sleepSummaryArr.map(async (ss) => {
    const sleepSummary = await this.create(ss, user);
    return sleepSummary;
  });
  return sleepSummaries;
};
const update = async (dto, user) => {
  const sleepSummary = await SleepSummary.findByIdAndUpdate(
    { _id: dto._id, owner: user._id },
    { ...dto }, { new: true },
  );
  return sleepSummary;
};

export default {
  getById,
  query,
  create,
  createMany,
  update,
  get,
};
