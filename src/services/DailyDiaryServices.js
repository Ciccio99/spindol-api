import moment from 'moment-timezone';
import DailyDiary from '../models/DailyDiary';
import SleepTrialTracker from '../models/SleepTrialTracker';

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
  const dailyDiary = await DailyDiary.findOne({ _id: id, owner: user._id });
  return dailyDiary;
};

const getReportingStreak = async (user) => {
  const dailyDiaries = await DailyDiary.find({ owner: user._id }).select('date mood').sort({ date: -1 });
  if (dailyDiaries.length === 0) {
    return 0;
  }
  let streak = dailyDiaries[0].mood ? 1 : 0;
  let date = moment.utc(dailyDiaries[0].date);

  for (let i = 1; i < dailyDiaries.length; i += 1) {
    const dd = dailyDiaries[i];
    const ddDate = moment.utc(dd);
    if (date.diff(ddDate, 'days') > 1 || !dd.mood) {
      break;
    }
    streak += 1;
    date = ddDate;
  }

  return streak;
};

const getByDate = async (date, user) => {
  const dd = await DailyDiary.findOne({ date, owner: user._id });
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
    }).execPopulate();

  return dd;
};

const query = async (queryObj, user) => {
  const {
    match, sort, limit, skip,
  } = queryObj;
  const dailyDiaries = await DailyDiary.find({ ...match, owner: user._id })
    .populate('sleepSummary')
    .populate({
      path: 'sleepTrialTrackers',
      populate: { path: 'sleepTrial' },
    })
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .exec();

  return dailyDiaries;
};

const update = async (dto, user) => {
  const dailyDiary = await DailyDiary.findOneAndUpdate(
    { _id: dto._id, owner: user._id },
    { ...dto }, { new: true },
  );
  return dailyDiary;
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
    }).execPopulate();


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

const insertTags = async (tags, id) => {
  const dd = await DailyDiary
    .findByIdAndUpdate(id, { $addToSet: { tags: { $each: tags } } }, { new: true });
  return dd.tags;
};

const removeTags = async (tags, id) => {
  const dd = await DailyDiary
    .findByIdAndUpdate(id, { $pull: { tags: { $in: tags } } }, { new: true });
  return dd.tags;
};

export default {
  create,
  getById,
  getByDate,
  getsertByDate,
  getReportingStreak,
  query,
  update,
  upsert,
  upsertSleepSummary,
  upsertSleepTrialTracker,
  insertTags,
  removeTags,
};
