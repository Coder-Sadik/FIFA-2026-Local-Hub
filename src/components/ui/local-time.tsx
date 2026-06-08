'use client';

import { useEffect, useState } from 'react';
import { usePreferences } from '@/store/usePreferences';
import { formatToLocalTime } from '@/lib/timezone';
import { Skeleton } from './skeleton';

interface LocalTimeProps {
  dateString: string;
  format?: 'short' | 'long' | 'time';
  className?: string;
}

export function LocalTime({ dateString, format = 'long', className = '' }: LocalTimeProps) {
  const [mounted, setMounted] = useState(false);
  const { timezone } = usePreferences();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by showing a skeleton or a fallback
    return <Skeleton className="h-4 w-24 inline-block" />;
  }

  // Handle worldcup26.ir non-standard format if necessary, 
  // It returns dates like "06/11/2026 13:00". We must parse it carefully.
  // JS `new Date("06/11/2026 13:00")` parses to local time, but we assume it's UTC or Mexico/US time?
  // Since it's a fixed string without timezone, we need to treat it as UTC for conversion.
  let isoDate = dateString;
  if (!dateString.includes('T')) {
    // Convert "MM/DD/YYYY HH:mm" to "YYYY-MM-DDTHH:mm:00Z"
    const [datePart, timePart] = dateString.split(' ');
    if (datePart && timePart) {
      const [month, day, year] = datePart.split('/');
      isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00Z`;
    }
  }

  return (
    <span className={className}>
      {formatToLocalTime(isoDate, timezone, format)}
    </span>
  );
}
