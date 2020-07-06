import SleepSummary from '../models/SleepSummary';
import DailyDiaryServices from './DailyDiaryServices';

export default {
  async getById(id, user) {
    const sleepSummary = await SleepSummary.findOne({ _id: id, owner: user._id });
    return sleepSummary;
  },
  async query(query, user) {
    const {
      match, sort, limit, skip,
    } = query;
    await user.populate({
      path: 'sleepSummaries',
      match,
      options: { sort, skip, limit },
    }).execPopulate();
    return user.sleepSummaries;
  },
  async create(dto, user) {
    let sleepSummary = await SleepSummary.findOne({ date: dto.date, owner: user._id });
    if (sleepSummary) {
      throw new Error(`SleepSummary date duplicate - ${dto.date} - User - ${user.email}`);
    }
    sleepSummary = new SleepSummary({ ...dto, owner: user._id });
    await sleepSummary.save();
    await DailyDiaryServices.upsertSleepSummary(sleepSummary, user);
    return sleepSummary;
  },
  async createMany(sleepSummaryArr, user) {
    const sleepSummaries = sleepSummaryArr.map(async (ss) => {
      const sleepSummary = await this.create(ss, user);
      return sleepSummary;
    });
    return sleepSummaries;
  },
  async update(dto, user) {
    const sleepSummary = await SleepSummary.findByIdAndUpdate(
      { _id: dto._id, owner: user._id },
      { ...dto }, { new: true },
    );
    return sleepSummary;
  },
};
