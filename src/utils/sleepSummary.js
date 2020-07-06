import moment from 'moment-timezone';
import SleepSummary from '../models/SleepSummary';

const getSleepHoursDuration = (sleepSummary) => {
  const startDate = new Date(sleepSummary.startDateTime);
  const endDate = new Date(sleepSummary.endDateTime);
  const diffTime = Math.abs(endDate - startDate);
  let diffHours = diffTime / (1000 * 3600);
  if (sleepSummary.efficiency) {
    diffHours *= (sleepSummary.efficiency / 100);
  }
  return diffHours;
};

const getFatigueScore = async (date, user) => {
  const sleepDate24 = moment.utc(date);
  const sleepDate48 = moment.utc(date).subtract(1, 'day');
  const awakeDuration = 2;
  const sleep24 = await SleepSummary.findOne({ date: sleepDate24.format('YYYY-MM-DD'), owner: user._id });
  const sleep48 = await SleepSummary.findOne({ date: sleepDate48.format('YYYY-MM-DD'), owner: user._id });

  if (!sleep24 || !sleep48) {
    return -1;
  }
  const sleep24Dur = getSleepHoursDuration(sleep24);
  const sleep48Dur = getSleepHoursDuration(sleep48) + sleep24Dur;

  let score = 0;
  // Fatigue Score Calculation
  if (sleep24Dur < 7.5) {
    score += 4 * (7.5 - sleep24Dur);
  }
  if (sleep48Dur < 15) {
    score += 2 * (15 - sleep48Dur);
  }
  const extensionScore = awakeDuration - sleep48Dur;
  score += Math.max(0, extensionScore);

  // Normalize score
  const normScore = Math.min(score / 62, 1);
  const finalScore = 100 * normScore;
  return finalScore;
};

export default {
  getSleepHoursDuration,
  getFatigueScore,
};
