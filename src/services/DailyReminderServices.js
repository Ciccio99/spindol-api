import mongoose from 'mongoose';
import DailyReminder from '../models/DailyReminder';
import { ErrorHandler } from '../utils/error';

const insert = async (dto) => {
  const reminder = new DailyReminder(dto);
  await reminder.save();
  return reminder;
};

const update = async (id, dto) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ErrorHandler(400, 'Must provide valid ID');
  }
  if (id !== dto._id) {
    throw new ErrorHandler(400, 'DTO id must match parameter resource id');
  }

  const reminder = await DailyReminder
    .findByIdAndUpdate(id, dto, { new: true });
  return reminder;
};

const get = async (query) => {
  let { skip, limit } = query;

  skip = skip ? Number(skip) : 0;
  limit = limit ? Number(limit) : 10;
  delete query.skip;
  delete query.limit;
  if (query._id) {
    try {
      query._id = new mongoose.mongo.ObjectID(query._id);
    } catch (error) {
      throw new ErrorHandler(400, 'Provided ID invalid');
    }
  }
  const data = await DailyReminder
    .find(query)
    .skip(skip)
    .limit(limit);

  return data;
};

export default {
  insert,
  get,
  update,
};
