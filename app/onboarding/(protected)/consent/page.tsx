"use client";

import { useRouter } from "next/navigation";
import { ConsentBottomSheet } from "@/components/onboarding/consent-bottom-sheet";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import type { ConsentDraft } from "@/lib/types";

/**
 * 이용약관 동의 — Figma 2146:4786.
 * bottom sheet가 메인 UI. 페이지 자체는 시트를 띄우는 컨테이너이며
 * 닫기/뒤로 시 intro로, 확인 시 parent로 이동.
 */
export default function ConsentPage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();

  const handleConfirm = (consents: ConsentDraft) => {
    patch({ consents, lastStep: "consent" });
    router.push("/onboarding/parent");
  };

  return (
    <ConsentBottomSheet
      initial={draft?.consents}
      onClose={() => router.replace("/onboarding")}
      onConfirm={handleConfirm}
    />
  );
}
