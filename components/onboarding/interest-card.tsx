"use client";

import { cn } from "@/lib/utils";

type Props = {
  emoji: string;
  label: string;
  selected: boolean;
  disabled?: boolean; // max 도달 시 미선택 카드 dim
  onToggle: () => void;
};

export function InterestCard({
  emoji,
  label,
  selected,
  disabled,
  onToggle,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      disabled={!selected && disabled}
      className={cn(
        "flex h-11 items-center gap-1.5 rounded-2xl border pl-3 pr-4 text-sm transition-colors",
        selected
          ? "border-[#b69cfe] bg-[#efe7ff] text-gray-800"
          : "border-[#e9e9e9] bg-white text-gray-800",
        !selected && disabled && "opacity-40",
      )}
    >
      <span className="flex size-5 items-center justify-center text-base leading-none">
        {emoji}
      </span>
      <span className="font-normal">{label}</span>
    </button>
  );
}
