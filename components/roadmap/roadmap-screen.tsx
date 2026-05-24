"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Info, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getStoredSelectedChildId, loadRoadmap } from "@/lib/api";
import {
  ROADMAP_CATEGORY_DISPLAY,
  type RoadmapCategoryGroup,
  type RoadmapMonthTabRange,
  type RoadmapResponse,
  type RoadmapStage,
} from "@/lib/roadmap-data";

export const RoadmapScreen = () => {
  const router = useRouter();
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const infoButtonRef = useRef<HTMLButtonElement | null>(null);

  const load = useCallback(
    async (targetMonth?: number | null) => {
      setLoading(true);
      const next = await loadRoadmap({
        childId: getStoredSelectedChildId(),
        targetMonth,
      });
      setData(next.data);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    let active = true;
    void loadRoadmap({ childId: getStoredSelectedChildId() }).then((next) => {
      if (!active) return;
      setData(next.data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!tooltipOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (tooltipRef.current?.contains(target)) return;
      if (infoButtonRef.current?.contains(target)) return;
      setTooltipOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [tooltipOpen]);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  const onSelectMonth = (month: number) => {
    if (!data || data.targetMonth === month) return;
    void load(month);
  };

  if (!data) return <RoadmapSkeleton />;

  return (
    <div className="flex min-h-dvh flex-col bg-[#fdfdfe] text-[#262626]">
      <RoadmapHeader
        onBack={goBack}
        onToggleTooltip={() => setTooltipOpen((value) => !value)}
        infoButtonRef={infoButtonRef}
      />
      <div className="relative flex flex-1 flex-col">
        {tooltipOpen ? (
          <SourceTooltip
            text={data.sourceTooltip.text}
            tooltipRef={tooltipRef}
          />
        ) : null}
        <CurrentStageCard ageLabel={data.child.ageLabel} stage={data.stage} />
        <MonthTabs
          tabs={data.monthTabs}
          target={data.targetMonth}
          range={data.monthTabRange}
          disabled={loading}
          onSelect={onSelectMonth}
        />
        <CategoryCardList groups={data.milestonesByCategory} />
      </div>
    </div>
  );
};

const RoadmapHeader = ({
  onBack,
  onToggleTooltip,
  infoButtonRef,
}: {
  onBack: () => void;
  onToggleTooltip: () => void;
  infoButtonRef: React.RefObject<HTMLButtonElement | null>;
}) => (
  <header className="flex h-[103px] shrink-0 flex-col">
    <div className="h-[47px]" aria-hidden />
    <div className="flex h-14 items-center justify-between px-4">
      <button
        type="button"
        onClick={onBack}
        className="flex size-11 items-center justify-center text-[#262626]"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="size-6" aria-hidden />
      </button>
      <h1 className="text-base font-semibold leading-[22px]">발달 로드맵</h1>
      <button
        ref={infoButtonRef}
        type="button"
        onClick={onToggleTooltip}
        className="flex size-11 items-center justify-center text-[#262626]"
        aria-label="데이터 출처 안내"
      >
        <Info className="size-6" aria-hidden />
      </button>
    </div>
  </header>
);

const SourceTooltip = ({
  text,
  tooltipRef,
}: {
  text: string;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div className="absolute right-5 top-2 z-10" role="status">
    <div
      className="pointer-events-none absolute right-[10px] top-[-7px] size-0 border-x-[13px] border-b-[12px] border-x-transparent border-b-white"
      aria-hidden
    />
    <div
      ref={tooltipRef}
      className="pointer-events-auto w-[271px] rounded-2xl bg-white px-4 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
    >
      <p className="text-xs leading-5 text-[#555]">{text}</p>
    </div>
  </div>
);

const CurrentStageCard = ({
  ageLabel,
  stage,
}: {
  ageLabel: string;
  stage: RoadmapStage | null;
}) => (
  <section className="px-5 pt-5">
    <div className="rounded-2xl bg-[#f6f6f6] px-6 py-6">
      <div className="flex items-center gap-1">
        <Star
          className="size-5 text-[#9572ff]"
          fill="#9572ff"
          strokeWidth={0}
          aria-hidden
        />
        <h2 className="text-xs font-bold leading-[1.4] text-[#262626]">
          현재 상황 [ {stage?.name ?? "확인 중"} ]
        </h2>
      </div>
      <p className="mt-[15px] text-[22px] font-extrabold leading-[30px] text-[#262626]">
        {ageLabel}
      </p>
      <p className="mt-[15px] text-sm font-medium leading-[1.7] text-[#555]">
        {stage?.summary ??
          "아이의 성장 단계를 확인하는 중이에요. 잠시만 기다려주세요."}
      </p>
    </div>
  </section>
);

const MonthTabs = ({
  tabs,
  target,
  range,
  disabled,
  onSelect,
}: {
  tabs: number[];
  target: number;
  range: RoadmapMonthTabRange;
  disabled: boolean;
  onSelect: (month: number) => void;
}) => {
  const prevDisabled = range.prev === null;
  const nextDisabled = range.next === null;

  return (
    <section className="mt-5 px-5">
      <h2 className="text-base font-bold leading-[25px] text-[#262626]">
        발달 지표
      </h2>
      <div
        role="tablist"
        aria-label="월령 선택"
        className="mt-3 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => range.prev !== null && onSelect(range.prev)}
          disabled={prevDisabled || disabled}
          aria-label="이전 월령 보기"
          aria-disabled={prevDisabled}
          className="flex size-8 shrink-0 items-center justify-center text-[#262626] disabled:text-[#c4c4c4]"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <div className="flex flex-1 items-center justify-between">
          {tabs.map((month) => {
            const active = month === target;
            return (
              <button
                key={month}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(month)}
                disabled={disabled}
                className={`flex h-[33px] min-w-[50px] items-center justify-center rounded-full px-3 text-xs font-medium leading-[1.4] ${
                  active
                    ? "bg-[#9572ff] text-white"
                    : "bg-transparent text-[#555]"
                }`}
              >
                {month}개월
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => range.next !== null && onSelect(range.next)}
          disabled={nextDisabled || disabled}
          aria-label="다음 월령 보기"
          aria-disabled={nextDisabled}
          className="flex size-8 shrink-0 items-center justify-center text-[#262626] disabled:text-[#c4c4c4]"
        >
          <ChevronRight className="size-6" aria-hidden />
        </button>
      </div>
    </section>
  );
};

const CategoryCardList = ({ groups }: { groups: RoadmapCategoryGroup[] }) => (
  <section className="mt-3 flex flex-col gap-3 px-5 pb-8">
    {groups.map((group) => (
      <CategoryCard key={group.categoryId} group={group} />
    ))}
  </section>
);

const CATEGORY_CARD_STYLES: Record<
  string,
  { chipBg: string; chipFg: string }
> = {
  social: { chipBg: "bg-[#FFF1D6]", chipFg: "text-[#D08C0B]" },
  language: { chipBg: "bg-[#E5ECFF]", chipFg: "text-[#3A66E2]" },
  cognitive: { chipBg: "bg-[#EFE4FF]", chipFg: "text-[#7B4FE0]" },
  physical: { chipBg: "bg-[#D6F5EC]", chipFg: "text-[#159A6F]" },
};

const CategoryCard = ({ group }: { group: RoadmapCategoryGroup }) => {
  const styles = CATEGORY_CARD_STYLES[group.categoryId] ?? {
    chipBg: "bg-[#f6f6f6]",
    chipFg: "text-[#555]",
  };
  const fallback = ROADMAP_CATEGORY_DISPLAY[group.categoryId];

  return (
    <article
      className="flex gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_10px_rgba(0,0,0,0.04)]"
      aria-labelledby={`category-${group.categoryId}`}
    >
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${styles.chipBg}`}
        aria-hidden
      >
        <CategoryIcon
          iconKey={group.iconKey || fallback.iconKey}
          className={`size-5 ${styles.chipFg}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3
          id={`category-${group.categoryId}`}
          className="text-base font-bold leading-5 text-[#262626]"
        >
          {group.categoryLabel || fallback.label}
        </h3>
        <div className="mt-1 text-sm leading-[1.7] text-[#555]">
          {group.items.length === 0 ? (
            <p className="text-[#9d9d9d]">
              이 월령의 자료가 곧 추가됩니다.
            </p>
          ) : (
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>{item.description}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
};

/**
 * Figma chip 아이콘 키(`groups`/`dictionary`/`psychology_alt`/`barefoot`)는 Material Symbols 이름.
 * lucide-react에 1:1 매칭이 없어 시각적으로 가까운 대체 컴포넌트 매핑.
 * Figma SVG export로 교체할 때까지 한시적 fallback.
 */
const CategoryIcon = ({
  iconKey,
  className,
}: {
  iconKey: string;
  className?: string;
}) => {
  const symbol = ICON_FALLBACK[iconKey] ?? "•";
  return (
    <span
      className={`flex items-center justify-center text-[14px] font-bold leading-none ${className ?? ""}`}
      aria-hidden
    >
      {symbol}
    </span>
  );
};

const ICON_FALLBACK: Record<string, string> = {
  groups: "👥",
  dictionary: "abc",
  psychology_alt: "🧠",
  barefoot: "🦶",
};

const RoadmapSkeleton = () => (
  <div className="flex min-h-dvh items-center justify-center bg-[#fdfdfe]">
    <div className="size-8 animate-pulse rounded-full bg-[#9572ff]" />
  </div>
);
