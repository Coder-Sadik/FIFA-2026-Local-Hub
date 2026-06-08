'use client';

import { useEffect, useState } from 'react';
import { usePreferences } from '@/store/usePreferences';
import { formatToLocalTime } from '@/lib/timezone';
import { Skeleton } from './skeleton';

interface LocalTimeProps {
  date: string | Date;
  format?: 'short' | 'long' | 'time';
  stadiumId?: string;
  className?: string;
}

export function LocalTime({ date, format = 'long', stadiumId, className = '' }: LocalTimeProps) {
  const [mounted, setMounted] = useState(false);
  const { timezone } = usePreferences();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by showing a skeleton or a fallback
    return <Skeleton className="h-4 w-24 inline-block" />;
  }

  const formattedDate = formatToLocalTime(date, timezone, format, stadiumId);

  return (
    <span className={className}>
      {formattedDate}
    </span>
  );
}
