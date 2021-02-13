// Reference streak calcs
// https://github.com/freeCodeCamp/freeCodeCamp/pull/5134/files
import moment from 'moment-timezone';
import { dayCount } from './date-utils';

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
    || dayCount([moment.utc(), revDiaries[0].date]) > daysBetween
  ) {
    return 0;
  }

  const initIndex = isValidDiary(revDiaries[0]) ? 0 : 1;
  let streakIndex = initIndex;

  for (let i = initIndex; i < revDiaries.length; i += 1) {
    const before = revDiaries[i === 0 ? 0 : i - 1];
    const current = revDiaries[i];
    if (
      moment.utc(before.date).diff(moment.utc(current.date), 'days', true)
        < daysBetween
      && isValidDiary(current)
    ) {
      streakIndex = i;
    } else {
      break;
    }
  }

  const lastStreakDiary = revDiaries[streakIndex];
  return dayCount([revDiaries[initIndex].date, lastStreakDiary.date]);
}

export function calcLongestStreak(diaries) {
  if (diaries.length === 0) {
    return 0;
  }

  let tail = diaries[0];

  const longestDiaries = diaries.reduce(
    (longest, head, index) => {
      const last = diaries[index === 0 ? 0 : index - 1];
      if (
        moment(moment.utc(head.date)).diff(
          moment.utc(last.date),
          'days',
          true,
        ) > daysBetween
        || (!head.mood && (!head.diaryTags || head.diaryTags.length === 0))
      ) {
        tail = head;
      }
      if (
        dayCount(longest.map((d) => d.date)) < dayCount([head.date, tail.date])
      ) {
        return [head, tail];
      }
      return longest;
    },
    [diaries[0], diaries[0]],
  );

  return dayCount(longestDiaries.map((d) => d.date));
}
