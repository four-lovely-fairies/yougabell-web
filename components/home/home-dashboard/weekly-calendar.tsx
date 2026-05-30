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
      {data.week.days.map((day) => (
        <div key={`${day.date}-mood`} className="flex justify-center">
          <MoodBadge day={day} onOpenTodayMood={onOpenTodayMood} />
        </div>
      ))}
    </div>
  </section>
);

const MoodBadge = ({
  day,
  onOpenTodayMood,
}: {
  day: HomeDashboardData["week"]["days"][number];
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

  return <div className="size-8 rounded-full bg-gray-100" aria-hidden />;
};
