import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { SectionInfoCard } from "@/components/ui/section-info-card";
import { StatCard, StatValue } from "@/components/ui/stat-card";
import type { HomeDashboard as HomeDashboardData } from "@/lib/home-data";
import { splitMissionTitle } from "./helpers";
import { FigmaIcon, HOME_ICON_PATHS } from "./icons";

export const TodayMissionCard = ({
  mission,
  loading,
  onStart,
}: {
  mission: HomeDashboardData["recommendedMission"];
  loading: boolean;
  onStart: () => void;
}) => {
  const isCompleted = mission?.status === "completed";
  const buttonLabel = isCompleted ? "오늘의 놀이 완료" : "오늘의 놀이 시작하기";

  return (
    <Card
      radius="xxl"
      shadow="none"
      className="shadow-[0_4px_11.5px_rgba(0,0,0,0.05)]"
    >
      <Chip>아이 {mission?.durationMinutes ?? 10}분 가까워지기</Chip>
      <div className="mt-3.25 flex items-center justify-between gap-4">
        <h2 className="text-[20px] font-bold leading-[1.4] tracking-[-0.4px] text-gray-800">
          {splitMissionTitle(
            mission?.title ?? "아이와 눈을 마주치며 이야기를 해보아요",
          ).map((line) => (
            <span key={line} className="block whitespace-pre-wrap">
              {line}
            </span>
          ))}
        </h2>
        <img
          src={HOME_ICON_PATHS.missionMascot}
          alt=""
          className="h-15 w-21 shrink-0 object-contain"
          aria-hidden
        />
      </div>
      <button
        type="button"
        onClick={onStart}
        disabled={!mission || loading || isCompleted}
        className="mt-3.25 flex h-12 w-full items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-6 text-white disabled:bg-gray-100 disabled:text-gray-600"
      >
        {buttonLabel}
      </button>
    </Card>
  );
};

export const GrowthStageCard = ({
  stage,
}: {
  stage: HomeDashboardData["growthStage"];
}) => (
  <SectionInfoCard
    icon={
      <FigmaIcon
        src={HOME_ICON_PATHS.growthStage}
        alt=""
        className="size-5 shrink-0"
      />
    }
    label={`현재 상황 [ ${stage?.name ?? "확인 중"} ]`}
    body={
      stage?.summary ??
      '아이의 독립심이 싹트고 있어요. "내가 할래!"라는 말은 성장의 건강한 신호입니다.'
    }
  />
);

export const ReportSummaryCard = ({
  summary,
}: {
  summary: HomeDashboardData["reportSummary"];
}) => (
  <section className="grid grid-cols-2 gap-2">
    <StatCard label="지난주 놀이 수행시간">
      {summary ? (
        <DurationValue label={summary.totalDurationLabel} />
      ) : (
        <NoRecord />
      )}
    </StatCard>
    <StatCard
      label="아이 반응 긍정률"
      icon={
        summary ? (
          <FigmaIcon
            src="/icons/figma/shared/positive-rate.svg"
            alt=""
            className="size-4.5 self-center"
          />
        ) : undefined
      }
    >
      {summary ? (
        <StatValue value={summary.childPositiveReactionRate} unit="%" />
      ) : (
        <NoRecord />
      )}
    </StatCard>
  </section>
);

const NoRecord = () => (
  <span className="text-sm font-medium leading-5 text-gray-400">기록 없음</span>
);

// "1시간 17분" → StatValue 조합 (숫자는 SUIT)
const DurationValue = ({ label }: { label: string }) => {
  const parts = label.match(/^(?:(\d+)시간)?(?:\s*)?(?:(\d+)분)?$/);

  if (!parts) {
    return <StatValue value={label} />;
  }

  const [, hours, minutes] = parts;
  return (
    <>
      {hours ? <StatValue value={hours} unit="시간" /> : null}
      {minutes ? <StatValue value={minutes} unit="분" /> : null}
    </>
  );
};
