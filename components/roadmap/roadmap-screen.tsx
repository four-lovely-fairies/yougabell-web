"use client";

import { ChevronLeft, ChevronRight, Info, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader, HeaderSpacer } from "@/components/app/app-header";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { SectionInfoCard } from "@/components/ui/section-info-card";
import { getStoredSelectedChildId, loadRoadmap } from "@/lib/api";
import {
  CDC_CHECKPOINTS,
  ROADMAP_CATEGORY_DISPLAY,
  type RoadmapCategoryGroup,
  type RoadmapResponse,
  type RoadmapStage,
} from "@/lib/roadmap-data";

export const RoadmapScreen = () => {
  const router = useRouter();
  const [data, setData] = useState<RoadmapResponse | null>(null);
  // 내 아이의 월령 체크포인트 — 첫 로드 시 서버가 보정해 준 targetMonth로 고정.
  // 이후 월령 탭을 옮겨도 바뀌지 않으므로, 다른 월령을 보고 있을 때 내 아이 탭을 표시하는 기준이 된다.
  const [childMonth, setChildMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const infoButtonRef = useRef<HTMLButtonElement | null>(null);

  const load = useCallback(async (targetMonth?: number | null) => {
    setLoading(true);
    const next = await loadRoadmap({
      childId: getStoredSelectedChildId(),
      targetMonth,
    });
    setData(next.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void loadRoadmap({ childId: getStoredSelectedChildId() }).then((next) => {
      if (!active) return;
      setData(next.data);
      setChildMonth(next.data.targetMonth);
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
    <div className="flex min-h-dvh flex-col bg-gray-20 text-gray-800">
      <AppHeader
        fixed
        title="발달 로드맵"
        onBack={goBack}
        right={
          <button
            ref={infoButtonRef}
            type="button"
            onClick={() => setTooltipOpen((value) => !value)}
            className="flex size-11 items-center justify-center text-gray-800"
            aria-label="데이터 출처 안내"
          >
            <Info className="size-6" aria-hidden />
          </button>
        }
      />
      <HeaderSpacer />
      <div className="relative flex flex-1 flex-col">
        {tooltipOpen ? (
          <SourceTooltip
            text={data.sourceTooltip.text}
            tooltipRef={tooltipRef}
          />
        ) : null}
        <CurrentStageCard ageLabel={data.child.ageLabel} stage={data.stage} />
        <MonthTabs
          target={data.targetMonth}
          childMonth={childMonth}
          disabled={loading}
          onSelect={onSelectMonth}
        />
        <CategoryCardList groups={data.milestonesByCategory} />
      </div>
    </div>
  );
};

const SourceTooltip = ({
  text,
  tooltipRef,
}: {
  text: string;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div className="absolute right-5 top-2 z-10" role="status">
    <div
      className="pointer-events-none absolute right-2.5 -top-1.75 size-0 border-x-[13px] border-b-[12px] border-x-transparent border-b-white"
      aria-hidden
    />
    <div
      ref={tooltipRef}
      className="pointer-events-auto w-67.75 rounded-2xl bg-white px-4 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
    >
      <p className="text-xs leading-5 text-gray-600">{text}</p>
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
    <SectionInfoCard
      icon={
        <Star
          className="size-5 text-primary-300"
          fill="currentColor"
          strokeWidth={0}
          aria-hidden
        />
      }
      label={`현재 상황 [ ${stage?.name ?? "확인 중"} ]`}
      title={ageLabel}
      body={
        stage?.summary ??
        "아이의 성장 단계를 확인하는 중이에요. 잠시만 기다려주세요."
      }
    />
  </section>
);

const MonthTabs = ({
  target,
  childMonth,
  disabled,
  onSelect,
}: {
  target: number;
  childMonth: number | null;
  disabled: boolean;
  onSelect: (month: number) => void;
}) => {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  const targetIndex = (CDC_CHECKPOINTS as readonly number[]).indexOf(target);
  const prevMonth = targetIndex > 0 ? CDC_CHECKPOINTS[targetIndex - 1] : null;
  const nextMonth =
    targetIndex >= 0 && targetIndex < CDC_CHECKPOINTS.length - 1
      ? CDC_CHECKPOINTS[targetIndex + 1]
      : null;

  // 선택된 월령이 바뀌면 가로 스크롤에서 가운데로 보이도록 이동.
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [target]);

  return (
    <section className="mt-5 px-5">
      <h2 className="text-base font-bold leading-[25px] text-gray-800">
        발달 지표
      </h2>
      <div
        role="tablist"
        aria-label="월령 선택"
        className="mt-3 flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => prevMonth !== null && onSelect(prevMonth)}
          disabled={prevMonth === null || disabled}
          aria-label="이전 월령 보기"
          className="flex size-8 shrink-0 items-center justify-center text-gray-800 disabled:text-gray-300"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <div className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {CDC_CHECKPOINTS.map((month) => {
            const active = month === target;
            // 지금 보고 있는 월령(active)이 아니면서 내 아이 월령인 탭은 연한 색으로 구분.
            const isChildMonth = !active && month === childMonth;
            return (
              <button
                key={month}
                ref={active ? activeRef : undefined}
                type="button"
                role="tab"
                aria-selected={active}
                title={isChildMonth ? "내 아이 월령" : undefined}
                onClick={() => onSelect(month)}
                disabled={disabled}
                className={`flex h-8.25 shrink-0 items-center justify-center whitespace-nowrap rounded-md px-3.5 text-xs font-medium leading-[1.4] ${
                  active
                    ? "bg-primary-300 text-white"
                    : isChildMonth
                      ? "border border-primary-200 bg-primary-50 text-primary-300"
                      : "border border-gray-100 bg-white text-gray-600"
                }`}
              >
                {month}개월
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => nextMonth !== null && onSelect(nextMonth)}
          disabled={nextMonth === null || disabled}
          aria-label="다음 월령 보기"
          className="flex size-8 shrink-0 items-center justify-center text-gray-800 disabled:text-gray-300"
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

// Figma 카테고리 색 = Chip tone (15% 알파 + inset glow): social=amber/language=blue/cognitive=purple/physical=cyan
const CATEGORY_TONE: Record<
  string,
  "amber" | "blue" | "purple" | "cyan" | "gray"
> = {
  social: "amber",
  language: "blue",
  cognitive: "purple",
  physical: "cyan",
};

const CategoryCard = ({ group }: { group: RoadmapCategoryGroup }) => {
  const tone = CATEGORY_TONE[group.categoryId] ?? "gray";
  const fallback = ROADMAP_CATEGORY_DISPLAY[group.categoryId];

  return (
    <Card
      padding="md"
      radius="xxl"
      shadow="none"
      className="flex gap-4 border border-gray-50"
      aria-labelledby={`category-${group.categoryId}`}
    >
      <Chip
        shape="square"
        tone={tone}
        className="size-7 shrink-0 justify-center p-0"
        aria-hidden
      >
        <CategoryIcon iconKey={group.iconKey || fallback.iconKey} />
      </Chip>
      <div className="min-w-0 flex-1">
        <h3
          id={`category-${group.categoryId}`}
          className="text-sm font-bold leading-5 text-gray-800"
        >
          {group.categoryLabel || fallback.label}
        </h3>
        <div className="mt-1 text-sm leading-[1.7] text-gray-600">
          {group.items.length === 0 ? (
            <p className="text-gray-400">이 월령의 자료가 곧 추가됩니다.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {group.items.map((item) => (
                <li key={item.id}>{item.description}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Figma chip 아이콘 (Material Symbols 이름). Figma 노드 2516:5396/5407/5418/5429에서 export.
 * 알 수 없는 키는 안전한 빈 표시 (•).
 */
const ICON_PATHS: Record<string, string> = {
  groups: "/icons/figma/roadmap/groups.svg",
  dictionary: "/icons/figma/roadmap/dictionary.svg",
  psychology_alt: "/icons/figma/roadmap/psychology_alt.svg",
  barefoot: "/icons/figma/roadmap/barefoot.svg",
};

const CategoryIcon = ({ iconKey }: { iconKey: string }) => {
  const src = ICON_PATHS[iconKey];
  if (!src) {
    return (
      <span
        className="text-xs font-bold leading-none text-gray-400"
        aria-hidden
      >
        •
      </span>
    );
  }
  return <img src={src} alt="" className="size-5" aria-hidden />;
};

const RoadmapSkeleton = () => (
  <div className="flex min-h-dvh items-center justify-center bg-gray-20">
    <div className="size-8 animate-pulse rounded-full bg-primary-300" />
  </div>
);
