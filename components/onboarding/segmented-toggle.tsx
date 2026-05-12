"use client";

import { cn } from "@/lib/utils";

type Option<T> = { value: T; label: string };

type SegmentedToggleProps<T extends string> = {
  options: Option<T>[];
  value: T | null;
  onChange: (next: T | null) => void;
  allowDeselect?: boolean; // true면 같은 값 클릭 시 null로 해제 (직장 유무용)
  ariaLabel?: string;
};

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  allowDeselect = false,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex gap-3 w-full"
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() =>
              onChange(allowDeselect && selected ? null : opt.value)
            }
            className={cn(
              "flex-1 h-12 rounded-xl border text-sm font-medium transition-colors",
              selected
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
