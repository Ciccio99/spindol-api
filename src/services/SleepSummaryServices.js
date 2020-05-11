import SleepSummary from '../models/SleepSummary';

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
    const sleepSummary = new SleepSummary({ ...dto, owner: user._id });
    await sleepSummary.save();
    return sleepSummary;
  },
  async update(dto, user) {
    const sleepSummary = await SleepSummary.findByIdAndUpdate(
      { _id: dto._id, owner: user._id },
      { ...dto }, { new: true },
    );
    return sleepSummary;
  },
};
