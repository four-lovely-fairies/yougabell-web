"use client";

import { showToast } from "@/lib/toast";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { TimeBottomSheet } from "@/components/onboarding/time-bottom-sheet";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import {
  isNativeWebView,
  openNativeNotificationSettings,
  requestNativePushPermission,
  requestNativePushPermissionStatus,
} from "@/lib/native-bridge";
import { NOTIFICATION_SLOT_META } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { NotificationPreferenceType, MeResponse } from "@/lib/types";

type Pref = { enabled: boolean; time: string };
type Prefs = Record<NotificationPreferenceType, Pref>;

const DEFAULT_PREFS: Prefs = {
  play_10min: { enabled: false, time: "19:00" },
  weekly_report: { enabled: false, time: "12:00" },
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

function derivePrefsFromMe(me: MeResponse): Prefs {
  const next: Prefs = { ...DEFAULT_PREFS };

  if ((me.notificationPreferences?.length ?? 0) > 0) {
    for (const row of me.notificationPreferences ?? []) {
      next[row.type] = { enabled: row.enabled, time: row.time };
    }
    return next;
  }

  if (!me.notificationSlot) {
    return next;
  }

  const legacyTime =
    me.notificationTime ??
    (me.notificationSlot === "custom"
      ? "19:00"
      : (NOTIFICATION_SLOT_META[me.notificationSlot].defaultTime ?? "19:00"));

  return {
    play_10min: { enabled: true, time: legacyTime },
    weekly_report: { enabled: true, time: "12:00" },
  };
}

/** 알림 설정 — Figma 2395:9126 / 2395:9211(시간 sheet). */
export default function SettingsNotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [editing, setEditing] = useState<NotificationPreferenceType | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [marketing, setMarketing] = useState(false);
  // 기기 알림 권한 — 앱(WebView)에서만 확인한다. 꺼져 있으면 시간 설정 대신 빈 화면 + [알림 켜기].
  // 서버 렌더와 맞추려고 처음엔 항상 확인 중으로 두고, 브라우저에서 바로 판정한다.
  const [permission, setPermission] = useState<"checking" | "on" | "off">(
    "checking",
  );
  const [deviceStatus, setDeviceStatus] = useState<
    "granted" | "denied" | "undetermined" | null
  >(null);

  const checkPermission = useCallback(async () => {
    if (!isNativeWebView()) {
      setPermission("on");
      return;
    }
    const status = await requestNativePushPermissionStatus();
    setDeviceStatus(status);
    // 응답이 없으면(null) 막지 않고 설정을 보여준다.
    setPermission(
      status === "denied" || status === "undetermined" ? "off" : "on",
    );
  }, []);

  // 들어올 때 + 기기 설정에서 권한을 켜고 돌아왔을 때 다시 확인
  useEffect(() => {
    const first = window.setTimeout(() => void checkPermission(), 0);
    const onVisible = () => {
      if (document.visibilityState === "visible") void checkPermission();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(first);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkPermission]);

  useEffect(() => {
    if (permission === "off")
      track({ type: "settings_notification_permission_view" });
  }, [permission]);

  /** [알림 켜기] — 처음이면 권한 팝업, 이미 거부했으면 기기 설정으로 보낸다(다시 물어볼 수 없음). */
  const turnOnPermission = async () => {
    if (deviceStatus !== "undetermined") {
      track({
        type: "settings_notification_permission_click",
        result: "opened_settings",
      });
      openNativeNotificationSettings();
      return;
    }
    const result = await requestNativePushPermission();
    track({
      type: "settings_notification_permission_click",
      result: result === "granted" ? "granted" : "denied",
    });
    if (result === "granted") {
      setPermission("on");
      setDeviceStatus("granted");
      showToast("알림을 켰어요", { icon: "check" });
    } else {
      openNativeNotificationSettings();
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const me = await api.getMe();
        setPrefs(derivePrefsFromMe(me));
        // 동의 이력이 없으면(null) 미동의 — 온보딩에서 값이 서버로 오지 않던 시기의
        // 사용자가 여기 해당한다 (docs/features/20260729-consent-storage.md).
        setMarketing(me.consents?.marketing?.agreed ?? false);
      } catch {
        // 초기 fetch 실패는 default로 유지 — 사용자가 변경 시 PATCH는 시도 가능
      }
    })();
  }, []);

  // 알림 설정 진입 시, OS 권한이 이미 허용돼 있으면 푸시 토큰을 조용히 재등록한다.
  // (프롬프트 없음 — 상태가 granted일 때만 요청.) 온보딩에서만 등록되던 구조를 보완해,
  // 과거 사용자가 이 화면만 열어도 토큰이 저장되도록 한다.
  useEffect(() => {
    if (!isNativeWebView()) return;
    void (async () => {
      const status = await requestNativePushPermissionStatus();
      if (status === "granted") {
        await requestNativePushPermission();
      }
    })();
  }, []);

  /**
   * 마케팅 수신동의 토글. 알림 preference와 달리 **동의 이력**이라 append-only로 쌓인다.
   * 실패 시 즉시 롤백 — 동의 상태가 실제 기록과 어긋난 채 보이면 안 된다.
   */
  const toggleMarketing = async (next: boolean) => {
    const prev = marketing;
    setError(null);
    setMarketing(next);
    try {
      await api.updateConsent("marketing", next);
      showToast(
        next
          ? "마케팅 정보 수신에 동의했어요"
          : "마케팅 정보 수신 동의를 철회했어요",
      );
    } catch (e) {
      setMarketing(prev);
      setError(
        e instanceof ApiError ? `저장 실패 (${e.status})` : "네트워크 오류",
      );
    }
  };

  const patch = async (
    type: NotificationPreferenceType,
    next: Partial<Pref>,
  ) => {
    const prev = prefs[type];
    const merged = { ...prev, ...next };
    setError(null);

    if (!prev.enabled && merged.enabled && isNativeWebView()) {
      const permission = await requestNativePushPermission();
      if (permission !== "granted") {
        setError("기기 설정에서 알림 권한을 허용한 뒤 다시 켜주세요.");
        openNativeNotificationSettings();
        return;
      }
    }

    setPrefs((p) => ({ ...p, [type]: merged }));
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
      const label = type === "weekly_report" ? "주간 리포트" : "10분 놀이";
      showToast(
        merged.enabled !== prev.enabled
          ? `${label} 알림을 ${merged.enabled ? "켰어요" : "껐어요"}`
          : "알림 시간이 변경되었어요",
      );
    } catch (e) {
      // 롤백
      setPrefs((p) => ({ ...p, [type]: prev }));
      const message =
        e instanceof ApiError ? `저장 실패 (${e.status})` : "네트워크 오류";
      setError(message);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-10">
      <OnboardingHeader variant="back" />

      <header className="py-6">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          알림 설정
        </h1>
      </header>

      <div className="flex flex-col gap-5">
        {permission === "off" ? (
          <NotificationOffState onTurnOn={() => void turnOnPermission()} />
        ) : null}
        {permission === "on" &&
          SECTIONS.map(({ type, title }) => {
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
                        onCheckedChange={(next) =>
                          void patch(type, { enabled: next })
                        }
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

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-gray-700">마케팅 수신동의</h2>
          <div className="flex flex-col rounded-2xl bg-gray-50">
            <Row
              label="혜택·소식 받기"
              control={
                <Switch
                  checked={marketing}
                  onCheckedChange={(next) => void toggleMarketing(next)}
                  ariaLabel="마케팅 수신동의"
                />
              }
            />
          </div>
          <p className="px-1 text-xs leading-[1.5] text-gray-500">
            새 기능·이벤트 소식을 이메일로 받아요. 선택 항목이라 끄셔도 서비스
            이용에는 영향이 없어요.
          </p>
        </section>
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

/** 기기 알림 권한이 꺼져 있을 때 — 다른 빈 화면과 같은 구성(그림 + 굵은 제목 + 회색 설명) + CTA */
function NotificationOffState({ onTurnOn }: { onTurnOn: () => void }) {
  return (
    <div
      className="flex animate-dissolve flex-col items-center py-10 text-center leading-[1.4] motion-reduce:animate-none"
      style={{ animationDuration: "300ms" }}
    >
      <Image
        src="/images/notification/notification-off.png"
        alt=""
        width={80}
        height={89}
      />
      <p className="mt-5 text-lg font-bold text-gray-800">알림이 꺼져있어요</p>
      <p className="mt-1.5 text-sm text-gray-500">
        알림을 받기 위해 권한 허용이 필요해요
      </p>
      <button
        type="button"
        onClick={onTurnOn}
        className="mt-6 h-11 rounded-full bg-primary-300 px-6 text-sm font-semibold text-white transition-transform active:scale-95"
      >
        알림 켜기
      </button>
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
        // flex 정렬로 thumb를 트랙 안쪽(p-0.5)에 가둔다. 트랙·thumb·padding이
        // 모두 같은 spacing 토큰이라 글꼴 배율과 무관하게 절대 밖으로 새지 않는다.
        "flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors",
        checked ? "justify-end bg-primary-300" : "justify-start bg-gray-300",
      )}
    >
      <span className="size-6 rounded-full bg-white shadow" />
    </button>
  );
}
