"use client";

import { useEffect, useRef, useState } from "react";

// 문서(body) 스크롤 기준 커스텀 당겨서새로고침.
// 네이티브/브라우저 기본 PTR은 globals.css의 overscroll-behavior로 끄고,
// 최상단에서 아래로 당기면 거리(distance)를 노출해 헤더 밑에 스피너를 그린다.
// preventDefault를 쓰지 않아 일반 스크롤을 건드리지 않는다.
const THRESHOLD = 70; // 이 거리 이상 당기고 놓으면 새로고침
const MAX_PULL = 110; // 시각적 최대 당김
const RESISTANCE = 0.5; // 당김 저항(고무줄 느낌)

export type PullToRefresh = {
  /** 현재 당겨진 시각 거리(px) */
  distance: number;
  /** 새로고침 진행 중 */
  refreshing: boolean;
  /** 트리거 임계 거리 */
  threshold: number;
};

export function usePullToRefresh(
  onRefresh: () => void | Promise<void>,
  enabled = true,
): PullToRefresh {
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefreshRef = useRef(onRefresh);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
    enabledRef.current = enabled;
  });

  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);
  const distanceRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const setDist = (d: number) => {
      distanceRef.current = d;
      setDistance(d);
    };

    const onStart = (e: TouchEvent) => {
      if (!enabledRef.current || refreshingRef.current) return;
      if (window.scrollY > 0 || e.touches.length !== 1) {
        startYRef.current = null;
        return;
      }
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = false;
    };

    const onMove = (e: TouchEvent) => {
      if (refreshingRef.current || startYRef.current === null) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy <= 0 || window.scrollY > 0) {
        if (pullingRef.current) {
          pullingRef.current = false;
          setDist(0);
        }
        return;
      }
      pullingRef.current = true;
      setDist(Math.min(MAX_PULL, dy * RESISTANCE));
    };

    const onEnd = () => {
      if (refreshingRef.current) return;
      const pulled = pullingRef.current;
      startYRef.current = null;
      pullingRef.current = false;

      if (pulled && distanceRef.current >= THRESHOLD) {
        refreshingRef.current = true;
        setRefreshing(true);
        setDist(THRESHOLD);
        void Promise.resolve(onRefreshRef.current()).finally(() => {
          refreshingRef.current = false;
          setRefreshing(false);
          setDist(0);
        });
      } else {
        setDist(0);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  return { distance, refreshing, threshold: THRESHOLD };
}
