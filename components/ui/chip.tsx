import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// 공통 칩. 라벨 칩(round/gray)과 토널 칩(category·키워드: 색 15% 알파 + inset glow)을 통합.
// 로드맵 카테고리 = 리포트 키워드가 동일 패턴이므로 tone 색을 프리셋으로 제공.
const chip = cva(
  "inline-flex items-center gap-1 font-medium leading-[1.4] whitespace-nowrap",
  {
    variants: {
      shape: { round: "rounded-full", square: "rounded-md" },
      size: { sm: "px-2.5 py-1 text-xs", md: "px-3 py-2 text-sm" },
      tone: {
        gray: "bg-gray-50 text-gray-800",
        primary: "bg-primary-50 text-primary-300",
        amber:
          "bg-[rgba(255,166,33,0.15)] text-[#ffa621] shadow-[inset_0_0_10px_rgba(255,166,33,0.1)]",
        blue: "bg-[rgba(73,122,244,0.15)] text-[#497af4] shadow-[inset_0_0_10px_rgba(73,122,244,0.1)]",
        purple:
          "bg-[rgba(147,73,244,0.15)] text-[#9349f4] shadow-[inset_0_0_10px_rgba(147,73,244,0.1)]",
        cyan: "bg-[rgba(0,170,255,0.15)] text-[#00aaff] shadow-[inset_0_0_10px_rgba(0,170,255,0.1)]",
      },
    },
    defaultVariants: { shape: "round", size: "sm", tone: "gray" },
  },
);

export type ChipProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof chip>;

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  { className, shape, size, tone, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(chip({ shape, size, tone }), className)}
      {...rest}
    />
  );
});
