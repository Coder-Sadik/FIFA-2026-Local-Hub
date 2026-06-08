export const STADIUM_OFFSETS: Record<string, number> = {
  '1': 6, '2': 6, '3': 6, // Mexico (UTC-6)
  '4': 5, '5': 5, '6': 5, // Central USA (UTC-5)
  '7': 4, '8': 4, '9': 4, '10': 4, '11': 4, '12': 4, // Eastern USA/CAN (UTC-4)
  '13': 7, '14': 7, '15': 7, '16': 7 // Pacific USA/CAN (UTC-7)
};

export function getAbsoluteGameDate(localDateStr: string | Date, stadiumId?: string): Date {
  if (localDateStr instanceof Date) return localDateStr;
  
  // If it's already an ISO string with T, parse it directly
  if (localDateStr.includes('T')) return new Date(localDateStr);

  try {
    // Expected format: "MM/DD/YYYY HH:mm"
    const [datePart, timePart] = localDateStr.split(' ');
    const [month, day, year] = datePart.split('/');
    
    // Default to UTC-4 if unknown stadium
    const offsetHours = (stadiumId && STADIUM_OFFSETS[stadiumId]) ? STADIUM_OFFSETS[stadiumId] : 4;
    const offsetString = `-${offsetHours.toString().padStart(2, '0')}:00`;
    
    const isoString = `${year}-${month}-${day}T${timePart}:00${offsetString}`;
    return new Date(isoString);
  } catch (e) {
    return new Date(localDateStr);
  }
}

export function formatToLocalTime(
  utcDateString: string | Date,
  timezone: string,
  formatStyle: 'short' | 'long' | 'time' = 'long',
  stadiumId?: string
): string {
  if (!utcDateString) return '';

  const date = getAbsoluteGameDate(utcDateString, stadiumId);

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
