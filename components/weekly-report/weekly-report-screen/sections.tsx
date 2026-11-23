import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { StatCard, StatValue } from "@/components/ui/stat-card";
import {
  splitDurationLabel,
  type WeeklyReportDetail,
} from "@/lib/weekly-report-data";
import { keywordIcons, keywordTones } from "./constants";

export const ReportSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-lg font-bold leading-[25px]">{title}</h2>
    {children}
  </section>
);

// 리포트 카드 = 공통 Card (흰배경 radius 20, padding 24). 연회색 바탕이라 그림자 없이 구분된다
export const ReportCard = ({ children }: { children: React.ReactNode }) => (
  <Card shadow="none">{children}</Card>
);

// 누적 수행시간 통계 ("1시간 17분" → SUIT 32px 숫자)
export const DurationStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <StatCard label={label} align="start">
    {splitDurationLabel(value).map((segment) => (
      <StatValue
        key={`${segment.value}-${segment.unit}`}
        value={segment.value}
        unit={segment.unit}
        size="lg"
      />
    ))}
  </StatCard>
);

// 긍정률 통계 (불꽃 + SUIT 32px + %)
export const PercentStat = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <StatCard
    label={label}
    align="start"
    icon={
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/icons/figma/shared/positive-rate.svg"
        alt=""
        className="size-4.5 self-center"
        aria-hidden
      />
    }
  >
    <StatValue value={value} unit="%" size="lg" />
  </StatCard>
);

export const KeywordSection = ({ report }: { report: WeeklyReportDetail }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-lg font-bold leading-[25px]">
      아이의 관심 키워드 Top 3
    </h2>
    {report.topKeywords.length > 0 ? (
      <div className="flex flex-wrap items-center gap-3">
        {report.topKeywords.map((keyword, index) => {
          const iconSrc = keywordIcons[index] ?? keywordIcons[0];
          return (
            <Chip
              key={`${keyword.rank}-${keyword.keyword}`}
              shape="square"
              tone={keywordTones[index] ?? "amber"}
              size="md"
              className="font-semibold"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={iconSrc}
                alt=""
                className="size-3.5 shrink-0"
                aria-hidden
              />
              {keyword.keyword}
            </Chip>
          );
        })}
      </div>
    ) : report.keywordEmptyState ? (
      <Card padding="md" shadow="none">
        <p className="text-sm font-bold leading-5">
          {report.keywordEmptyState.title}
        </p>
        <p className="mt-2 text-sm leading-[1.6] text-gray-600">
          {report.keywordEmptyState.description}
        </p>
      </Card>
    ) : null}
  </section>
);

export const BestMomentSection = ({
  moments,
}: {
  moments: WeeklyReportDetail["bestMoments"];
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (moments.length === 0) return null;

  return (
    <ReportSection title="아이의 ‘베스트 모먼트’">
      <div className="flex flex-col items-center gap-3">
        {/* 옆으로 넘기는 캐러셀 — 카드 한 장씩 딱 맞게 멈춘다. 그림자가 잘리지 않게 위아래 여백을 둔다. */}
        <div
          className="-my-2 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const el = event.currentTarget;
            const next = Math.round(el.scrollLeft / (el.clientWidth + 12));
            if (next !== activeIndex) setActiveIndex(next);
          }}
        >
          {moments.map((moment) => (
            <div key={moment.id} className="flex w-full shrink-0 snap-center">
              <Card shadow="none" className="w-full">
                {moment.label ? (
                  <p className="text-sm font-medium leading-[1.4] text-gray-600">
                    {moment.label}
                  </p>
                ) : null}
                <h2 className="mt-1 text-base font-bold leading-6">
                  {moment.title}
                </h2>
                <p className="mt-3 text-sm leading-[1.6] text-gray-600">
                  {moment.body}
                </p>
              </Card>
            </div>
          ))}
        </div>
        {moments.length > 1 ? (
          <div className="flex h-1.5 items-center gap-1" aria-hidden>
            {moments.map((moment, index) => (
              <span
                key={moment.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-6 bg-black" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </ReportSection>
  );
};

export const InnerStateSection = ({
  report,
}: {
  report: WeeklyReportDetail;
}) => (
  <ReportSection title="사용자의 내면 상태">
    <ReportCard>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium leading-[1.4] text-gray-600">
          심리적 에너지
        </p>
        <p className="text-base font-bold leading-6">
          {report.innerState.psychologicalEnergy}%
        </p>
      </div>
      <div
        className="mt-3.75 h-5 overflow-hidden rounded-full bg-[rgba(0,0,0,0.03)]"
        role="progressbar"
        aria-valuenow={report.innerState.psychologicalEnergy}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-xs bg-primary-300"
          style={{ width: `${report.innerState.psychologicalEnergy}%` }}
        />
      </div>
    </ReportCard>
  </ReportSection>
);
