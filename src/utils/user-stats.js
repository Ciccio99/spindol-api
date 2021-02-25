// Reference streak calcs
// https://github.com/freeCodeCamp/freeCodeCamp/pull/5134/files
import moment from 'moment-timezone';
import { Cursor } from 'mongodb';

const daysBetween = 1.5;

const isValidDiary = (diary) => {
  if (!diary) {
    return false;
  }
  return diary.mood || (diary.diaryTags && diary.diaryTags.length > 0);
};

export function calcCurrentStreak(diaries) {
  const revDiaries = diaries.slice().reverse();

  if (
    revDiaries.length === 0
  ) {
    return 0;
  }


  const initIndex = isValidDiary(revDiaries[0]) ? 0 : 1;
  let streak = 0;

  for (let i = initIndex; i < revDiaries.length; i += 1) {
    const before = revDiaries[i === 0 ? 0 : i - 1];
    const current = revDiaries[i];
    if (
      moment.utc(before.date).diff(moment.utc(current.date), 'days', true)
        < daysBetween
      && isValidDiary(current)
    ) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function calcLongestStreak(diaries) {
  if (diaries.length === 0) {
    return 0;
  }

  let currStreak = 0;

  const longestStreak = diaries.reduce((longest, current, index) => {
    const before = diaries[index === 0 ? 0 : index - 1];
    if (
      moment.utc(current.date).diff(moment.utc(before.date), 'days', true) < daysBetween
      && isValidDiary(current)
    ) {
      currStreak += 1;
      if (currStreak > longest) {
        return currStreak;
      }
      return longest;
    }
    currStreak = 0;
    return longest;
  }, 0);

  return longestStreak;
}
