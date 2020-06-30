import moment from 'moment-timezone';
import axios from 'axios';
import OauthServices from './OauthServices';
import SleepSummaryServices from '../services/SleepSummaryServices';
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
  const dataFields = 'wakeupduration,wakeupcount,snoringepisodecount,snoring,sleep_score,rr_min,rr_max,rr_average,remsleepduration,lightsleepduration,hr_min,hr_max,hr_average,durationtowakeup,durationtosleep,deepsleepduration,breathing_disturbances_intensity'
  const { data } = await axios.get('https://wbsapi.withings.net/v2/sleep', {
    headers: {
      Authorization: `Bearer ${user.accounts.oura.token.access_token}`,
    },
    params: {
      action,
      startdateymd: searchDate,
      enddateymd: searchDate,
      data_fields: dataFields,
      access_token: user.accounts.oura.token.access_token,
    },
  });

  return data;
};

const getSleepSummaryHistory = () => {

};

const syncSleepSummary = () => {

};

export default {
  getSleepSummary,
  getSleepSummaryHistory,
  syncSleepSummary,
};
