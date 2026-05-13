"use client";

import { useRef } from "react";
import {
  FaceIcon,
  MoonIcon,
  StarsNightIcon,
  SunIcon,
  SunriseIcon,
} from "@/components/icons";
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

function SlotIcon({ slot }: { slot: NotificationSlot }) {
  switch (slot) {
    case "morning":
      return <SunriseIcon size={22} />;
    case "afternoon":
      return <SunIcon size={22} />;
    case "evening":
      return <MoonIcon size={22} />;
    case "night":
      return <StarsNightIcon size={22} />;
    case "custom":
      return <FaceIcon size={22} />;
  }
}

type Props = {
  value: NotificationPreference | null;
  onChange: (next: NotificationPreference) => void;
};

export function NotificationSlotPicker({ value, onChange }: Props) {
  const customRef = useRef<HTMLInputElement>(null);

  const select = (slot: NotificationSlot) => {
    if (slot === "custom") {
      const time = value?.slot === "custom" ? value.time : undefined;
      onChange({ slot: "custom", time });
      customRef.current?.focus();
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
                "flex items-center gap-3 h-[61px] px-4 rounded-l border transition-colors text-left",
                selected
                  ? "border-primary-300 bg-primary-50"
                  : "border-gray-200 bg-white hover:border-gray-300",
              )}
            >
              <span className="inline-flex items-center justify-center size-7 shrink-0">
                <SlotIcon slot={slot} />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {meta.label}
                </span>
                <span className="text-xs text-gray-500">{meta.sub}</span>
              </span>
            </button>

            {selected && slot !== "custom" && meta.chips ? (
              <div className="flex gap-2">
                {meta.chips.map((time) => {
                  const active = value?.time === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => onChange({ slot, time })}
                      className={cn(
                        "flex-1 h-10 rounded-s border text-xs font-medium transition-colors",
                        active
                          ? "border-primary-300 bg-primary-50 text-gray-800"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {selected && slot === "custom" ? (
              <input
                ref={customRef}
                type="time"
                value={value?.time ?? ""}
                onChange={(e) =>
                  onChange({ slot: "custom", time: e.target.value })
                }
                className="h-12 px-4 rounded-m border border-gray-200 bg-white text-gray-800 focus:border-primary-500 outline-none"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
