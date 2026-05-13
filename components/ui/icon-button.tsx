"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { className, label, children, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center w-11 h-11 -m-2 text-gray-800 rounded-full hover:bg-gray-50 active:bg-gray-100",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
