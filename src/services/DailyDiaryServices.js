import DailyDiary from '../models/DailyDiary';

export default {
  async create(dto) {
    const dailyDiary = new DailyDiary({ ...dto });
    await dailyDiary.save();
    return dailyDiary;
  },
  async getById(id) {
    const dailyDiary = await DailyDiary.findById(id);
    return dailyDiary;
  },
  async query(query) {
    const {
      match, sort, limit, skip,
    } = query;
    const dailyDiarys = await DailyDiary.find(match)
      .sort(sort)
      .limit(limit)
      .skip(skip);
    return dailyDiarys;
  },
  async update(dto) {
    const dailyDiary = await DailyDiary
      .findByIdAndUpdate(dto._id, { ...dto }, { new: true });
    return dailyDiary;
  },
  async upsert(dto) {
    const options = { new: true };
    const date = new Date(dto.date);

    let data = await DailyDiary.findOneAndUpdate(
      { date },
      { ...dto },
      options,
    );

    if (!data) {
      const dailyDiary = new DailyDiary({ ...dto });
      await dailyDiary.save();
      data = { ...dailyDiary };
    }

    return data;
  },
};
