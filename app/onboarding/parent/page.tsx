"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateTriple } from "@/components/onboarding/date-triple";
import { SegmentedToggle } from "@/components/onboarding/segmented-toggle";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import type { Gender, ParentDraft, WorkStatus } from "@/lib/types";

export default function ParentPage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [parent, setParent] = useState<ParentDraft>(draft?.parent ?? {});

  const canSubmit =
    parent.name && parent.birthDate && parent.gender;

  const update = (next: Partial<ParentDraft>) =>
    setParent((prev) => ({ ...prev, ...next }));

  const submit = () => {
    if (!canSubmit) return;
    patch({ parent, lastStep: "parent" });
    track({ type: "onboarding_step_complete", step: "parent" });
    if (parent.workStatus !== undefined && parent.workStatus !== null) {
      track({ type: "onboarding_work_status_filled" });
    }
    router.push("/onboarding/children");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col flex-1 gap-6"
    >
      <header>
        <h1 className="text-2xl font-semibold">본인 정보</h1>
        <p className="text-sm text-zinc-600 mt-1">
          회원님에 대해 알려주세요.
        </p>
      </header>

      <div className="space-y-2">
        <label className="text-sm font-medium">이름 *</label>
        <input
          type="text"
          maxLength={30}
          required
          placeholder="이름을 입력하세요"
          value={parent.name ?? ""}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border border-zinc-300 bg-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">생년월일 *</label>
        <DateTriple
          value={parent.birthDate}
          onChange={(iso) => update({ birthDate: iso })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">성별 *</label>
        <SegmentedToggle<Gender>
          ariaLabel="본인 성별"
          options={[
            { value: "female", label: "여성" },
            { value: "male", label: "남성" },
          ]}
          value={parent.gender ?? null}
          onChange={(v) => update({ gender: v ?? undefined })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          직장 유무 <span className="text-zinc-400 font-normal">(선택)</span>
        </label>
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
      </div>

      <div className="flex-1" />

      <button
        type="submit"
        disabled={!canSubmit}
        className="h-14 rounded-2xl bg-zinc-900 text-white font-medium disabled:bg-zinc-300"
      >
        다음
      </button>
    </form>
  );
}
