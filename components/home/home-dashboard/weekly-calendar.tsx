import type { HomeDashboard as HomeDashboardData } from "@/lib/home-data";
import { monthHeadingLabel, moodIconPath } from "./helpers";
import { FigmaIcon, HOME_ICON_PATHS } from "./icons";

export const WeeklyCalendar = ({
  data,
  onOpenTodayMood,
}: {
  data: HomeDashboardData;
  onOpenTodayMood: () => void;
}) => (
  <section>
    <div className="flex items-center justify-between">
      <h1 className="font-suit text-[20px] font-extrabold leading-7 tracking-normal text-gray-800">
        {monthHeadingLabel(data.week)}
      </h1>
      <p className="font-suit text-sm font-medium leading-5 text-gray-700">
        {data.week.weekOfMonthLabel}
      </p>
    </div>
    <div className="mt-5 grid grid-cols-7 gap-1.5">
      {data.week.days.map((day) => (
        <div
          key={day.date}
          className={`flex flex-col items-center gap-1 rounded-2xl px-2 pb-3 pt-2 ${
            day.isToday ? "bg-primary-300 text-white" : ""
          }`}
        >
          <span
            className={`font-suit text-[9px] font-bold leading-none ${
              day.isToday ? "text-white" : "text-gray-300"
            }`}
          >
            {day.weekdayLabel}
          </span>
          <span
            className={`font-suit text-sm font-bold leading-none ${
              day.isToday ? "text-white" : "text-gray-800"
            }`}
          >
            {day.dayOfMonth}
          </span>
        </div>
      ))}
    </div>
    <div className="mt-2.5 grid grid-cols-7 gap-2">
      {(() => {
        // 오늘 날짜(YYYY-MM-DD). 지난 날과 앞으로 올 날을 구분하는 기준.
        const todayDate = data.week.days.find((d) => d.isToday)?.date ?? null;
        return data.week.days.map((day) => (
          <div key={`${day.date}-mood`} className="flex justify-center">
            <MoodBadge
              day={day}
              todayDate={todayDate}
              onOpenTodayMood={onOpenTodayMood}
            />
          </div>
        ));
      })()}
    </div>
  </section>
);

const MoodBadge = ({
  day,
  todayDate,
  onOpenTodayMood,
}: {
  day: HomeDashboardData["week"]["days"][number];
  todayDate: string | null;
  onOpenTodayMood: () => void;
}) => {
  if (day.mood?.level) {
    return (
      <FigmaIcon
        src={moodIconPath(day.mood.level)}
        alt="today's mood"
        className="size-8 shrink-0"
      />
    );
  }

  if (day.isToday) {
    return (
      <button
        type="button"
        onClick={onOpenTodayMood}
        className="flex size-8 items-center justify-center rounded-full bg-gray-800 leading-none text-white"
        aria-label="오늘의 기분 기록하기"
      >
        <FigmaIcon
          src={HOME_ICON_PATHS.moodPlus}
          alt="today's mood selection"
        />
      </button>
    );
  }

  // 지난 날인데 기분을 기록하지 않고 넘어간 경우 — X자 눈 표정(Figma 2823:6453).
  // 앞으로 올 날은 빈 원 유지.
  if (todayDate && day.date < todayDate) {
    return <MoodSkippedFace />;
  }

  return <div className="size-8 rounded-full bg-gray-100" aria-hidden />;
};

// 기분 미기록(스킵) 표정 — 회색 원 + X자 눈 (Figma emoji/x 2823:6453).
// 배경색은 디자이너의 mood 아이콘 배경색 갱신 반영 시 함께 조정 예정.
const MoodSkippedFace = () => (
  <svg
    viewBox="0 0 32 32"
    className="size-8 shrink-0"
    role="img"
    aria-label="기분 미기록"
  >
    <circle cx="16" cy="16" r="16" className="fill-gray-100" />
    <g
      className="stroke-gray-400"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
    >
      {/* 왼쪽 눈 */}
      <path d="M9.6 9.6 13.4 13.4 M13.4 9.6 9.6 13.4" />
      {/* 오른쪽 눈 */}
      <path d="M18.6 9.6 22.4 13.4 M22.4 9.6 18.6 13.4" />
    </g>
  </svg>
);
