import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// 로딩 자리표시. 크기·모양(rounded)은 className으로 지정한다.
export const Skeleton = ({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) => (
  <div aria-hidden className={cn("skeleton", className)} {...rest} />
);
