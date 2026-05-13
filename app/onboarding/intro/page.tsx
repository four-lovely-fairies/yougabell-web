"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";

export default function IntroPage() {
  const router = useRouter();
  const { isDirty, clear } = useOnboardingDraft();
  const [startFresh, setStartFresh] = useState(false);

  useEffect(() => {
    track({ type: "onboarding_intro_view" });
  }, []);

  if (isDirty && !startFresh) {
    return (
      <div className="flex flex-col flex-1 justify-center gap-4 px-6">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          이어서 작성하시겠어요?
        </h1>
        <p className="text-sm text-gray-500">
          이전에 작성하다 만 온보딩이 있습니다.
        </p>
        <div className="flex flex-col gap-3 mt-2">
          <Button size="full" onClick={() => router.push("/onboarding/parent")}>
            이어서 작성하기
          </Button>
          <Button
            size="full"
            variant="outline"
            onClick={() => {
              clear();
              setStartFresh(true);
            }}
          >
            처음부터
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col flex-1">
      {/* 배경 ellipse decoration — Figma 2146:4252 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-40 size-[320px] rounded-full bg-primary-100 opacity-70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[230px] -left-24 w-[564px] h-[253px] rounded-full bg-primary-100 opacity-50 blur-2xl"
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-5 pt-20">
        <h1 className="text-[24px] font-bold leading-[1.4] text-gray-800">
          워킹맘의 하루를
          <br />더 의미있게
        </h1>
        <p className="text-sm font-medium leading-[1.4] text-gray-500">
          바쁜 일상 속에서도
          <br />
          아이와의 소중한 순간을 놓치지 마세요
        </p>
      </div>

      {/* 일러스트 자리 (160x160) */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div
          aria-hidden
          className="size-40 rounded-full bg-gradient-to-br from-primary-200 to-primary-100"
        />
      </div>

      {/* 하단 Apple 로그인 버튼 */}
      <div className="relative z-10 px-5 pb-5">
        <button
          type="button"
          onClick={() => {
            track({ type: "onboarding_skip", from: "intro" });
            router.push("/onboarding/parent");
          }}
          className="w-full h-[52px] rounded-xl bg-gray-800 text-white font-medium text-base flex items-center justify-center gap-2 backdrop-blur"
        >
          <AppleIcon size={20} />
          <span className="leading-[1.4]">Apple로 계속하기</span>
        </button>
      </div>
    </div>
  );
}
