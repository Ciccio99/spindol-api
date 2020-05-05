import SleepSummary from '../models/SleepSummary';

export default {
  async getById(id) {
    const sleepSummary = await SleepSummary.findById(id);
    return sleepSummary;
  },
  async query(query) {
    const {
      match, sort, limit, skip,
    } = query;
    const sleepSummaries = await SleepSummary.find(match)
      .sort(sort)
      .limit(limit)
      .skip(skip);
    return sleepSummaries;
  },
  async create(dto) {
    const sleepSummary = new SleepSummary({ ...dto });
    await sleepSummary.save();
    return sleepSummary;
  },
  async update(dto) {
    const sleepSummary = await SleepSummary.findByIdAndUpdate(dto._id, { ...dto }, { new: true });
    return sleepSummary;
  },
};
