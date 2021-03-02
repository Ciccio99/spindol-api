import moment from 'moment-timezone';

export function dayCount([head, tail]) {
  return Math.ceil(
    moment(moment.utc(head).startOf('day')).diff(moment.utc(tail).startOf('day'), 'days', true),
  );
}
