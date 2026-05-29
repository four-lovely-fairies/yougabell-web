import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

// "현재 상황 [ 단계 ]" 정보 카드 (홈·로드맵 공통).
// 아이콘(kid_star)은 화면별 에셋이 달라 호출부에서 ReactNode로 주입.
// title은 로드맵의 "4개월 차" 같은 강조 제목 행(옵션).
export const SectionInfoCard = ({
  icon,
  label,
  title,
  body,
  className,
}: {
  icon?: ReactNode;
  label: string;
  title?: string;
  body: ReactNode;
  className?: string;
}) => {
  return (
    <Card radius="xxl" className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-xs font-bold leading-[1.4] text-gray-800">
          {label}
        </span>
      </div>
      {title ? (
        <p className="text-[20px] font-bold leading-[1.4] text-gray-800">
          {title}
        </p>
      ) : null}
      <p className="text-sm font-medium leading-[1.4] text-gray-600">{body}</p>
    </Card>
  );
};
