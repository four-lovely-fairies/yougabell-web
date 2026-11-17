"use client";

import { useEffect, useRef } from "react";

// 작은 Lottie 아이콘 (예: 연속 놀이 불꽃).
// - lottie-web의 light 빌드(SVG 전용)를 화면이 뜬 뒤에 불러와 첫 화면을 늦추지 않는다.
// - 동작 줄이기 설정이면 첫 프레임에서 멈춘 그림만 보여 준다.
// - 불러오기 전·실패 시에는 fallback(예: 이모지)을 그대로 보여 준다.
export function LottieIcon({
  src,
  className,
  fallback,
  label,
}: {
  /** public 아래 Lottie JSON 경로 */
  src: string;
  className?: string;
  fallback?: React.ReactNode;
  /** 스크린리더용 설명 (없으면 장식으로 숨김) */
  label?: string;
}) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const fallbackRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let cancelled = false;
    let destroy: (() => void) | null = null;

    void (async () => {
      try {
        const [{ default: lottie }, data] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          fetch(src).then((res) => {
            if (!res.ok) throw new Error(String(res.status));
            return res.json() as Promise<object>;
          }),
        ]);
        if (cancelled) return;
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        const anim = lottie.loadAnimation({
          container: box,
          renderer: "svg",
          loop: !reduced,
          autoplay: !reduced,
          animationData: data,
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
        });
        if (reduced) anim.goToAndStop(0, true);
        if (fallbackRef.current) fallbackRef.current.style.display = "none";
        destroy = () => anim.destroy();
      } catch {
        // 불러오기 실패 — fallback 유지
      }
    })();

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [src]);

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className ?? ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span ref={boxRef} className="absolute inset-0 [&_svg]:!h-full [&_svg]:!w-full" />
      {fallback ? (
        <span ref={fallbackRef} className="leading-none">
          {fallback}
        </span>
      ) : null}
    </span>
  );
}
