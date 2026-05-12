"use client";

import { useMemo } from "react";

type DateTripleProps = {
  value?: string; // "YYYY-MM-DD"
  onChange: (iso: string) => void;
  yearMin?: number;
  yearMax?: number;
};

function parseValue(value: string | undefined) {
  if (!value) return { year: "", month: "", day: "" };
  const [y, m, d] = value.split("-");
  return { year: y ?? "", month: m ?? "", day: d ?? "" };
}

function toIso(year: string, month: string, day: string): string | null {
  if (!year || !month || !day) return null;
  const y = year.padStart(4, "0");
  const m = month.padStart(2, "0");
  const d = day.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateTriple({
  value,
  onChange,
  yearMin = 1900,
  yearMax = new Date().getFullYear(),
}: DateTripleProps) {
  const parsed = useMemo(() => parseValue(value), [value]);

  const update = (next: Partial<typeof parsed>) => {
    const merged = { ...parsed, ...next };
    const iso = toIso(merged.year, merged.month, merged.day);
    if (iso) onChange(iso);
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="number"
        inputMode="numeric"
        placeholder="YYYY"
        min={yearMin}
        max={yearMax}
        value={parsed.year}
        onChange={(e) => update({ year: e.target.value })}
        className="w-24 h-12 px-3 rounded-xl border border-zinc-300 bg-white text-center"
      />
      <span className="text-sm text-zinc-600">년</span>
      <input
        type="number"
        inputMode="numeric"
        placeholder="MM"
        min={1}
        max={12}
        value={parsed.month}
        onChange={(e) => update({ month: e.target.value })}
        className="w-16 h-12 px-3 rounded-xl border border-zinc-300 bg-white text-center"
      />
      <span className="text-sm text-zinc-600">월</span>
      <input
        type="number"
        inputMode="numeric"
        placeholder="DD"
        min={1}
        max={31}
        value={parsed.day}
        onChange={(e) => update({ day: e.target.value })}
        className="w-16 h-12 px-3 rounded-xl border border-zinc-300 bg-white text-center"
      />
      <span className="text-sm text-zinc-600">일</span>
    </div>
  );
}
