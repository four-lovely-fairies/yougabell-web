"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClearCircleIcon } from "@/components/icons";
import { ConsentBottomSheet } from "@/components/onboarding/consent-bottom-sheet";
import { SegmentedToggle } from "@/components/onboarding/segmented-toggle";
import {
  ONBOARDING_STEPS,
  OnboardingHeader,
} from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ConsentDraft, ParentDraft, WorkStatus } from "@/lib/types";

export default function ParentPage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [parent, setParent] = useState<ParentDraft>(draft?.parent ?? {});

  // 약관 동의는 프로필(개인정보) 입력 전에 받아야 한다. 로그인 직후 처음 도달한
  // parent 화면 위에 동의 바텀시트를 오버레이로 띄우고(Figma 2146:4786), 필수 항목을
  // 동의해야 폼을 조작할 수 있다. 이미 동의한 재방문자(draft에 필수 동의 존재)는 건너뛴다.
  const [consentDone, setConsentDone] = useState(false);
  const requiredConsented = Boolean(
    draft?.consents?.service && draft?.consents?.privacy,
  );
  const showConsent = !requiredConsented && !consentDone;

  // 약관 시트가 먼저 뜨면 동의 단계, 아니면 바로 내 프로필 단계를 본 것으로 센다.
  useEffect(() => {
    track({
      type: "onboarding_step_view",
      step: showConsent ? "consent" : "parent",
    });
  }, [showConsent]);

  const handleConsentConfirm = (consents: ConsentDraft) => {
    track({
      type: "onboarding_step_complete",
      step: "consent",
      marketing: Boolean(consents.marketing),
    });
    patch({ consents });
    setConsentDone(true);
  };

  // 로그인 계정 이메일. 마케팅 수신동의를 받는 화면에서 "어느 주소로 받는지"를
  // 보여주지 않으면 동의의 유효성이 약하다 (docs/features/20260729-consent-storage.md §2.5).
  const [email, setEmail] = useState<string | null>(null);

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
      if (cancelled) return;
      setEmail(data.user?.email ?? null);
      if (name) {
        setParent((prev) => (prev.name ? prev : { ...prev, name }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Apple 비공개 이메일 릴레이 — 사용자가 처음 보면 자기 주소가 아닌 줄 안다.
  const isAppleRelay = Boolean(email?.endsWith("@privaterelay.appleid.com"));

  // 이탈 개선: 온보딩에서는 이름(미리 채움) + 아이와 함께하는 시간만 받는다.
  // 생년월일·성별은 마이페이지(설정 > 내 프로필)에서 선택 입력.
  const canSubmit = Boolean(parent.name?.trim()) && Boolean(parent.workStatus);

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
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <OnboardingHeader
          variant="back"
          progress={{ step: 1, total: ONBOARDING_STEPS }}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <header className="py-6">
            <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
              만나서 반가워요!
              <br />
              아이와 주로 언제 함께하세요?
            </h1>
          </header>

          <div className="flex flex-col gap-4">
            <Field label="이름">
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

            {/* 직장 유무를 직접 묻지 않고 "아이와 함께하는 시간"으로 바꿔 묻는다.
                값은 기존 workStatus(working / full_time_caregiver)에 그대로 매핑. */}
            <Field label="아이와 함께하는 시간" required>
              <SegmentedToggle<WorkStatus>
                ariaLabel="아이와 함께하는 시간"
                options={[
                  { value: "working", label: "퇴근 후·주말에" },
                  { value: "full_time_caregiver", label: "낮에도 함께 있어요" },
                ]}
                value={parent.workStatus ?? null}
                onChange={(v) => update({ workStatus: v ?? undefined })}
              />
            </Field>

            <div className="flex flex-col gap-1 text-xs leading-[1.4] text-gray-400">
              <p>성별·생년월일은 마이페이지에서 원할 때 입력할 수 있어요.</p>
              {/* 마케팅 수신 동의를 받은 화면이라 어느 주소로 로그인했는지는 계속 보여준다. */}
              {email ? (
                <p>
                  로그인 계정 {email}
                  {isAppleRelay ? " (Apple 전달용 주소)" : ""}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Button type="submit" size="full" disabled={!canSubmit}>
            다음
          </Button>
        </div>
      </form>
      {showConsent ? (
        <ConsentBottomSheet
          initial={draft?.consents}
          onClose={() => router.replace("/onboarding/intro")}
          onConfirm={handleConsentConfirm}
        />
      ) : null}
    </>
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
