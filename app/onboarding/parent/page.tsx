"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClearCircleIcon } from "@/components/icons";
import { DateInput } from "@/components/onboarding/date-input";
import { SegmentedToggle } from "@/components/onboarding/segmented-toggle";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import type { Gender, ParentDraft, WorkStatus } from "@/lib/types";

export default function ParentPage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [parent, setParent] = useState<ParentDraft>(draft?.parent ?? {});

  const canSubmit = Boolean(parent.name && parent.birthDate && parent.gender);

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
      className="flex flex-col flex-1"
    >
      <OnboardingHeader variant="back" />

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
                  className="w-6 h-6 m-0 text-gray-300"
                >
                  <ClearCircleIcon size={20} />
                </IconButton>
              ) : null
            }
          />
        </Field>

        <Field label="생년월일" required>
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

        <Field label="성별" required>
          <SegmentedToggle<Gender>
            ariaLabel="본인 성별"
            options={[
              { value: "female", label: "여자" },
              { value: "male", label: "남자" },
            ]}
            value={parent.gender ?? null}
            onChange={(v) => update({ gender: v ?? undefined })}
          />
        </Field>

        <Field label="직장 유무">
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

      <div className="flex-1 min-h-8" />

      <Button type="submit" size="full" disabled={!canSubmit}>
        다음
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
          <span className="text-error-600 font-bold ml-0.5">*</span>
        ) : null}
      </span>
      {children}
    </div>
  );
}
