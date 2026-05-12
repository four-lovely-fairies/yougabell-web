"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChildCard } from "@/components/onboarding/child-card";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import type { ChildDraft } from "@/lib/types";
import { newTempId } from "@/lib/utils";

function emptyChild(): ChildDraft {
  return { tempId: newTempId() };
}

export default function ChildrenPage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [children, setChildren] = useState<ChildDraft[]>(
    draft?.children && draft.children.length > 0
      ? draft.children
      : [emptyChild()],
  );

  const isValid = (c: ChildDraft) =>
    Boolean(c.name && c.birthDate && c.gender);
  const canSubmit = children.length >= 1 && children.every(isValid);

  const updateChild = (idx: number, next: ChildDraft) => {
    setChildren((prev) => prev.map((c, i) => (i === idx ? next : c)));
  };
  const removeChild = (idx: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== idx));
  };
  const addChild = () => setChildren((prev) => [...prev, emptyChild()]);

  const back = () => router.push("/onboarding/parent");
  const submit = () => {
    if (!canSubmit) return;
    patch({ children, lastStep: "children" });
    track({ type: "onboarding_step_complete", step: "children" });
    router.push("/onboarding/app-usage");
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
        <h1 className="text-2xl font-semibold">자녀 정보</h1>
        <p className="text-sm text-zinc-600 mt-1">
          소중한 아이에 대해 알려주세요. 다자녀는 아래 &lsquo;자녀
          추가&rsquo; 버튼으로 입력하세요.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {children.map((c, idx) => (
          <ChildCard
            key={c.tempId}
            index={idx}
            child={c}
            onChange={(next) => updateChild(idx, next)}
            onRemove={children.length > 1 ? () => removeChild(idx) : undefined}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addChild}
        className="h-14 rounded-2xl border-2 border-dashed border-zinc-400 text-zinc-700 font-medium"
      >
        + 자녀 추가
      </button>

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={back}
          className="flex-1 h-14 rounded-2xl border border-zinc-300 text-zinc-700 font-medium"
        >
          이전
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 h-14 rounded-2xl bg-zinc-900 text-white font-medium disabled:bg-zinc-300"
        >
          다음
        </button>
      </div>
    </form>
  );
}
