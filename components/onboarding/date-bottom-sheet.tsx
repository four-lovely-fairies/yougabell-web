"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DateWheel, WHEEL_ITEM_HEIGHT, WHEEL_VISIBLE } from "./date-wheel";

type Props = {
  onClose: () => void;
  value?: string; // YYYY-MM-DD — mount 시 1회만 초기값으로 사용
  onConfirm: (iso: string) => void;
  yearMin?: number;
  yearMax?: number;
  /** value 없을 때 휠 시작 위치. 미지정 시 today를 [yearMin, yearMax]로 clamp. */
  defaultYear?: number;
  title?: string;
};

function range(start: number, endInclusive: number): number[] {
  const out: number[] = [];
  for (let v = start; v <= endInclusive; v++) out.push(v);
  return out;
}

function daysInMonth(year: number, month: number): number {
  // month 1-based
  return new Date(year, month, 0).getDate();
}

function toIso(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseIso(iso?: string): { y: number; m: number; d: number } | null {
  if (!iso) return null;
  const [ys, ms, ds] = iso.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d))
    return null;
  return { y, m, d };
}

/**
 * 사용 시 부모에서 conditional mount: `{open && <DateBottomSheet ... />}`
 * → 매 open마다 새 mount되어 props의 value를 초기값으로 받음 (effect 불필요).
 */
export function DateBottomSheet({
  onClose,
  value,
  onConfirm,
  yearMin = 1900,
  yearMax = new Date().getFullYear(),
  defaultYear,
  title = "생년월일을 선택하세요",
}: Props) {
  const initial = (() => {
    const v = parseIso(value);
    if (v) return v;
    const today = new Date();
    // value 없을 때 시작 위치:
    // 1) defaultYear 명시되어 있으면 그 값을 [yearMin, yearMax]로 clamp
    // 2) 아니면 today.getFullYear()를 동일하게 clamp
    //    → yearMax<today면 yearMax부터 보임 (1900 fallback 방지)
    const baseYear = defaultYear ?? today.getFullYear();
    const y = Math.min(yearMax, Math.max(yearMin, baseYear));
    return {
      y,
      m: today.getMonth() + 1,
      d: today.getDate(),
    };
  })();

  const [year, setYear] = useState(initial.y);
  const [month, setMonth] = useState(initial.m);
  const [day, setDay] = useState(initial.d);

  // day clamp는 핸들러에서 처리 (setState in effect 안티패턴 회피)
  const updateYear = (next: number) => {
    setYear(next);
    const max = daysInMonth(next, month);
    if (day > max) setDay(max);
  };
  const updateMonth = (next: number) => {
    setMonth(next);
    const max = daysInMonth(year, next);
    if (day > max) setDay(max);
  };

  // 모달 열림 동안 body 스크롤 잠금 — 마운트/언마운트로 entry/exit 보장
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const years = range(yearMin, yearMax);
  const months = range(1, 12);
  const days = range(1, daysInMonth(year, month));

  const confirm = () => {
    onConfirm(toIso(year, month, day));
    onClose();
  };

  // 휠 중앙 highlight band 위치
  const centerOffset = WHEEL_ITEM_HEIGHT * Math.floor(WHEEL_VISIBLE / 2);

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={title}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[32px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 pt-7 pb-4">
          <h2 className="text-[18px] font-bold leading-[1.4] text-gray-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="size-6 flex items-center justify-center text-gray-700"
          >
            <XIcon size={20} />
          </button>
        </header>

        <div className="px-6 pt-5 pb-7">
          <div className="relative flex justify-center items-center gap-2">
            {/* 중앙 selection band */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 bg-gray-50 rounded-md"
              style={{
                top: centerOffset,
                height: WHEEL_ITEM_HEIGHT,
              }}
            />
            <DateWheel
              ariaLabel="년"
              items={years}
              value={year}
              onChange={updateYear}
              suffix="년"
              width={104}
            />
            <DateWheel
              ariaLabel="월"
              items={months}
              value={month}
              onChange={updateMonth}
              suffix="월"
              width={80}
            />
            <DateWheel
              ariaLabel="일"
              items={days}
              value={day}
              onChange={setDay}
              suffix="일"
              width={80}
            />
          </div>
        </div>

        <div className="px-5 pb-5 pt-2">
          <Button type="button" size="full" onClick={confirm}>
            확인
          </Button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)] w-full" />
      </div>
    </div>
  );
}
