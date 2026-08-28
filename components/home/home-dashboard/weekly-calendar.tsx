import type { HomeDashboard as HomeDashboardData } from "@/lib/home-data";
import { Check } from "lucide-react";

export const WeeklyCalendar = ({ data }: { data: HomeDashboardData }) => (
  <section className="rounded-b-[32px] bg-white px-5 pb-6 pt-4">
    <div className="grid grid-cols-7 gap-2">
      {data.week.days.map((day) => (
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
                ? "bg-primary-300 text-white"
                : "border-2 border-gray-100 bg-white text-transparent"
            }`}
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
