import { useEffect, useState } from "react";

export default function useTimer({ time = 120,onTimerUp }) {
  const [timeLeft, setTimeLeft] = useState(time);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setIsRunning(false);
            if(onTimerUp) onTimerUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (time) => {
    const hour = Math.floor(time / 3600);
    const min = Math.floor((time % 3600) / 60);
    const sec = time % 60;
    return { hour, min, sec };
  };

  return { timeLeft:formatTime(timeLeft), setTimeLeft, isRunning, setIsRunning};
}
