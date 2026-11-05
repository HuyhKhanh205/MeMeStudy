import { useEffect, useRef, useState } from 'react';

/** 125 -> "02:05" */
export function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function secondsUntil(deadline: number): number {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

/**
 * Đếm ngược tới `deadline` (ISO string). Tính theo đồng hồ thật nên không bị trôi
 * khi app chạy nền. Gọi `onExpire` đúng một lần khi hết giờ.
 */
export function useCountdown(deadline: string | null, onExpire?: () => void) {
  const target = deadline ? new Date(deadline).getTime() : null;
  const [secondsLeft, setSecondsLeft] = useState(() => (target ? secondsUntil(target) : 0));
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (target == null) return;
    let fired = false;
    const tick = () => {
      const left = secondsUntil(target);
      setSecondsLeft(left);
      if (left === 0 && !fired) {
        fired = true;
        clearInterval(id);
        onExpireRef.current?.();
      }
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [target]);

  return { secondsLeft, label: formatSeconds(secondsLeft), isExpired: target != null && secondsLeft === 0 };
}
