"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";

export default function IntroPage() {
  const router = useRouter();
  const { isDirty, clear } = useOnboardingDraft();
  const [startFresh, setStartFresh] = useState(false);

  useEffect(() => {
    track({ type: "onboarding_intro_view" });
  }, []);

  // isDirty(외부 store)는 동기 snapshot이라 effect 없이 derived 가능.
  // "처음부터" 클릭으로 startFresh가 true가 되면 다이얼로그 닫고 일반 인트로.
  if (isDirty && !startFresh) {
    return (
      <div className="flex flex-col gap-4 items-stretch flex-1 justify-center">
        <h1 className="text-xl font-semibold">이어서 작성하시겠어요?</h1>
        <p className="text-sm text-zinc-600">
          이전에 작성하다 만 온보딩이 있습니다.
        </p>
        <button
          type="button"
          onClick={() => router.push("/onboarding/parent")}
          className="h-12 rounded-xl bg-zinc-900 text-white font-medium"
        >
          이어서 작성하기
        </button>
        <button
          type="button"
          onClick={() => {
            clear();
            setStartFresh(true);
          }}
          className="h-12 rounded-xl border border-zinc-300 text-zinc-700 font-medium"
        >
          처음부터
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-end">
        <Link
          href="/onboarding/parent"
          onClick={() => track({ type: "onboarding_skip", from: "intro" })}
          className="text-sm text-zinc-500"
        >
          건너뛰기
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
        <div className="text-6xl">💝</div>
        <h1 className="text-2xl font-semibold leading-tight">
          워킹맘의 하루를
          <br />더 의미있게
        </h1>
        <p className="text-sm text-zinc-600 max-w-xs">
          바쁜 일상 속에서도 아이와의 소중한 순간을 놓치지 마세요.
        </p>
        <p className="text-xs text-zinc-400">
          ※ 인트로 화면 구성은 디자인 확정 전 placeholder
        </p>
      </div>

      <Link
        href="/onboarding/parent"
        className="h-14 rounded-2xl bg-zinc-900 text-white font-medium flex items-center justify-center"
      >
        다음
      </Link>
    </div>
  );
}
