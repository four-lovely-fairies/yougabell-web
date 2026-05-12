"use client";

import {
  TIME_SLOT_LABEL,
  TIME_SLOTS,
  WEEKDAY_LABEL,
  WEEKDAYS,
  type AppUsageSlot,
  type TimeSlot,
  type Weekday,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type AppUsageMatrixProps = {
  value: AppUsageSlot[];
  onChange: (next: AppUsageSlot[]) => void;
};

/**
 * 디자인 재검토 중 (2026-05-08). UX 과밀 → 새 안 수령 후 교체 예정.
 * 본 구현은 placeholder — 기능·필드 구성만 충족.
 */
export function AppUsageMatrix({ value, onChange }: AppUsageMatrixProps) {
  const has = (day: Weekday, slot: TimeSlot) =>
    value.some((v) => v.dayOfWeek === day && v.slot === slot);

  const toggle = (day: Weekday, slot: TimeSlot) => {
    onChange(
      has(day, slot)
        ? value.filter((v) => !(v.dayOfWeek === day && v.slot === slot))
        : [...value, { dayOfWeek: day, slot }],
    );
  };

  return (
    <div className="space-y-3">
      {WEEKDAYS.map((day) => (
        <div key={day} className="flex items-center gap-3">
          <div className="w-8 text-sm font-medium text-zinc-700">
            {WEEKDAY_LABEL[day]}
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => {
              const active = has(day, slot);
              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(day, slot)}
                  className={cn(
                    "h-8 px-3 rounded-full border text-xs transition-colors",
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
                  )}
                >
                  {TIME_SLOT_LABEL[slot]}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
