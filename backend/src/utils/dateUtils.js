import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

export const getTimezone = (req) => {
  return (
    req?.query?.timezone ||
    req?.headers?.['x-timezone'] ||
    process.env.DEFAULT_TIMEZONE ||
    'Asia/Kolkata'
  );
};

/**
 * Returns exact start and end UTC Date objects for the given period in the specified timezone
 */
export const getPeriodBoundaries = (period, tz, refDate = new Date()) => {
  const localNow = dayjs(refDate).tz(tz);

  let start;
  let end;

  switch (period) {
    case 'today':
      start = localNow.startOf('day');
      end = localNow.endOf('day');
      break;
    case 'week':
      // ISO week starts on Monday and ends on Sunday
      start = localNow.startOf('isoWeek');
      end = localNow.endOf('isoWeek');
      break;
    case 'month':
      start = localNow.startOf('month');
      end = localNow.endOf('month');
      break;
    case 'year':
      start = localNow.startOf('year');
      end = localNow.endOf('year');
      break;
    default:
      start = localNow.startOf('day');
      end = localNow.endOf('day');
  }

  return {
    start: start.toDate(),
    end: end.toDate(),
    formattedStart: start.format(),
    formattedEnd: end.format()
  };
};

/**
 * Parses user provided startDate / endDate string in client timezone into UTC Dates
 */
export const parseDateRange = (startDateStr, endDateStr, tz) => {
  let dateFilter = {};

  if (startDateStr) {
    const start = dayjs.tz(startDateStr, tz).startOf('day').toDate();
    dateFilter.$gte = start;
  }

  if (endDateStr) {
    const end = dayjs.tz(endDateStr, tz).endOf('day').toDate();
    dateFilter.$lte = end;
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};

export { dayjs };
