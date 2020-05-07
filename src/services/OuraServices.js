import moment from 'moment-timezone';
import axios from 'axios';
import OauthServices from './OauthServices';
import SleepSummary from '../models/SleepSummary';
import Logger from '../loaders/logger';

const DEVICE_NAME = 'oura';

const getSleepSummary = async (user, date) => {
  if (!user) {
    throw new Error('User object is required');
  }
  await OauthServices.refreshDeviceToken(user, DEVICE_NAME);

  const searchDate = moment(date).format('YYYY-MM-DD');
  const { data } = await axios.get('https://api.ouraring.com/v1/sleep', {
    params: {
      start: searchDate,
      end: searchDate,
      access_token: user.accounts.oura.token.access_token,
    },
  });

  return data.sleep;
};

const getSleepSummaryHistory = async (user, date = undefined) => {
  if (!user) {
    throw new Error('User object is required');
  }
  await OauthServices.refreshDeviceToken(user, DEVICE_NAME);

  let searchDate;
  if (date) {
    searchDate = moment(date).format('YYYY-MM-DD');
  } else {
    searchDate = moment().subtract(3, 'months').format('YYYY-MM-DD');
  }

  const { data } = await axios.get('https://api.ouraring.com/v1/sleep', {
    params: {
      start: searchDate,
      access_token: user.accounts.oura.token.access_token,
    },
  });

  return data.sleep;
};

const syncSleepSummary = async (user, date = undefined) => {
  if (!user) {
    throw new Error('User object is required');
  }
  if (!user.accounts[DEVICE_NAME].connected) {
    throw new Error(`No accounts/device registered for ${DEVICE_NAME}`);
  }
  const limit = 1;
  const sort = { date: 'desc' };

  let startDate = date;

  if (!startDate) {
    await user.populate({
      path: 'sleepSummaries',
      options: { limit, sort },
    }).execPopulate();
    if (user.sleepSummaries.length > 0) {
      startDate = moment(user.sleepSummaries[0].date).add(1, 'day').format('YYYY-MM-DD');
    }
  }

  const sleepSummaries = await getSleepSummaryHistory(user, startDate);

  if (sleepSummaries.length === 0) {
    return;
  }

  // const timezoneMap = {};

  // const getTimezoneName = (offset) => {
  //   const stringNum = offset.toString(10);
  //   if (timezoneMap[stringNum]) return timezoneMap[stringNum];

  //   const offsetName = moment.tz.names().find((timezoneName) => {
  //     // eslint-disable-next-line no-underscore-dangle
  //     if (offset === moment.tz(timezoneName)._offset) {
  //       timezoneMap[offset.toString(10)] = timezoneName;
  //       return true;
  //     }
  //     return false;
  //   });
  //   return offsetName;
  // };

  let formattedDocuments = sleepSummaries.filter((summary) => summary.is_longest === 1);

  formattedDocuments = formattedDocuments.map((summary) => ({
    date: moment(summary.summary_date).toISOString(),
    // timezone: getTimezoneName(summary.timezone),
    timezoneOffset: summary.timezone,
    startDateTime: moment(summary.bedtime_start).toISOString(),
    endDateTime: moment(summary.bedtime_end).toISOString(),
    awakeDuration: summary.awake,
    lightSleepDuration: summary.light,
    deepSleepDuration: summary.deep,
    remSleepDuration: summary.rem,
    source: DEVICE_NAME,
    owner: user._id,
  }));

  const results = await SleepSummary.insertMany(formattedDocuments);
  Logger.info(`Completed syncing ${results.length} sleep summary documents from Oura for ${user.email}`);
};

export default {
  getSleepSummary,
  getSleepSummaryHistory,
  syncSleepSummary,
};
