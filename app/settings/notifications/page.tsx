"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { TimeBottomSheet } from "@/components/onboarding/time-bottom-sheet";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { NotificationPreferenceType } from "@/lib/types";

type Pref = { enabled: boolean; time: string };
type Prefs = Record<NotificationPreferenceType, Pref>;

const DEFAULT_PREFS: Prefs = {
  play_10min: { enabled: true, time: "19:00" },
  weekly_report: { enabled: true, time: "19:00" },
};

const SECTIONS: Array<{
  type: NotificationPreferenceType;
  title: string;
}> = [
  { type: "play_10min", title: "10분 놀이 알림" },
  { type: "weekly_report", title: "주간 리포트 알림" },
];

function formatTime(time: string): string {
  // "HH:MM" → "h:MM AM/PM"
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

/** 알림 설정 — Figma 2395:9126 / 2395:9211(시간 sheet). */
export default function SettingsNotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [editing, setEditing] = useState<NotificationPreferenceType | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const me = await api.getMe();
        const next: Prefs = { ...DEFAULT_PREFS };
        for (const row of me.notificationPreferences ?? []) {
          next[row.type] = { enabled: row.enabled, time: row.time };
        }
        setPrefs(next);
      } catch {
        // 초기 fetch 실패는 default로 유지 — 사용자가 변경 시 PATCH는 시도 가능
      }
    })();
  }, []);

  const patch = async (
    type: NotificationPreferenceType,
    next: Partial<Pref>,
  ) => {
    const prev = prefs[type];
    const merged = { ...prev, ...next };
    setPrefs((p) => ({ ...p, [type]: merged }));
    setError(null);
    try {
      await api.upsertNotificationPreference(type, {
        enabled: merged.enabled,
        time: merged.time,
      });
      track({
        type: "settings_notification_change",
        notificationType: type,
        enabled: merged.enabled,
      });
    } catch (e) {
      // 롤백
      setPrefs((p) => ({ ...p, [type]: prev }));
      const message =
        e instanceof ApiError ? `저장 실패 (${e.status})` : "네트워크 오류";
      setError(message);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <OnboardingHeader variant="back" />

      <header className="py-6">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          알림 설정
        </h1>
      </header>

      <div className="flex flex-col gap-5">
        {SECTIONS.map(({ type, title }) => {
          const pref = prefs[type];
          return (
            <section key={type} className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-gray-700">{title}</h2>
              <div className="flex flex-col rounded-2xl bg-gray-50">
                <Row
                  label="알람 받기"
                  control={
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={(next) => void patch(type, { enabled: next })}
                      ariaLabel={`${title} 받기`}
                    />
                  }
                />
                <div className="mx-4 border-t border-gray-100" />
                <Row
                  label="알림 받을 시간"
                  control={
                    <button
                      type="button"
                      onClick={() => setEditing(type)}
                      disabled={!pref.enabled}
                      className={cn(
                        "flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium",
                        pref.enabled ? "text-gray-800" : "text-gray-400",
                      )}
                    >
                      {formatTime(pref.time)}
                      <ChevronRight className="size-3.5 text-gray-400" />
                    </button>
                  }
                />
              </div>
            </section>
          );
        })}
      </div>

      {error ? (
        <p className="pt-4 text-center text-sm text-red-500">{error}</p>
      ) : null}

      {editing ? (
        <TimeBottomSheet
          initialTime={prefs[editing].time}
          onClose={() => setEditing(null)}
          onConfirm={(time) => {
            void patch(editing, { time });
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function Row({ label, control }: { label: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-gray-800">{label}</span>
      {control}
    </div>
  );
}

function Switch({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full transition-colors",
        checked ? "bg-[#9572ff]" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
