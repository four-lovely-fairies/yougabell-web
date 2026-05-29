import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

// 통계 카드 (홈 "지난주 놀이 수행시간"/"긍정률", 리포트 "누적 미션 수행시간" 등 공통).
// 큰 숫자는 SUIT(font-suit), 라벨은 tertiary. 복합값(1시간 17분)은 StatValue 여러 개로 조합.
export const StatCard = ({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <Card
      padding="none"
      radius="xxl"
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-3 text-center",
        className,
      )}
    >
      <span className="text-xs font-medium leading-[1.4] text-gray-500">
        {label}
      </span>
      <div className="flex items-baseline justify-center gap-1">
        {icon}
        {children}
      </div>
    </Card>
  );
};

// 숫자(SUIT ExtraBold) + 단위. 긍정률 "92%", 수행시간 "1시간" "17분" 등.
export const StatValue = ({
  value,
  unit,
}: {
  value: string | number;
  unit?: string;
}) => {
  return (
    <span className="flex items-baseline gap-0.5">
      <span className="font-suit text-[22px] font-extrabold leading-none text-gray-800">
        {value}
      </span>
      {unit ? (
        <span className="text-sm font-medium text-gray-800">{unit}</span>
      ) : null}
    </span>
  );
};
