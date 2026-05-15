"use client";

import { useState } from "react";
import { XIcon } from "@/components/icons";
import { Wheel } from "@/components/onboarding/wheel";
import { Button } from "@/components/ui/button";

type Period = "AM" | "PM";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,10,...,55
const PERIODS: readonly Period[] = ["AM", "PM"];

function parse24(time?: string) {
  if (!time) return { hour12: 9, minute: 0, period: "AM" as Period };
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;
  const period: Period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour12, minute: m, period };
}

function format24(hour12: number, minute: number, period: Period): string {
  const h =
    period === "AM"
      ? hour12 === 12
        ? 0
        : hour12
      : hour12 === 12
        ? 12
        : hour12 + 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

type Props = {
  initialTime?: string; // "HH:MM" 24h
  onClose: () => void;
  onConfirm: (time: string) => void;
};

/**
 * 시간 휠 bottom sheet — Figma 2146:4582.
 * 알림 시간대 "직접 입력" 카드 선택 시 노출. 시/분(5분 단위)/AM·PM 3컬럼.
 */
export function TimeBottomSheet({ initialTime, onClose, onConfirm }: Props) {
  const init = parse24(initialTime);
  const [hour12, setHour12] = useState(init.hour12);
  const [minute, setMinute] = useState(init.minute);
  const [period, setPeriod] = useState<Period>(init.period);

  const confirm = () => {
    onConfirm(format24(hour12, minute, period));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="time-sheet-title"
    >
      <div
        className="rounded-t-3xl bg-white pb-5 pt-7"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 pb-4">
          <h2 id="time-sheet-title" className="text-lg font-bold text-gray-800">
            시간대를 선택해 주세요
          </h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            <XIcon size={24} />
          </button>
        </header>

        <div className="flex items-center justify-center gap-2 py-5">
          <Wheel
            items={HOURS}
            value={hour12}
            onChange={setHour12}
            ariaLabel="시간"
            width={104}
          />
          <Wheel
            items={MINUTES}
            value={minute}
            onChange={setMinute}
            format={(n) => String(n).padStart(2, "0")}
            ariaLabel="분"
          />
          <Wheel
            items={PERIODS}
            value={period}
            onChange={setPeriod}
            ariaLabel="오전 / 오후"
          />
        </div>

        <div className="px-5 pt-2">
          <Button type="button" size="full" onClick={confirm}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
