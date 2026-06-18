'use client';

import { useState, useEffect } from 'react';
import { getAbsoluteGameDate } from '@/lib/timezone';

interface CountdownTimerProps {
  dateStr: string; // MM/DD/YYYY HH:mm string from API
  stadiumId?: string;
}

export function CountdownTimer({ dateStr, stadiumId }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
    
    // Get the correct absolute date accounting for stadium timezone
    const targetDate = getAbsoluteGameDate(dateStr, stadiumId);

    let interval: ReturnType<typeof setInterval>;

    const updateCountdown = () => {
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft('Starting shortly');
        clearInterval(interval);
        return;
      }

      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        setTimeLeft(`Starts in ${diffDays}d ${diffHours % 24}h`);
      } else if (diffHours > 0) {
        setTimeLeft(`Starts in ${diffHours}h ${diffMins % 60}m`);
      } else if (diffMins > 0) {
        setTimeLeft(`Starting in ${diffMins} mins`);
      } else {
        setTimeLeft('Starting shortly');
      }
    };

    updateCountdown();
    interval = setInterval(updateCountdown, 60000); // update every minute

    return () => clearInterval(interval);
  }, [dateStr, stadiumId]);

  if (!mounted) return <span className="text-muted-foreground">Loading time...</span>;

  return <span className="font-semibold text-primary/80">{timeLeft}</span>;
}
