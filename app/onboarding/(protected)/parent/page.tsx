"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClearCircleIcon } from "@/components/icons";
import { DateInput } from "@/components/onboarding/date-input";
import { SegmentedToggle } from "@/components/onboarding/segmented-toggle";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Gender, ParentDraft, WorkStatus } from "@/lib/types";

export default function ParentPage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [parent, setParent] = useState<ParentDraft>(draft?.parent ?? {});

  // App Store 4.0(Sign in with Apple): 이름은 Apple 인증이 제공하므로 재입력을 강요하지 않는다.
  // Apple 로그인 시 mobile이 user_metadata.full_name에 저장 → 이름이 비어 있으면 그 값으로 자동 채움.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata as
        | { full_name?: string; given_name?: string; family_name?: string }
        | undefined;
      const name =
        meta?.full_name?.trim() ||
        [meta?.given_name, meta?.family_name].filter(Boolean).join(" ").trim();
      if (!cancelled && name) {
        setParent((prev) => (prev.name ? prev : { ...prev, name }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // App Store 5.1.1: 생년월일·성별은 핵심 기능에 불필요하므로 선택 입력. 이름만 필수.
  const canSubmit = Boolean(parent.name);

  const update = (next: Partial<ParentDraft>) =>
    setParent((prev) => ({ ...prev, ...next }));

  const submit = () => {
    if (!canSubmit) return;
    patch({ parent, lastStep: "parent" });
    track({ type: "onboarding_step_complete", step: "parent" });
    if (parent.workStatus !== undefined && parent.workStatus !== null) {
      track({ type: "onboarding_work_status_filled" });
    }
    router.push("/onboarding/interest");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <OnboardingHeader variant="back" />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="py-6">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
            프로필 정보를
            <br />
            입력해 주세요
          </h1>
        </header>

        <div className="flex flex-col gap-4">
          <Field label="이름" required>
            <Input
              type="text"
              maxLength={30}
              required
              placeholder="이름을 입력하세요"
              value={parent.name ?? ""}
              onChange={(e) => update({ name: e.target.value })}
              trailing={
                parent.name ? (
                  <IconButton
                    label="이름 지우기"
                    onClick={() => update({ name: "" })}
                    // 아이콘을 오른쪽 끝에 정렬 → DateInput의 화살표와 같은 위치.
                    className="w-6 h-6 m-0 justify-end text-gray-300"
                  >
                    <ClearCircleIcon size={20} />
                  </IconButton>
                ) : null
              }
            />
          </Field>

          <Field
            label="생년월일"
            action={
              <OptOutButton
                label="공개 안 함"
                onClick={() => update({ birthDate: undefined })}
              />
            }
          >
            <DateInput
              value={parent.birthDate}
              onChange={(iso) => update({ birthDate: iso })}
              // 부모 연령 범위 — 만 18세 이상 ~ 만 70세 이하
              yearMin={new Date().getFullYear() - 70}
              yearMax={new Date().getFullYear() - 18}
              // 시작 위치: 만 30세 기준 (가장 흔한 부모 연령대)
              defaultYear={new Date().getFullYear() - 30}
            />
          </Field>

          <Field
            label="성별"
            action={
              <OptOutButton
                label="선택 안 함"
                onClick={() => update({ gender: undefined })}
              />
            }
          >
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

          <Field
            label="직장 유무"
            action={
              <OptOutButton
                label="공개 안 함"
                onClick={() => update({ workStatus: undefined })}
              />
            }
          >
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
      </div>

      <div className="shrink-0">
        <Button type="submit" size="full" disabled={!canSubmit}>
          다음
        </Button>
      </div>
    </form>
  );
}

// 생년월일·성별·직장유무를 "공개/선택 안 함" 처리하는 회색 언더라인 텍스트 버튼.
// 라벨 우측에 배치되며, 탭하면 해당 값을 비운다. (App Store 5.1.1 — 선택 입력)
function OptOutButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium leading-[1.4] text-gray-500 underline underline-offset-2"
    >
      {label}
    </button>
  );
}

function Field({
  label,
  required,
  action,
  children,
}: {
  label: string;
  required?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium leading-[1.4] text-gray-800">
          {label}
          {required ? (
            <span className="text-error-600 font-bold ml-0.5">*</span>
          ) : null}
        </span>
        {action ?? null}
      </div>
      {children}
    </div>
  );
}
