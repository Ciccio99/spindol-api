import DailyDiary from '../models/DailyDiary';
import SleepTrialTracker from '../models/SleepTrialTracker';
import { calcCurrentStreak, calcLongestStreak } from '../utils/user-stats';

const create = async (dto, user) => {
  // Get Sleep Summary Trackers
  let ssts = await SleepTrialTracker.find({
    active: true,
    owner: user._id,
    startDate: { $lte: dto.date },
    endDate: { $not: { $lt: dto.date } },
  }).select('_id').exec();
  ssts = ssts.map((sst) => sst._id);

  const dailyDiary = new DailyDiary({
    ...dto,
    sleepTrialTrackers: ssts,
    owner: user._id,
  });
  await dailyDiary.save();

  return dailyDiary;
};

const getById = async (id, user) => {
  const dailyDiary = await DailyDiary
    .findOne({ _id: id, owner: user._id })
    .populate({
      path: 'diaryTags',
      populate: { path: 'sleepTrial' },
    }).exec();
  return dailyDiary;
};

const getStreak = async (user) => {
  const dailyDiaries = await DailyDiary.find({ owner: user._id }).select('date mood diaryTags').sort({ date: 1 });
  const streak = calcCurrentStreak(dailyDiaries);
  const longestStreak = calcLongestStreak(dailyDiaries);
  return { streak, longestStreak };
};

const getByDate = async (date, user) => {
  const dd = await DailyDiary
    .findOne({ date, owner: user._id })
    .populate({
      path: 'diaryTags',
      populate: { path: 'sleepTrial' },
    }).exec();
  return dd;
};

const getsertByDate = async (date, user) => {
  let dd = await getByDate(date, user);
  if (!dd) {
    dd = await create({ date }, user);
  }

  await dd.populate('sleepSummary')
    .populate({
      path: 'sleepTrialTrackers',
      populate: { path: 'sleepTrial' },
    })
    .populate({
      path: 'diaryTags',
      populate: { path: 'sleepTrial' },
    })
    .execPopulate();

  return dd;
};

export const query = async (queryObj, user) => {
  const {
    match, sort, limit, skip,
  } = queryObj;
  const dailyDiaries = await DailyDiary.find({ ...match, owner: user._id })
    .populate('sleepSummary')
    .populate({
      path: 'diaryTags',
      populate: { path: 'sleepTrial' },
    })
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .exec();

  return dailyDiaries;
};

export const exportQuery = async (queryObj, user) => {
  const {
    match, sort, limit, skip,
  } = queryObj;
  const dailyDiaries = await DailyDiary.find({ ...match, owner: user._id })
    .populate('sleepSummary')
    .populate('diaryTags', '-_id tag')
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .exec();

  return dailyDiaries;
};


const update = async (dto, id) => {
  const dd = await DailyDiary
    .findByIdAndUpdate(id, dto, { new: true })
    .populate({
      path: 'diaryTags',
      populate: { path: 'sleepTrial' },
    })
    .exec();

  return dd;
};

const upsert = async (dto, user) => {
  const options = { new: true };
  const date = new Date(dto.date);

  let dd = await DailyDiary.findOneAndUpdate(
    { date, owner: user._id },
    { ...dto },
    options,
  );

  if (!dd) {
    dd = await create(dto, user);
  }

  await dd.populate('sleepSummary')
    .populate({
      path: 'sleepTrialTrackers',
      populate: { path: 'sleepTrial' },
    })
    .populate({
      path: 'diaryTags',
      populate: { path: 'sleepTrial' },
    })
    .execPopulate();


  return dd;
};

const upsertSleepSummary = async (ss, user) => {
  let dd = await getByDate(ss.date, user);
  if (dd) {
    dd.sleepSummary = ss._id;
    await dd.save();
  } else {
    dd = await create({ date: ss.date, sleepSummary: ss._id }, user);
  }
  return dd;
};

const upsertSleepTrialTracker = async (sst, user) => {
  let dd = await getByDate(sst.startDate, user);
  if (dd) {
    dd.sleepTrialTrackers.push(sst._id);
    await dd.save();
  } else {
    dd = await create({ date: sst.startDate }, user);
    if (!(dd.sleepTrialTrackers.includes(sst._id))) {
      dd.sleepTrialTrackers.push(sst._id);
      await dd.save();
    }
  }
  return dd;
};

const insertTags = async (id, tags) => {
  const dd = await DailyDiary
    .findByIdAndUpdate(id, { $addToSet: { diaryTags: { $each: tags } } }, { new: true })
    .populate({
      path: 'diaryTags',
      populate: { path: 'sleepTrial' },
    }).exec();
  return dd.diaryTags;
};

const removeTags = async (id, tags) => {
  const dd = await DailyDiary
    .findByIdAndUpdate(id, { $pull: { diaryTags: { $in: tags } } }, { new: true })
    .populate({
      path: 'diaryTags',
      populate: { path: 'sleepTrial' },
    }).exec();
  return dd.diaryTags;
};

export default {
  create,
  getById,
  getByDate,
  getsertByDate,
  getStreak,
  query,
  update,
  upsert,
  upsertSleepSummary,
  upsertSleepTrialTracker,
  insertTags,
  removeTags,
};
