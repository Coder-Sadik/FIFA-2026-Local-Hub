'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AutoRefreshProps {
  /** Normal polling interval in ms (default: 60 000). */
  interval?: number;
  /**
   * When `true`, the component also watches for the data to be empty and
   * triggers an early refresh after `emptyRetryDelay` ms.  Pass `true`
   * whenever the parent suspects the API returned 404 / no data.
   */
  triggerOnEmpty?: boolean;
  /** How long to wait before the empty-data early refresh (default: 5 000). */
  emptyRetryDelay?: number;
}

export function AutoRefresh({
  interval = 60_000,
  triggerOnEmpty = false,
  emptyRetryDelay = 5_000,
}: AutoRefreshProps) {
  const router = useRouter();
  const emptyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Normal polling refresh.
  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, interval);
    return () => clearInterval(id);
  }, [router, interval]);

  // Early refresh when data is empty (API is likely down / 404).
  useEffect(() => {
    if (triggerOnEmpty) {
      emptyTimerRef.current = setTimeout(() => {
        router.refresh();
      }, emptyRetryDelay);
    } else {
      if (emptyTimerRef.current) {
        clearTimeout(emptyTimerRef.current);
        emptyTimerRef.current = null;
      }
    }
    return () => {
      if (emptyTimerRef.current) clearTimeout(emptyTimerRef.current);
    };
  }, [router, triggerOnEmpty, emptyRetryDelay]);

  return null;
}

