import type { HomeDashboard as HomeDashboardData } from "@/lib/home-data";
import { Check } from "lucide-react";

export const WeeklyCalendar = ({ data }: { data: HomeDashboardData }) => (
  <section className="rounded-b-[32px] bg-white px-5 pb-6 pt-4">
    <div className="grid grid-cols-7 gap-2">
      {data.week.days.map((day, index) => (
        <div key={day.date} className="flex flex-col items-center gap-3">
          <span
            className={`text-xs font-semibold leading-4 ${
              day.isToday || day.missionCompleted
                ? "text-primary-300"
                : "text-gray-300"
            }`}
          >
            {day.weekdayLabel}
          </span>
          <span
            className={`flex size-9 items-center justify-center rounded-full ${
              day.missionCompleted
                ? "animate-pop-in bg-primary-300 text-white motion-reduce:animate-none"
                : "border-2 border-gray-100 bg-white text-transparent"
            }`}
            // 달력이 나타난 뒤 완료한 날이 왼쪽부터 차례로 톡 튀어나온다
            style={day.missionCompleted ? { animationDelay: `${360 + index * 70}ms` } : undefined}
          >
            {day.missionCompleted ? (
              <Check className="size-5" strokeWidth={2.5} aria-hidden />
            ) : null}
          </span>
        </div>
      ))}
    </div>
  </section>
);
