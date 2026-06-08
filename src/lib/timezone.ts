export function formatToLocalTime(
  utcDateString: string | Date,
  timezone: string,
  formatStyle: 'short' | 'long' | 'time' = 'long'
): string {
  if (!utcDateString) return '';

  const date = new Date(utcDateString);

  // If the date is invalid, return original string or fallback
  if (isNaN(date.getTime())) return String(utcDateString);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
  };

  switch (formatStyle) {
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'short':
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'long':
    default:
      options.weekday = 'short';
      options.month = 'short';
      options.day = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }

  try {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (e) {
    // Fallback if timezone is somehow invalid
    return new Intl.DateTimeFormat('en-US').format(date);
  }
}

export const commonTimezones = [
  'Asia/Dhaka',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Africa/Johannesburg'
];
