"use client";

import { cn } from "@/lib/utils";

type Option<T> = { value: T; label: string };

type SegmentedToggleProps<T extends string> = {
  options: Option<T>[];
  value: T | null;
  onChange: (next: T | null) => void;
  allowDeselect?: boolean; // true면 같은 값 클릭 시 null로 해제 (직장 유무용)
  ariaLabel?: string;
  // 자녀 정보(2146:4959) 디자인은 selected 텍스트가 brand 색(#6d3aff). 부모 프로필은 기본(gray-800).
  selectedTone?: "default" | "brand";
};

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  allowDeselect = false,
  ariaLabel,
  selectedTone = "default",
}: SegmentedToggleProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex gap-2 w-full">
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
              "flex-1 h-12 rounded-2xl border text-sm font-normal transition-colors",
              selected
                ? selectedTone === "brand"
                  ? "border-[#b69cfe] bg-[#efe7ff] text-[#6d3aff]"
                  : "border-[#b69cfe] bg-[#efe7ff] text-gray-800"
                : "border-[#e9e9e9] bg-white text-gray-700 hover:border-gray-300",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
