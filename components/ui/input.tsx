"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  trailing?: ReactNode;
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, trailing, invalid, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        "flex items-center h-12 px-4 rounded-2xl bg-white border transition-colors",
        invalid
          ? "border-error-500"
          : "border-gray-100 focus-within:border-primary-300",
        className,
      )}
    >
      <input
        ref={ref}
        className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 disabled:text-gray-400"
        {...rest}
      />
      {trailing ? (
        <div className="ml-2 flex items-center">{trailing}</div>
      ) : null}
    </div>
  );
});
