"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 40;
const VISIBLE = 5;
const CENTER_OFFSET = Math.floor(VISIBLE / 2);

type Props<T extends string | number> = {
  items: readonly T[];
  value: T;
  onChange: (next: T) => void;
  format?: (item: T) => string;
  width?: number;
  ariaLabel?: string;
};

/**
 * 휠 picker generic 컬럼. 시/분/AM·PM 등 다양한 타입 지원.
 * DateWheel(number 전용)에서 추출한 동작 로직 — scroll-snap + paint-before sync + 자체 스크롤 ignore.
 */
export function Wheel<T extends string | number>({
  items,
  value,
  onChange,
  format = (v) => String(v),
  width = 80,
  ariaLabel,
}: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const ignoreScrollRef = useRef(false);
  const firstSyncRef = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const valueIndex = items.indexOf(value);
  const safeIndex = valueIndex >= 0 ? valueIndex : 0;

  // 첫 sync는 instant, 이후 외부 변경(클릭 등)은 smooth scroll로 부드럽게 한 칸씩 이동.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = safeIndex * ITEM_HEIGHT;
    if (el.scrollTop === target) return;
    ignoreScrollRef.current = true;
    if (firstSyncRef.current) {
      el.scrollTop = target;
      firstSyncRef.current = false;
    } else {
      el.scrollTo({ top: target, behavior: "smooth" });
    }
    window.setTimeout(() => {
      ignoreScrollRef.current = false;
    }, 400);
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
      className="no-scrollbar relative snap-y snap-mandatory scroll-smooth overflow-y-scroll"
    >
      <div style={{ height: ITEM_HEIGHT * CENTER_OFFSET }} aria-hidden />
      {items.map((item, i) => {
        const isSelected = i === safeIndex;
        // 선택 항목에서 멀어질수록 점차 옅어지는 휠 picker fade (Figma 2146:4582)
        const distance = Math.abs(i - safeIndex);
        const tone =
          distance === 0
            ? "font-medium text-gray-800"
            : distance === 1
              ? "text-gray-500"
              : "text-gray-300";
        return (
          <button
            key={String(item)}
            type="button"
            role="option"
            aria-selected={isSelected}
            data-index={i}
            // 보이는 항목 클릭 시 그 값으로 변경 → smooth scroll로 정렬
            onClick={() => {
              if (item !== value) onChange(item);
            }}
            style={{ height: ITEM_HEIGHT }}
            className={cn(
              "flex w-full snap-center items-center justify-center text-[20px] leading-none tabular-nums outline-none",
              tone,
              !isSelected && "cursor-pointer",
            )}
          >
            {format(item)}
          </button>
        );
      })}
      <div style={{ height: ITEM_HEIGHT * CENTER_OFFSET }} aria-hidden />
    </div>
  );
}
