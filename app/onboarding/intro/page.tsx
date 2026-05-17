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
          <Button size="full" onClick={() => router.push("/onboarding/consent")}>
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

      {/* Figma 2146:4252 — image 598. 152x124 캐릭터 일러스트 */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/onboarding/intro.png"
          alt=""
          aria-hidden
          width={152}
          height={124}
          className="h-[124px] w-[152px] object-contain"
        />
      </div>

      {/* Figma 2388:4475/4432 — Google + Apple 두 버튼, h-52 rounded-12 */}
      <div className="relative z-10 flex flex-col gap-3 px-5 pb-5">
        <button
          type="button"
          onClick={() => {
            // TODO(auth): Google OAuth via Supabase
            track({ type: "onboarding_skip", from: "intro" });
            router.push("/onboarding/consent");
          }}
          className="flex h-[52px] w-full items-center justify-between rounded-[12px] border border-gray-200 bg-white px-4"
        >
          <GoogleIcon />
          <span className="text-base font-medium leading-[1.4] text-gray-800">
            Google로 계속하기
          </span>
          <span aria-hidden className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => {
            track({ type: "onboarding_skip", from: "intro" });
            // TODO(auth): Apple OAuth via Supabase
            router.push("/onboarding/consent");
          }}
          className="flex h-[52px] w-full items-center justify-between rounded-[12px] bg-gray-900 px-4 text-white"
        >
          <AppleIcon size={20} />
          <span className="text-base font-medium leading-[1.4]">
            Apple로 계속하기
          </span>
          <span aria-hidden className="size-6" />
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
