import { useEffect, useRef } from 'react';
import { todayDate } from '../utils/date';

export function useMidnightRollover(onRollover) {
  const lastTodayRef = useRef(todayDate());

  useEffect(() => {
    const checkNewDay = () => {
      const current = todayDate();
      const prev = lastTodayRef.current;
      if (current.getTime() === prev.getTime()) return;

      const dayDelta = Math.round((current - prev) / 864e5);
      const monthDelta =
        (current.getFullYear() - prev.getFullYear()) * 12 +
        current.getMonth() -
        prev.getMonth();

      lastTodayRef.current = current;
      onRollover({ dayDelta, monthDelta });
    };

    const intervalId = setInterval(checkNewDay, 30 * 1000);
    const handleVisibility = () => {
      if (!document.hidden) checkNewDay();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkNewDay);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkNewDay);
    };
  }, [onRollover]);
}