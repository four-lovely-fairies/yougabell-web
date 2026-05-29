import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Figma 정보 카드 컨테이너 (홈·로드맵·리포트 등 공통).
// 기본: 흰 배경 + radius 20(xl 토큰) + padding 24 + shadow-1.
const card = cva("bg-white", {
  variants: {
    padding: { none: "", sm: "p-4", md: "p-5", lg: "p-6" }, // 16 / 20 / 24
    radius: {
      lg: "rounded-[16px]",
      xl: "rounded-[20px]",
      xxl: "rounded-[24px]",
    },
    shadow: { none: "", sm: "shadow-1", md: "shadow-2" },
  },
  defaultVariants: { padding: "lg", radius: "xl", shadow: "sm" },
});

export type CardProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof card>;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padding, radius, shadow, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(card({ padding, radius, shadow }), className)}
      {...rest}
    />
  );
});
