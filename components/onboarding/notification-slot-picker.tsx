"use client";

import { useState } from "react";
import { TimeBottomSheet } from "@/components/onboarding/time-bottom-sheet";
import {
  NOTIFICATION_SLOT_META,
  type NotificationPreference,
  type NotificationSlot,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const SLOTS: NotificationSlot[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
  "custom",
];

type Props = {
  value: NotificationPreference | null;
  onChange: (next: NotificationPreference) => void;
};

export function NotificationSlotPicker({ value, onChange }: Props) {
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);

  const select = (slot: NotificationSlot) => {
    if (slot === "custom") {
      const time = value?.slot === "custom" ? value.time : undefined;
      onChange({ slot: "custom", time });
      // Figma 2146:4582 — 직접 입력 선택 시 시간 휠 bottom sheet 자동 노출
      setTimeSheetOpen(true);
      return;
    }
    const meta = NOTIFICATION_SLOT_META[slot];
    const time = value?.slot === slot ? value.time : meta.defaultTime;
    onChange({ slot, time });
  };

  return (
    <div className="flex flex-col gap-3">
      {SLOTS.map((slot) => {
        const meta = NOTIFICATION_SLOT_META[slot];
        const selected = value?.slot === slot;
        return (
          <div key={slot} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => select(slot)}
              aria-pressed={selected}
              className={cn(
                "flex h-[61px] items-center gap-3 rounded-2xl border pl-3 pr-4 text-left transition-colors",
                selected
                  ? "border-[#b69cfe] bg-[#efe7ff]"
                  : "border-[#e9e9e9] bg-white hover:border-gray-300",
              )}
            >
              <span className="inline-flex size-7 shrink-0 items-center justify-center text-lg leading-none">
                {meta.emoji}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {meta.label}
                </span>
                <span className="text-xs text-gray-500">
                  {slot === "custom" && value?.slot === "custom" && value.time
                    ? `선택됨: ${value.time}`
                    : meta.sub}
                </span>
              </span>
            </button>

            {selected && slot !== "custom" && meta.chips ? (
              // Figma 2146:4703 — 칩: h-11 / rounded-[14px] / text-sm
              <div className="flex gap-2">
                {meta.chips.map((time) => {
                  const active = value?.time === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => onChange({ slot, time })}
                      className={cn(
                        "h-11 flex-1 rounded-[14px] border text-sm font-normal transition-colors",
                        active
                          ? "border-[#b69cfe] bg-[#efe7ff] text-gray-800"
                          : "border-[#e9e9e9] bg-white text-gray-800 hover:border-gray-300",
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}

      {timeSheetOpen && (
        <TimeBottomSheet
          initialTime={value?.slot === "custom" ? value.time : undefined}
          onClose={() => setTimeSheetOpen(false)}
          onConfirm={(time) => onChange({ slot: "custom", time })}
        />
      )}
    </div>
  );
}
