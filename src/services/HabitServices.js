import mongoose from 'mongoose';
import moment from 'moment-timezone';
import Habit from '../models/Habit';
import { ErrorHandler } from '../utils/error';

const insert = async (dto) => {
  let habit = await Habit.findOne({
    owner: dto.owner,
    name: dto.name,
    active: true,
  });

  if (habit) {
    throw new ErrorHandler(400, 'That habit already exists and is active.');
  }

  habit = new Habit(dto);

  await habit.save();

  return habit;
};

const upsert = async (dto) => {
  let habit = await Habit.findOne({
    owner: dto.owner,
    name: dto.name,
    active: true,
  });

  if (habit) {
    const activeDate = moment(habit.startDate);
    const newHabitDate = moment.utc(dto.startDate);
    // If the date is the same, then update the same date habit with the new targetValue
    if (activeDate.isSame(newHabitDate, 'day')) {
      habit.targetValue = dto.targetValue;
      await habit.save();
      return habit;
    }
    // Otherwise, end the current habit and save it - then continue with creating the new habit
    habit.endDate = newHabitDate;
    habit.active = false;
    await habit.save();
  }

  habit = new Habit(dto);

  await habit.save();

  return habit;
};

const update = async (id, dto) => {
  const habit = await Habit
    .findOneAndUpdate({ _id: id, owner: dto.owner }, dto, { new: true, runValidators: true });

  return habit;
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

  const data = await Habit
    .find(query)
    .skip(skip)
    .limit(limit);

  return data;
};

export default {
  insert,
  upsert,
  update,
  get,
};
