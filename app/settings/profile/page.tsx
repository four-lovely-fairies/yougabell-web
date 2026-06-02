"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClearCircleIcon } from "@/components/icons";
import { DateInput } from "@/components/onboarding/date-input";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { SegmentedToggle } from "@/components/onboarding/segmented-toggle";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import type { Gender, ParentDraft, WorkStatus } from "@/lib/types";

/**
 * 본인 정보 수정 — Figma 2395:9320.
 * 온보딩 02 Filled와 동일 4필드. 진입 시 me에서 현재값 hydrate.
 */
export default function SettingsProfilePage() {
  const router = useRouter();
  const [parent, setParent] = useState<ParentDraft>({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const me = await api.getMe();
        setParent({
          name: me.name,
          // birthDate/gender는 선택(nullable) — 비어있을 수 있음.
          // API의 ISO datetime(...T00:00:00.000Z) → 입력 폼용 YYYY-MM-DD로 정규화.
          birthDate: me.birthDate ? me.birthDate.slice(0, 10) : undefined,
          gender: me.gender ?? undefined,
          workStatus: me.workStatus ?? undefined,
        });
      } catch {
        setError("현재 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (next: Partial<ParentDraft>) =>
    setParent((prev) => ({ ...prev, ...next }));

  // App Store 5.1.1: 생년월일·성별은 선택. 이름만 필수.
  const canSubmit = Boolean(parent.name);

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.updateParent({
        name: parent.name,
        birthDate: parent.birthDate,
        gender: parent.gender,
        workStatus: parent.workStatus ?? null,
      });
      track({ type: "settings_parent_save" });
      router.back();
    } catch (e) {
      const message =
        e instanceof ApiError ? `저장 실패 (${e.status})` : "네트워크 오류";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex flex-1 flex-col px-5 pb-5"
    >
      <OnboardingHeader variant="back" />

      <header className="py-6">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          본인 정보 수정
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        <Field label="이름" required>
          <Input
            type="text"
            maxLength={30}
            required
            placeholder="이름을 입력하세요"
            disabled={loading}
            value={parent.name ?? ""}
            onChange={(e) => update({ name: e.target.value })}
            trailing={
              parent.name ? (
                <IconButton
                  label="이름 지우기"
                  onClick={() => update({ name: "" })}
                  // 아이콘을 오른쪽 끝에 정렬 → DateInput 화살표와 같은 위치.
                  className="m-0 h-6 w-6 justify-end text-gray-300"
                >
                  <ClearCircleIcon size={20} />
                </IconButton>
              ) : null
            }
          />
        </Field>

        <Field label="생년월일">
          <DateInput
            value={parent.birthDate}
            onChange={(iso) => update({ birthDate: iso })}
            yearMin={new Date().getFullYear() - 70}
            yearMax={new Date().getFullYear() - 18}
            defaultYear={new Date().getFullYear() - 30}
          />
        </Field>

        <Field label="성별">
          <SegmentedToggle<Gender>
            ariaLabel="본인 성별"
            options={[
              { value: "female", label: "엄마" },
              { value: "male", label: "아빠" },
            ]}
            value={parent.gender ?? null}
            onChange={(v) => update({ gender: v ?? undefined })}
          />
        </Field>

        <Field label="직장 유무" required>
          <SegmentedToggle<WorkStatus>
            ariaLabel="직장 유무"
            allowDeselect
            options={[
              { value: "working", label: "일을 하고 있어요" },
              { value: "full_time_caregiver", label: "전업 가정인이에요" },
            ]}
            value={parent.workStatus ?? null}
            onChange={(v) => update({ workStatus: v })}
          />
        </Field>
      </div>

      <div className="min-h-8 flex-1" />

      {error ? (
        <p className="pb-2 text-center text-sm text-red-500">{error}</p>
      ) : null}

      <Button type="submit" size="full" disabled={!canSubmit || busy}>
        {busy ? "저장 중..." : "수정 완료"}
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium leading-[1.4] text-gray-800">
        {label}
        {required ? (
          <span className="ml-0.5 font-bold text-error-500">*</span>
        ) : null}
      </span>
      {children}
    </div>
  );
}
