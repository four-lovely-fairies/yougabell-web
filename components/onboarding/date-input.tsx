"use client";

import { useId, useMemo, useRef } from "react";
import { ChevronDownIcon } from "@/components/icons";

type Props = {
  value?: string;
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
};

function format(iso: string | undefined) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return null;
  return `${y}.${m}.${d}`;
}

export function DateInput({
  value,
  onChange,
  min = "1900-01-01",
  max,
  placeholder = "선택",
}: Props) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const display = useMemo(() => format(value), [value]);
  const todayMax = max ?? new Date().toISOString().slice(0, 10);

  const open = () => {
    const el = ref.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.click();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={open}
        aria-labelledby={id}
        className="flex items-center w-full h-12 px-4 rounded-md bg-white border border-gray-200 focus:border-primary-500 outline-none text-left"
      >
        <span
          id={id}
          className={display ? "flex-1 text-gray-800" : "flex-1 text-gray-400"}
        >
          {display ?? placeholder}
        </span>
        <ChevronDownIcon size={20} className="text-gray-500" />
      </button>
      <input
        ref={ref}
        type="date"
        value={value ?? ""}
        min={min}
        max={todayMax}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
