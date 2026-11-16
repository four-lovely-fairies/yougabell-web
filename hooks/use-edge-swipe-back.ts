"use client";

import { useEffect, useRef } from "react";

// 화면 왼쪽 가장자리에서 오른쪽으로 밀면 뒤로 가는 제스처 (iOS 기본 뒤로가기와 비슷하게).
// WebView가 네이티브 스와이프 백을 켜지 않았기 때문에 웹에서 직접 처리한다.
// - 화면(루트 프레임, [data-swipe-root])이 손가락을 따라 오른쪽으로 밀린다.
// - 충분히 밀었거나 빠르게 튕기면 화면을 끝까지 밀어낸 뒤 onBack을 호출한다.
// - 아니면 제자리로 돌아온다.
// 뒤로가기 버튼이 있는 헤더에서만 켠다. Android OS 뒤로가기 제스처는 웹에서 가로챌 수 없다.
const EDGE_WIDTH = 24; // 이 폭 안에서 시작한 터치만 스와이프 백으로 본다
const LOCK_DISTANCE = 10; // 이만큼 움직이면 가로/세로 방향을 확정
const COMPLETE_RATIO = 0.35; // 화면 폭의 이 비율 이상 밀면 뒤로 가기
const COMPLETE_VELOCITY = 0.5; // px/ms — 짧게 튕겨도 뒤로 가기
const SETTLE_MS = 220;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const getRoot = () => document.querySelector<HTMLElement>("[data-swipe-root]");

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function useEdgeSwipeBack(onBack: () => void, enabled = true) {
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!enabled) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let tracking = false; // 가장자리에서 시작한 터치
    let swiping = false; // 가로 스와이프로 확정
    let settling = false;

    const setTransform = (x: number, animate: boolean) => {
      const root = getRoot();
      if (!root) return;
      root.style.transition = animate
        ? `transform ${SETTLE_MS}ms ${EASE}, box-shadow ${SETTLE_MS}ms ${EASE}`
        : "none";
      root.style.transform = x > 0 ? `translate3d(${x}px, 0, 0)` : "";
      root.style.boxShadow = x > 0 ? "-8px 0 24px rgba(0, 0, 0, 0.08)" : "";
    };

    const reset = () => {
      const root = getRoot();
      if (!root) return;
      root.style.transition = "";
      root.style.transform = "";
      root.style.boxShadow = "";
      root.style.willChange = "";
    };

    const onStart = (e: TouchEvent) => {
      if (settling || e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (touch.clientX > EDGE_WIDTH) return;
      tracking = true;
      swiping = false;
      startX = lastX = touch.clientX;
      startY = touch.clientY;
      startTime = lastTime = e.timeStamp;
      velocity = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (!swiping) {
        if (Math.abs(dx) < LOCK_DISTANCE && Math.abs(dy) < LOCK_DISTANCE) {
          return;
        }
        // 세로로 더 움직였거나 왼쪽으로 밀면 일반 스크롤로 넘긴다.
        if (Math.abs(dy) > Math.abs(dx) || dx < 0) {
          tracking = false;
          return;
        }
        swiping = true;
        const root = getRoot();
        if (root) root.style.willChange = "transform";
      }

      e.preventDefault();
      const elapsed = e.timeStamp - lastTime;
      if (elapsed > 0) velocity = (touch.clientX - lastX) / elapsed;
      lastX = touch.clientX;
      lastTime = e.timeStamp;
      setTransform(Math.max(0, dx), false);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!swiping) return;
      swiping = false;

      const width = getRoot()?.offsetWidth ?? window.innerWidth;
      const dx = lastX - startX;
      const quickFlick =
        velocity > COMPLETE_VELOCITY && e2eDuration() < 400 && dx > 30;
      const shouldGoBack = dx > width * COMPLETE_RATIO || quickFlick;

      settling = true;
      if (!shouldGoBack) {
        setTransform(0, true);
        window.setTimeout(() => {
          reset();
          settling = false;
        }, SETTLE_MS);
        return;
      }

      if (reducedMotion()) {
        reset();
        settling = false;
        onBackRef.current();
        return;
      }

      setTransform(width, true);
      window.setTimeout(() => {
        onBackRef.current();
        // 다음 화면이 그려질 시간을 조금 준 뒤 프레임을 제자리로 되돌린다.
        window.setTimeout(() => {
          reset();
          settling = false;
        }, 60);
      }, SETTLE_MS);
    };

    const e2eDuration = () => lastTime - startTime;

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
      if (!settling) reset();
    };
  }, [enabled]);
}
