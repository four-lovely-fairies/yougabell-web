"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors select-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-300 text-white hover:bg-[#8965f5] active:bg-[#7d57ec] disabled:bg-primary-100",
        secondary:
          "bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-700",
        outline:
          "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50",
        dashed:
          "bg-transparent border-2 border-dashed border-primary-300 text-primary-500 hover:bg-primary-50",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-50",
      },
      size: {
        md: "h-12 px-5 text-[15px] rounded-xl",
        lg: "h-14 px-6 text-base rounded-2xl",
        full: "h-14 w-full text-base rounded-2xl",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, type = "button", ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(button({ variant, size }), className)}
        {...rest}
      />
    );
  },
);
