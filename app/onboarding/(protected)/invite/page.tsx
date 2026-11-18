"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InviteCodeView } from "@/components/referral/referral-views";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import {
  checkInviteCode,
  INVITE_CODE_ERRORS,
  normalizeInviteCode,
} from "@/lib/api/referral";

// 온보딩 마지막(아이 정보 다음) — 친구에게 받은 초대 코드. 진행 단계에는 세지 않는 선택 화면.
export default function InviteCodePage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [code, setCode] = useState(() => draft?.inviteCode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    track({ type: "invite_code_step_view" });
  }, []);

  const submit = async () => {
    const normalized = normalizeInviteCode(code);
    setChecking(true);
    try {
      const result = await checkInviteCode(normalized);
      if (!result.valid) {
        track({ type: "invite_code_submit", result: result.reason });
        setError(INVITE_CODE_ERRORS[result.reason]);
        return;
      }
      track({ type: "invite_code_submit", result: "valid" });
      patch({ inviteCode: normalized, lastStep: "invite" });
      router.push("/onboarding/done");
    } catch {
      track({ type: "invite_code_submit", result: "error" });
      setError(INVITE_CODE_ERRORS.error);
    } finally {
      setChecking(false);
    }
  };

  const skip = () => {
    track({ type: "invite_code_skip" });
    patch({ inviteCode: undefined, lastStep: "invite" });
    router.push("/onboarding/done");
  };

  return (
    <InviteCodeView
      value={code}
      error={error}
      checking={checking}
      onChange={(next) => {
        setCode(normalizeInviteCode(next));
        setError(null);
      }}
      onSubmit={() => void submit()}
      onSkip={skip}
      onBack={() => router.push("/onboarding/children")}
    />
  );
}
