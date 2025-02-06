import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  startTime: Date;
  endTime: Date;
}

export function useCountdownTimer({ startTime, endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const remaining = end - now;
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    // Reset timer when endTime changes
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const remaining = end - now;
    setTimeLeft(remaining > 0 ? remaining : 0);

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        const newTimeLeft = Math.max(0, new Date(endTime).getTime() - Date.now());
        if (newTimeLeft === 0) {
          clearInterval(timer);
        }
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    isExpired: timeLeft === 0,
    timeLeft
  };
}