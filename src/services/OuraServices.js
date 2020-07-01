import moment from 'moment-timezone';
import axios from 'axios';
import OauthServices from './OauthServices';
import SleepSummaryServices from './SleepSummaryServices';
import Logger from '../loaders/logger';
import { ErrorHandler } from '../utils/error';

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
    searchDate = moment.utc(date).format('YYYY-MM-DD');
  } else {
    searchDate = moment.utc().subtract(1, 'months').format('YYYY-MM-DD');
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
    throw new ErrorHandler(400, `No accounts/device registered for ${DEVICE_NAME}`);
  }
  const limit = 1;
  const sort = { date: 'desc' };

  let startDate = date;

  try {
    if (!startDate) {
      await user.populate({
        path: 'sleepSummaries',
        options: { limit, sort },
      }).execPopulate();
      if (user.sleepSummaries.length > 0) {
        // startDate = moment.utc(user.sleepSummaries[0].date).add(1, 'day').format('YYYY-MM-DD');
        startDate = moment.utc(user.sleepSummaries[0].date).format('YYYY-MM-DD');
      }
    }

    const sleepSummaries = await getSleepSummaryHistory(user, startDate);

    if (sleepSummaries.length === 0) {
      Logger.info(`No data to sync from Oura for ${user.email}`);
      return;
    }

    let formattedDocuments = sleepSummaries.filter((summary) => summary.is_longest === 1);

    formattedDocuments = formattedDocuments.map((summary) => ({
      date: moment.utc(summary.summary_date).add(1, 'day').toISOString(),
      timezoneOffset: summary.timezone,
      startDateTime: moment.utc(summary.bedtime_start).toISOString(),
      endDateTime: moment.utc(summary.bedtime_end).toISOString(),
      awakeDuration: summary.awake,
      lightSleepDuration: summary.light,
      deepSleepDuration: summary.deep,
      remSleepDuration: summary.rem,
      efficiency: summary.efficiency,
      source: DEVICE_NAME,
      owner: user._id,
    }));

    const results = await SleepSummaryServices.createMany(formattedDocuments, user);
    Logger.info(`Completed syncing ${results.length} sleep summary documents from Oura for ${user.email}`);
  } catch (error) {
    Logger.error(error);
  }
};

export default {
  getSleepSummary,
  getSleepSummaryHistory,
  syncSleepSummary,
};
