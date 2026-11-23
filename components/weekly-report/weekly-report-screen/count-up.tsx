"use client";

import { useEffect, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * 리포트 숫자(긍정률 92%, 1시간 17분 등)를 0부터 차르르 올려 보여준다.
 * 숫자가 아닌 값이거나 모션 줄이기 설정이면 그대로 보여준다.
 */
export const CountUp = ({
  value,
  duration = 900,
  delay = 0,
}: {
  value: string | number;
  duration?: number;
  delay?: number;
}) => {
  const target = typeof value === "number" ? value : Number(value);
  const animatable = Number.isFinite(target) && Number.isInteger(target);
  const [shown, setShown] = useState<number>(() =>
    animatable && !prefersReducedMotion() ? 0 : target,
  );

  useEffect(() => {
    if (!animatable || prefersReducedMotion()) return;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now + delay;
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animatable, target, duration, delay]);

  if (!animatable) return <>{value}</>;
  return <>{shown}</>;
};
