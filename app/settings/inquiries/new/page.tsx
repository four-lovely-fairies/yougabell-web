"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track({ type: "inquiry_form_view" });
  }, []);

  const canSubmit =
    title.trim().length > 0 &&
    body.trim().length >= BODY_MIN &&
    body.trim().length <= BODY_MAX &&
    !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await createInquiry({
        ...(category ? { category } : {}),
        title: title.trim(),
        body: body.trim(),
      });
      track({ type: "inquiry_submit", category });
      router.replace("/settings/inquiries");
    } catch (e) {
      setError(toErrorMessage(e));
      setSubmitting(false);
    }
  };

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
            placeholder={`문의 내용을 ${BODY_MIN}자 이상 적어주세요.`}
            onChange={(e) => setBody(e.target.value)}
            className="resize-none rounded-2xl border border-gray-100 bg-white px-4 py-3 text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-300"
          />
          <p className="text-right text-xs text-gray-400">
            {body.trim().length} / {BODY_MAX}
          </p>
        </div>

        <p className="pb-2 text-xs leading-[1.5] text-gray-400">
          답변은 가입하신 이메일로 안내드리며, 앱 알림으로도 알려드려요.
          주민등록번호·카드번호 등 민감한 개인정보는 적지 말아주세요.
        </p>
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
          disabled={!canSubmit}
          onClick={() => void onSubmit()}
        >
          {submitting ? "보내는 중..." : "문의 보내기"}
        </Button>
      </div>
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
