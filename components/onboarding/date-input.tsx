"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { DateBottomSheet } from "./date-bottom-sheet";

type Props = {
  value?: string;
  onChange: (iso: string) => void;
  yearMin?: number;
  yearMax?: number;
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
  yearMin,
  yearMax,
  placeholder = "선택",
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const display = useMemo(() => format(value), [value]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-labelledby={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center w-full h-12 px-4 rounded-lg bg-white border border-gray-200 focus:border-primary-500 outline-none text-left text-sm"
      >
        <span
          id={id}
          className={display ? "flex-1 text-gray-800" : "flex-1 text-gray-400"}
        >
          {display ?? placeholder}
        </span>
        <ChevronDownIcon size={20} className="text-gray-500" />
      </button>
      {open && (
        <DateBottomSheet
          onClose={() => setOpen(false)}
          value={value}
          onConfirm={onChange}
          yearMin={yearMin}
          yearMax={yearMax}
        />
      )}
    </>
  );
}
