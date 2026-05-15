"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { InterestCard } from "@/components/onboarding/interest-card";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import type { InterestId } from "@/lib/types";

const MAX_SELECT = 3;

const OPTIONS: Array<{ id: InterestId; emoji: string; label: string }> = [
  { id: "working-parent", emoji: "🤱🏻", label: "워킹맘·대디" },
  { id: "home-care", emoji: "🏠", label: "가정보육·집놀이" },
  { id: "language", emoji: "🗣️", label: "말문터지기" },
  { id: "social", emoji: "👥", label: "사회성·또래관계" },
  { id: "physical", emoji: "⚡️", label: "신체발달·에너지발산" },
  { id: "cognition", emoji: "📖", label: "똑똑한인지학습" },
];

export default function InterestPage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [selected, setSelected] = useState<InterestId[]>(
    draft?.interests ?? [],
  );

  const toggle = (id: InterestId) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, id];
    });
  };

  const canSubmit = selected.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    patch({ interests: selected, lastStep: "interest" });
    track({ type: "onboarding_step_complete", step: "interest" });
    router.push("/onboarding/notification");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-1 flex-col"
    >
      <OnboardingHeader variant="back" />

      <header className="flex flex-col gap-2 py-6">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          어떤 주제에
          <br />
          관심 있으신가요?
        </h1>
        <p className="text-sm text-gray-500">
          최근 관심사를 선택해주세요 (최대 {MAX_SELECT}개)
        </p>
      </header>

      <div className="flex flex-wrap gap-3 py-2">
        {OPTIONS.map((opt) => (
          <InterestCard
            key={opt.id}
            emoji={opt.emoji}
            label={opt.label}
            selected={selected.includes(opt.id)}
            disabled={selected.length >= MAX_SELECT}
            onToggle={() => toggle(opt.id)}
          />
        ))}
      </div>

      <div className="min-h-8 flex-1" />

      <Button type="submit" size="full" disabled={!canSubmit}>
        다음
      </Button>
    </form>
  );
}
