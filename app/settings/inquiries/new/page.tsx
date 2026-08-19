"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { InquiryConsentSheet } from "@/components/settings/inquiry/inquiry-consent-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client";
import {
  INQUIRY_CATEGORY_LABELS,
  createInquiry,
  type InquiryCategory,
} from "@/lib/api/inquiry";
import { cn } from "@/lib/utils";

const TITLE_MAX = 100;
const BODY_MIN = 10;
const BODY_MAX = 2000;

const CATEGORIES = Object.keys(INQUIRY_CATEGORY_LABELS) as InquiryCategory[];

/** 문의 작성 (docs/features/20260819-inquiry.md §4.2). */
export default function NewInquiryPage() {
  const router = useRouter();
  const [category, setCategory] = useState<InquiryCategory | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [consentSheetOpen, setConsentSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track({ type: "inquiry_form_view" });
  }, []);

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();

  // 제출을 막는 이유. 버튼을 비활성화하는 대신 눌렀을 때 이유를 알려준다 —
  // 비활성 버튼은 "왜 안 되는지"를 사용자에게 알려줄 방법이 없다.
  const blockReason = ((): string | null => {
    if (!trimmedTitle) return "제목을 입력해 주세요.";
    if (trimmedBody.length < BODY_MIN) {
      return `문의 내용을 ${BODY_MIN}자 이상 입력해 주세요. (현재 ${trimmedBody.length}자)`;
    }
    if (!privacyConsent) {
      return "개인정보 수집·이용에 동의해 주세요.";
    }
    return null;
  })();

  const onSubmit = async () => {
    if (submitting) return;
    if (blockReason) {
      setError(blockReason);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createInquiry({
        ...(category ? { category } : {}),
        title: trimmedTitle,
        body: trimmedBody,
        privacyConsent: true,
      });
      track({ type: "inquiry_submit", category });
      router.replace("/settings/inquiries");
    } catch (e) {
      setError(toErrorMessage(e));
      setSubmitting(false);
    }
  };

  const bodyTooShort = trimmedBody.length > 0 && trimmedBody.length < BODY_MIN;

  return (
    <div className="flex h-dvh flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
      <OnboardingHeader variant="back" />

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
        <header className="pt-6">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
            무엇을 도와드릴까요?
          </h1>
        </header>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="pb-2.5 text-sm font-medium text-gray-600">
            문의 유형 (선택)
          </legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((value) => {
              const selected = category === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(selected ? null : value)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-sm transition-colors",
                    selected
                      ? "border-primary-300 bg-primary-50 font-medium text-primary-600"
                      : "border-gray-100 text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {INQUIRY_CATEGORY_LABELS[value]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="inquiry-title"
            className="text-sm font-medium text-gray-600"
          >
            제목
          </label>
          <Input
            id="inquiry-title"
            value={title}
            maxLength={TITLE_MAX}
            placeholder="어떤 점이 궁금하신가요?"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="inquiry-body"
            className="text-sm font-medium text-gray-600"
          >
            내용
          </label>
          <textarea
            id="inquiry-body"
            value={body}
            maxLength={BODY_MAX}
            rows={8}
            aria-describedby="inquiry-body-hint"
            placeholder={`문의 내용을 ${BODY_MIN}자 이상 적어주세요.`}
            onChange={(e) => setBody(e.target.value)}
            className="resize-none rounded-2xl border border-gray-100 bg-white px-4 py-3 text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-300"
          />
          {/* 최소 글자 수는 placeholder에만 있으면 입력 시작과 동시에 사라진다. */}
          <p
            id="inquiry-body-hint"
            className={cn(
              "text-right text-xs",
              bodyTooShort ? "text-error-500" : "text-gray-400",
            )}
          >
            {bodyTooShort
              ? `${BODY_MIN}자 이상 입력해 주세요 (${trimmedBody.length}/${BODY_MIN})`
              : `${trimmedBody.length} / ${BODY_MAX}`}
          </p>
        </div>

        <div className="flex flex-col gap-2 pb-2">
          <div className="flex items-start gap-2.5">
            <input
              id="inquiry-privacy-consent"
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-primary-300"
            />
            <label
              htmlFor="inquiry-privacy-consent"
              className="text-sm leading-[1.5] text-gray-800"
            >
              개인정보 수집·이용에 동의합니다{" "}
              <span className="text-error-500">(필수)</span>
            </label>
          </div>
          <button
            type="button"
            onClick={() => setConsentSheetOpen(true)}
            className="self-start pl-7.5 text-xs text-gray-500 underline"
          >
            수집 항목·목적·보유기간 자세히 보기
          </button>
        </div>
      </div>

      <div className="shrink-0 pt-3">
        {error ? (
          <p
            aria-live="polite"
            className="pb-2 text-center text-sm text-error-500"
          >
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          size="full"
          disabled={submitting}
          onClick={() => void onSubmit()}
        >
          {submitting ? "보내는 중..." : "문의 보내기"}
        </Button>
      </div>

      {consentSheetOpen ? (
        <InquiryConsentSheet
          onClose={() => setConsentSheetOpen(false)}
          onAgree={() => {
            setPrivacyConsent(true);
            setConsentSheetOpen(false);
            setError(null);
          }}
        />
      ) : null}
    </div>
  );
}

function toErrorMessage(e: unknown): string {
  if (!(e instanceof ApiError)) return "네트워크 오류가 발생했습니다.";
  if (e.status === 409) {
    return "답변을 기다리는 문의가 너무 많아요. 기존 문의에 답변을 받은 뒤 다시 시도해 주세요.";
  }
  if (e.status === 400) return "입력한 내용을 다시 확인해 주세요.";
  return `문의 등록에 실패했습니다 (${e.status})`;
}
