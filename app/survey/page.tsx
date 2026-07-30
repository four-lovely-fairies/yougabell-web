"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, X } from "lucide-react";
import {
  submitSatisfactionSurvey,
  type SubmitSatisfactionSurveyPayload,
} from "@/lib/api";

type DiscoverySource = SubmitSatisfactionSurveyPayload["discoverySource"];
type LikedOption = SubmitSatisfactionSurveyPayload["likedOptions"][number];

const DISCOVERY_OPTIONS: Array<{ value: DiscoverySource; label: string }> = [
  { value: "instagram", label: "인스타그램" },
  { value: "threads", label: "쓰레드" },
  { value: "app_store_search", label: "앱스토어 검색" },
  { value: "other", label: "기타" },
];

const LIKED_OPTIONS: Array<{ value: LikedOption; label: string }> = [
  { value: "today_play_useful", label: "오늘의 놀이가 유용해요" },
  { value: "trustworthy_info", label: "믿을 수 있는 정보예요" },
  { value: "quick_questions", label: "궁금한점을 바로 물어볼 수 있어요" },
  { value: "easy_to_use", label: "사용하기 편리해요" },
  { value: "nice_design", label: "디자인이 보기 좋아요" },
  { value: "easy_milestone_check", label: "마일스톤을 확인하기 편해요" },
  { value: "nothing_good", label: "좋았던점이 없어요" },
];

export default function SatisfactionSurveyPage() {
  const router = useRouter();
  const [discoverySource, setDiscoverySource] =
    useState<DiscoverySource | null>(null);
  const [experienceRating, setExperienceRating] = useState<number>(0);
  const [likedOptions, setLikedOptions] = useState<LikedOption[]>([]);
  const [improvementText, setImprovementText] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      Boolean(discoverySource) &&
      experienceRating >= 1 &&
      likedOptions.length > 0 &&
      !submitting,
    [discoverySource, experienceRating, likedOptions.length, submitting],
  );

  const toggleLikedOption = (option: LikedOption) => {
    setLikedOptions((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit || !discoverySource) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await submitSatisfactionSurvey({
        discoverySource,
        experienceRating,
        likedOptions,
        improvementText: improvementText.trim() || undefined,
        contact: contact.trim() || undefined,
      });
      router.replace("/survey/done");
    } catch {
      setErrorMessage("제출하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gray-20 px-5 pb-10 pt-safe text-gray-800">
      <div className="flex min-h-[calc(100dvh-12px)] flex-col">
        <div className="flex h-14 items-center justify-end">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => router.replace("/")}
            className="flex size-10 items-center justify-center text-gray-800"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>

        <div className="mt-7">
          <img
            src="/images/figma/survey/think-cloud.png"
            alt=""
            aria-hidden
            className="mb-3 h-9.75 w-8 object-contain"
          />
          <h1 className="text-[24px] font-bold leading-[1.35] text-gray-800">
            사용 경험은 어떠셨나요?
          </h1>
          <p className="mt-3 text-[15px] font-medium leading-[1.55] text-[#708090]">
            더 나은 육아벨을 만들기 위해 여러분의 의견을 듣고 있어요.
            <br />
            1분이면 참여할 수 있어요.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-[18px] font-bold leading-[1.4] text-gray-900">
            1. 서비스를 어떻게 알게 되셨나요?
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {DISCOVERY_OPTIONS.map((option) => {
              const selected = discoverySource === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDiscoverySource(option.value)}
                  className={`h-10 rounded-xl border px-4 text-[14px] font-bold leading-5 transition ${
                    selected
                      ? "border-gray-800 bg-gray-800 text-white"
                      : "border-gray-100 bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[18px] font-bold leading-[1.4] text-gray-900">
            2. 전반적으로 사용 경험은 어떠셨나요?
          </h2>
          <div className="mt-5 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((rating) => {
              const selected = rating <= experienceRating;
              return (
                <button
                  key={rating}
                  type="button"
                  aria-label={`${rating}점`}
                  onClick={() => setExperienceRating(rating)}
                  className="flex size-10 items-center justify-center"
                >
                  <Star
                    className={`size-8 ${
                      selected
                        ? "fill-primary-300 text-primary-300"
                        : "fill-white text-gray-300"
                    }`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[18px] font-bold leading-[1.4] text-gray-900">
            3. 특히 좋았던 점이 있다면 알려주세요
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {LIKED_OPTIONS.map((option) => {
              const selected = likedOptions.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleLikedOption(option.value)}
                  className={`min-h-11 rounded-xl border px-4 py-2.5 text-[14px] font-bold leading-5 transition ${
                    selected
                      ? "border-primary-200 bg-primary-50 text-primary-500"
                      : "border-gray-100 bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[18px] font-bold leading-[1.4] text-gray-900">
            4. 어떤 점을 개선하면 좋을까요?
          </h2>
          <textarea
            value={improvementText}
            onChange={(event) => setImprovementText(event.target.value)}
            maxLength={1000}
            className="mt-5 min-h-35 w-full resize-none rounded-[20px] border border-gray-100 bg-white px-5 py-5 text-base leading-[1.55] text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary-300"
            placeholder={
              "추가 개선사항이 있다면 자유롭게 남겨주세요.\n예) 사용이 번거로움, 마일스톤에 체크리스트가 추가되었으면 좋겠음, 오늘의 놀이를 모아볼 수 있었으면 좋겠음."
            }
          />
        </section>

        <section className="mt-12">
          <h2 className="text-[18px] font-bold leading-[1.4] text-gray-900">
            5. 기프티콘을 받을 연락처와 이름을 알려주세요.
          </h2>
          <p className="mt-2 text-[13px] font-medium leading-5 text-gray-500">
            커피 쿠폰을 받으려면 연락처를 제출해 주세요.
          </p>
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            maxLength={200}
            className="mt-4 h-16 w-full rounded-[20px] border border-gray-100 bg-white px-5 text-base font-medium text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary-300"
            placeholder="예) 010-1234-4568, 육아벨"
          />
        </section>

        {errorMessage ? (
          <p className="mt-5 text-center text-sm font-medium text-error-600">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-11 pb-[max(0px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            className="flex h-15 w-full items-center justify-center rounded-lg bg-primary-300 text-base font-bold leading-6 text-white disabled:bg-primary-100"
          >
            {submitting ? "제출 중..." : "제출하기"}
          </button>
        </div>
      </div>
    </main>
  );
}
