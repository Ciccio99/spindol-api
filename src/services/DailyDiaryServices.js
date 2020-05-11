import DailyDiary from '../models/DailyDiary';

export default {
  async create(dto, user) {
    const dailyDiary = new DailyDiary({ ...dto, owner: user._id });
    await dailyDiary.save();
    return dailyDiary;
  },
  async getById(id, user) {
    const dailyDiary = await DailyDiary.findOne({ _id: id, owner: user._id });
    return dailyDiary;
  },
  async query(query, user) {
    const {
      match, sort, limit, skip,
    } = query;
    await user.populate({
      path: 'dailyDiaries',
      match,
      options: { sort, skip, limit },
    }).execPopulate();

    return user.dailyDiaries;
  },
  async update(dto, user) {
    const dailyDiary = await DailyDiary
      .findOneAndUpdate({ _id: dto._id, owner: user._id }, { ...dto }, { new: true });
    return dailyDiary;
  },
  async upsert(dto, user) {
    const options = { new: true };
    const date = new Date(dto.date);

    const data = await DailyDiary.findOneAndUpdate(
      { date, owner: user._id },
      { ...dto },
      options,
    );

    if (!data) {
      const dailyDiary = new DailyDiary({ ...dto, owner: user._id });
      await dailyDiary.save();
      return dailyDiary;
    }

    return data;
  },
};
