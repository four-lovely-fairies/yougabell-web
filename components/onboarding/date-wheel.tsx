"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 40; // px — 한 항목 높이
const VISIBLE = 5; // 한 번에 보이는 라인 수
const CENTER_OFFSET = Math.floor(VISIBLE / 2); // 중앙 위·아래 buffer 칸 수

type Props = {
  items: number[];
  value: number;
  onChange: (next: number) => void;
  suffix?: string;
  width?: number;
  ariaLabel?: string;
};

/**
 * 휠 picker 단일 컬럼.
 * scroll-snap-y로 스크롤 위치가 항목에 snap. 정착(80ms) 후 인덱스 계산 → onChange.
 * - useLayoutEffect로 paint 직전 scrollTop 동기화 (initial mount 시 selected가 중앙에 보이도록 보장).
 * - 자체 setting으로 발생한 scroll 이벤트는 ignoreScrollRef로 차단 (false onChange 방지).
 * - 중앙 1 + 위 2 buffer + 아래 2 buffer = 5칸. selected는 컨테이너 정중앙.
 */
export function DateWheel({
  items,
  value,
  onChange,
  suffix = "",
  width = 80,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ignoreScrollRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const valueIndex = items.indexOf(value);
  const safeIndex = valueIndex >= 0 ? valueIndex : 0;

  // value 또는 items 변경 시 paint 직전 scrollTop을 selected 위치로 동기화.
  // useLayoutEffect는 mount 후 첫 paint 이전에 실행됨 → 사용자가 잘못된 위치를 보는 시점 없음.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = safeIndex * ITEM_HEIGHT;
    if (el.scrollTop !== target) {
      // 자체 scroll로 인한 spurious onChange를 차단
      ignoreScrollRef.current = true;
      el.scrollTop = target;
      // snap 정착·debounce 시간(80ms)보다 충분히 길게 두어 안전
      window.setTimeout(() => {
        ignoreScrollRef.current = false;
      }, 200);
    }
  }, [safeIndex]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      if (ignoreScrollRef.current) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(items.length - 1, idx));
        const next = items[clamped];
        if (next !== undefined && next !== value) onChange(next);
      }, 80);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => {
      el.removeEventListener("scroll", handler);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [items, value, onChange]);

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={ariaLabel}
      style={{ width, height: ITEM_HEIGHT * VISIBLE }}
      className="overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
    >
      {/* 상단 buffer — 첫 항목이 중앙에 올 수 있도록 위에 빈 공간 확보 */}
      <div style={{ height: ITEM_HEIGHT * CENTER_OFFSET }} aria-hidden />
      {items.map((item, i) => {
        const isSelected = i === safeIndex;
        return (
          <div
            key={item}
            role="option"
            aria-selected={isSelected}
            data-index={i}
            style={{ height: ITEM_HEIGHT }}
            className={cn(
              "snap-center flex items-center justify-center text-[20px] leading-none tabular-nums",
              isSelected
                ? "font-semibold text-gray-800"
                : "text-gray-400",
            )}
          >
            {item}
            {isSelected ? suffix : ""}
          </div>
        );
      })}
      {/* 하단 buffer — 마지막 항목이 중앙에 올 수 있도록 아래 빈 공간 확보 */}
      <div style={{ height: ITEM_HEIGHT * CENTER_OFFSET }} aria-hidden />
    </div>
  );
}

export const WHEEL_ITEM_HEIGHT = ITEM_HEIGHT;
export const WHEEL_VISIBLE = VISIBLE;
