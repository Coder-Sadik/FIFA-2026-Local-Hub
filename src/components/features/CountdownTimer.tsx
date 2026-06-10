'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  dateStr: string; // MM/DD/YYYY HH:mm string from API
}

export function CountdownTimer({ dateStr }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Parse the date (assume UTC for now as per worldcup26 logic)
    const [datePart, timePart] = dateStr.split(' ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    
    // Create Date object assuming the input is UTC
    const targetDate = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute));

    const updateCountdown = () => {
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft('Starting shortly');
        return;
      }

      const diffMins = Math.floor(diffMs / 1000 / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        setTimeLeft(`Starts in ${diffDays}d ${diffHours % 24}h`);
      } else if (diffHours > 0) {
        setTimeLeft(`Starts in ${diffHours}h ${diffMins % 60}m`);
      } else {
        setTimeLeft(`Starting in ${diffMins} mins`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // update every minute

    return () => clearInterval(interval);
  }, [dateStr]);

  if (!mounted) return <span className="text-muted-foreground">Loading time...</span>;

  return <span className="font-semibold text-primary/80">{timeLeft}</span>;
}
