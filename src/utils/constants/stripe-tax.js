/* eslint-disable import/prefer-default-export */
import config from '../../config';

export const STRIPE_TAX = config.stripe.env === 'production' ? {
  TAX_ID: 'txr_1IQJTVHTjrDKdTifLuFXrZuL',
} : {
  TAX_ID: 'txr_1IQHWoHTjrDKdTifTvzMQ8zu',
};
