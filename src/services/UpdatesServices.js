import Tag from '../models/Tag';
import DailyDiary from '../models/DailyDiary';
import User from '../models/User';
import defaultTags from '../utils/constants/defaultTags';

export const convertUserTags = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    console.log('No user');
    return;
  }
  if (user.settings.updated) {
    console.log('Already updated');
    return;
  }
  const tagValues = defaultTags.concat(user.settings.tags);

  const tagsToConvert = tagValues.map((tag) => ({ tag, owner: user._id }));

  await Tag.insertMany(tagsToConvert, { });
  const userTags = await Tag.find({ owner: user._id });
  const tagMap = {};
  userTags.forEach((tag) => {
    tagMap[tag.tag] = tag._id;
  });
  const diaries = await DailyDiary.find({ owner: user._id, tags: { $exists: true, $ne: [] } });

  const bulkUpdate = diaries.map((diary) => {
    const diaryTags = diary.tags.reduce((tagsArr, tagValue) => {
      if (tagMap[tagValue]) {
        tagsArr.push(tagMap[tagValue]);
      }
      return tagsArr;
    }, []);
    return ({
      updateOne: {
        filter: { _id: diary._id },
        update: { diaryTags },
      },
    });
  });
  if (bulkUpdate.length > 0) {
    await DailyDiary.bulkWrite(bulkUpdate);
    console.log(`Tags for User (${user.email} updated!)`);
  }
  user.settings.updated = true;
  await user.save();
};

export const convertAllUserTags = async () => {
  const users = await User.find({});

  const promises = [];
  for (let i = 0; i < users.length; i += 1) {
    promises.push(convertUserTags(users[i]._id));
  }

  await Promise.all(promises);
};

export const removeDiaryTags = async () => {
  await DailyDiary.updateMany({}, { diaryTags: undefined });
};
