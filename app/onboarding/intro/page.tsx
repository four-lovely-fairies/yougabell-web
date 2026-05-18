"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { AppleIcon, GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function deriveAuthError(params: ReadonlyURLSearchParams): string | null {
  const error = params.get("error");
  if (!error) return null;
  if (error === "oauth_failed" || error === "session_exchange_failed") {
    return "구글 로그인 연결에 실패했습니다. 다시 시도해주세요.";
  }
  return "로그인 처리 중 문제가 발생했습니다.";
}

export default function IntroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDirty, clear } = useOnboardingDraft();
  const [startFresh, setStartFresh] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  // authError는 두 source를 합친다:
  // (1) callback URL의 ?error 파라미터 — searchParams 변경 시 derive
  // (2) OAuth 시도 직후 결과 — onClick에서 set
  // searchParams가 바뀐 순간만 그 값을 반영하기 위해 React 19 render-time 조건부 setState 패턴 사용.
  const [authError, setAuthError] = useState<string | null>(() =>
    deriveAuthError(searchParams),
  );
  const [lastSyncedParams, setLastSyncedParams] = useState(searchParams);
  if (lastSyncedParams !== searchParams) {
    setLastSyncedParams(searchParams);
    setAuthError(deriveAuthError(searchParams));
  }

  useEffect(() => {
    track({ type: "onboarding_intro_view" });
  }, []);

  if (isDirty && !startFresh) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 px-6">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          이어서 작성하시겠어요?
        </h1>
        <p className="text-sm text-gray-500">
          이전에 작성하다 만 온보딩이 있습니다.
        </p>
        <div className="mt-2 flex flex-col gap-3">
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
    <div className="relative flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-32 h-81.75 w-87.25 rotate-[-5.78deg] rounded-full bg-primary-100 opacity-70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-57.5 h-63.25 w-141 rounded-full bg-primary-100 opacity-50 blur-2xl"
      />

      <div className="relative z-10 flex flex-col items-center gap-5 pt-20 text-center">
        <h1 className="text-[24px] font-bold leading-[1.4] text-gray-800">
          워킹맘의 하루를
          <br />
          더 의미있게
        </h1>
        <p className="text-sm font-medium leading-[1.4] text-gray-500">
          바쁜 일상 속에서도
          <br />
          아이와의 소중한 순간을 놓치지 마세요
        </p>
      </div>

      {/* Figma 2146:4252 image 598 — sprite의 한 캐릭터 영역만 crop 노출 */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="relative h-31 w-38 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/onboarding/intro.png"
            alt=""
            aria-hidden
            className="absolute left-[-145.57%] top-[-16.11%] h-[381.08%] w-[381.22%] max-w-none"
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3 px-5 pb-5">
        {authError ? (
          <p className="text-center text-sm font-medium text-red-500">
            {authError}
          </p>
        ) : null}
        <button
          type="button"
          disabled={isGooglePending}
          onClick={async () => {
            setAuthError(null);
            setIsGooglePending(true);
            track({ type: "onboarding_google_sign_in_click" });

            const supabase = createSupabaseBrowserClient();
            const redirectTo = new URL("/auth/callback", window.location.origin);
            redirectTo.searchParams.set("next", "/onboarding/parent");

            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: redirectTo.toString(),
              },
            });

            if (error) {
              setAuthError("구글 로그인 연결에 실패했습니다. 다시 시도해주세요.");
              setIsGooglePending(false);
            }
          }}
          className="flex h-13 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-4 disabled:opacity-60"
        >
          <GoogleIcon size={20} />
          <span className="text-base font-medium leading-[1.4] text-gray-800">
            {isGooglePending ? "연결 중..." : "Google로 계속하기"}
          </span>
          <span aria-hidden className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => {
            track({ type: "onboarding_skip", from: "intro" });
            router.push("/onboarding/parent");
          }}
          className="flex h-13 w-full items-center justify-between rounded-md bg-gray-900 px-4 text-white"
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
