import moment from 'moment-timezone';
import axios from 'axios';
import OauthServices from './OauthServices';
import SleepSummaryServices from './SleepSummaryServices';
import Logger from '../loaders/logger';
import { ErrorHandler } from '../utils/error';

const DEVICE_NAME = 'withings';

const getSleepSummary = async (user, date) => {
  if (!user) {
    throw new Error('User object is required');
  }
  await OauthServices.refreshDeviceToken(user, DEVICE_NAME);

  const searchDate = moment(date).format('YYYY-MM-DD');
  const action = 'getsummary';
  const dataFields = 'wakeupduration,wakeupcount,snoringepisodecount,snoring,sleep_score,rr_min,rr_max,rr_average,remsleepduration,lightsleepduration,hr_min,hr_max,hr_average,durationtowakeup,durationtosleep,deepsleepduration,breathing_disturbances_intensity';
  const { data } = await axios.get('https://wbsapi.withings.net/v2/sleep', {
    headers: {
      Authorization: `Bearer ${user.accounts.withings.token.access_token}`,
    },
    params: {
      action,
      startdateymd: searchDate,
      enddateymd: searchDate,
      data_fields: dataFields,
    },
  });

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.body.series) {
    throw new Error('Failed to get series data from withings.');
  }

  return data.body.series;
};

const getSleepSummaryHistory = async (user, date = undefined) => {
  if (!user) {
    throw new Error('User object is required');
  }
  await OauthServices.refreshDeviceToken(user, DEVICE_NAME);

  const action = 'getsummary';
  const dataFields = 'wakeupduration,wakeupcount,snoringepisodecount,snoring,sleep_score,rr_min,rr_max,rr_average,remsleepduration,lightsleepduration,hr_min,hr_max,hr_average,durationtowakeup,durationtosleep,deepsleepduration,breathing_disturbances_intensity';

  let searchDate;
  if (date) {
    searchDate = moment.utc(date).unix();
  } else {
    searchDate = moment.utc().subtract(1, 'months').unix();
  }

  const { data } = await axios.get('https://wbsapi.withings.net/v2/sleep', {
    headers: {
      Authorization: `Bearer ${user.accounts.withings.token.access_token}`,
    },
    params: {
      action,
      data_fields: dataFields,
      lastupdate: searchDate,
    },
  });

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.body.series) {
    throw new Error('Failed to get series data from withings.');
  }

  return data.body.series;
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
        startDate = moment.utc(user.sleepSummaries[0].date).format('YYYY-MM-DD');
      }
    }

    const sleepSummaries = await getSleepSummaryHistory(user, startDate);

    if (sleepSummaries.length === 0) {
      Logger.info(`No data to sync from Oura for ${user.email}`);
      return;
    }


    const formattedDocuments = sleepSummaries.map((summary) => {
      const totalSleep = summary.data.wakeupduration
        + summary.data.lightsleepduration
        + summary.data.deepsleepduration
        + summary.data.remsleepduration;
      const efficiency = Math.round(
        ((totalSleep - summary.data.wakeupduration) / totalSleep) * 100,
      );
      const timezoneOffset = moment.tz(moment.utc(), summary.timezone).utcOffset();

      return {
        date: moment.utc(summary.date).toISOString(),
        timezoneOffset,
        startDateTime: moment.utc(summary.startdate * 1000).toISOString(),
        endDateTime: moment.utc(summary.enddate * 1000).toISOString(),
        awakeDuration: summary.data.wakeupduration,
        lightSleepDuration: summary.data.lightsleepduration,
        deepSleepDuration: summary.data.deepsleepduration,
        remSleepDuration: summary.data.remsleepduration,
        efficiency,
        wakeUpCount: summary.data.wakeupcount,
        hrMin: summary.data.hr_min,
        hrAverage: summary.data.hr_average,
        hrMax: summary.data.hr_max,
        rrMin: summary.data.rr_min,
        rrMax: summary.data.rr_max,
        breathingDisturbancesIntensity: summary.data.breathing_disturbances_intensity,
        snoringDuration: summary.data.snoring,
        snoringCount: summary.data.snoringepisodecount,
        source: DEVICE_NAME,
        owner: user._id,
      };
    });

    if (formattedDocuments.length === 0) {
      Logger.info(`Completed syncing 0 sleep summary documents from Withings for ${user.email}`);
      return;
    }
    const results = await SleepSummaryServices.createMany(formattedDocuments, user);
    Logger.info(`Completed syncing ${results.length} sleep summary documents from Withings for ${user.email}`);
  } catch (error) {
    Logger.error(error);
  }
};

export default {
  getSleepSummary,
  getSleepSummaryHistory,
  syncSleepSummary,
};
