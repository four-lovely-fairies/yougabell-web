"use client";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Mascot } from "@/components/characters/mascot";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { AppleIcon, GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { buildOAuthRedirectTo, getOAuthErrorMessage } from "@/lib/auth-oauth";
import { track } from "@/lib/analytics";
import { getOnboardingResumePath } from "@/lib/onboarding-draft";
import { waitForServerSession } from "@/lib/server-session-ready";
import {
  isNativeWebView,
  notifyMobile,
  subscribeToNativeMessages,
} from "@/lib/native-bridge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "apple";

function deriveAuthError(params: ReadonlyURLSearchParams): string | null {
  return getOAuthErrorMessage(params.get("error"));
}

export default function IntroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, isDirty, clear } = useOnboardingDraft();
  const [startFresh, setStartFresh] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(
    null,
  );
  const [oauthRequestError, setOauthRequestError] = useState<string | null>(
    null,
  );
  const shouldShowResume = isDirty && !startFresh;
  const resumePath = useMemo(() => getOnboardingResumePath(draft), [draft]);

  useEffect(() => {
    track({ type: "onboarding_intro_view" });
  }, []);

  const navigateToParentStep = useEffectEvent(() => {
    if (isNativeWebView()) {
      window.location.replace("/onboarding/parent");
      return;
    }

    router.replace("/onboarding/parent");
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!isNativeWebView()) {
      return;
    }

    void supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        if (data.session && !shouldShowResume) {
          void waitForServerSession().then(() => navigateToParentStep());
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session) return;
        setPendingProvider(null);
        if (shouldShowResume) return;
        void waitForServerSession().then(() => navigateToParentStep());
      },
    );

    const unsubscribe = subscribeToNativeMessages((message) => {
      if (message.type === "SUPABASE_SESSION_SYNC") {
        void (async () => {
          await supabase.auth.setSession({
            access_token: message.payload.accessToken,
            refresh_token: message.payload.refreshToken,
          });
          await waitForServerSession();
          setPendingProvider(null);
          if (shouldShowResume) return;
          navigateToParentStep();
        })();
      }

      if (message.type === "SUPABASE_SESSION_CLEARED") {
        setPendingProvider(null);
      }

      if (
        message.type === "NATIVE_GOOGLE_SIGN_IN_ERROR" ||
        message.type === "NATIVE_APPLE_SIGN_IN_ERROR"
      ) {
        setOauthRequestError(message.payload.message);
        setPendingProvider(null);
      }

      if (
        message.type === "NATIVE_GOOGLE_SIGN_IN_CANCELLED" ||
        message.type === "NATIVE_APPLE_SIGN_IN_CANCELLED"
      ) {
        setPendingProvider(null);
      }
    });

    notifyMobile({ type: "WEB_READY" });

    return () => {
      subscription.unsubscribe();
      unsubscribe();
    };
  }, [shouldShowResume]);

  const authCallbackError = useMemo(() => {
    return deriveAuthError(searchParams);
  }, [searchParams]);

  const authError = oauthRequestError ?? authCallbackError;

  async function handleOAuthSignIn(provider: OAuthProvider) {
    setOauthRequestError(null);
    setPendingProvider(provider);
    track({
      type:
        provider === "google"
          ? "onboarding_google_sign_in_click"
          : "onboarding_apple_sign_in_click",
    });

    if (isNativeWebView()) {
      notifyMobile({
        type:
          provider === "google"
            ? "REQUEST_NATIVE_GOOGLE_SIGN_IN"
            : "REQUEST_NATIVE_APPLE_SIGN_IN",
      });
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildOAuthRedirectTo(
          window.location.origin,
          "/onboarding/parent",
        ),
      },
    });

    if (error) {
      setOauthRequestError("로그인 연결에 실패했습니다. 다시 시도해주세요.");
      setPendingProvider(null);
    }
  }

  if (shouldShowResume) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 px-6">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          이어서 작성하시겠어요?
        </h1>
        <p className="text-sm text-gray-500">
          이전에 작성하다 만 온보딩이 있습니다.
        </p>
        <div className="mt-2 flex flex-col gap-3">
          <Button size="full" onClick={() => router.push(resumePath)}>
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
          <br />더 의미있게
        </h1>
        <p className="text-sm font-medium leading-[1.4] text-gray-500">
          바쁜 일상 속에서도
          <br />
          아이와의 소중한 순간을 놓치지 마세요
        </p>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <Mascot pose="spiky" className="w-38" />
      </div>

      <div className="relative z-10 flex shrink-0 flex-col gap-3 px-5 pb-5">
        {authError ? (
          <p className="text-center text-sm font-medium text-red-500">
            {authError}
          </p>
        ) : null}
        <button
          type="button"
          disabled={pendingProvider !== null}
          onClick={() => void handleOAuthSignIn("google")}
          className="flex h-[52px] w-full items-center justify-between rounded-[12px] border border-gray-200 bg-white px-4 disabled:opacity-60"
        >
          <GoogleIcon size={20} />
          <span className="text-base font-medium leading-[1.4] text-gray-800">
            {pendingProvider === "google" ? "연결 중..." : "Google로 계속하기"}
          </span>
          <span aria-hidden className="size-6" />
        </button>
        <button
          type="button"
          disabled={pendingProvider !== null}
          onClick={() => void handleOAuthSignIn("apple")}
          className="flex h-[52px] w-full items-center justify-between rounded-[12px] bg-gray-900 px-4 text-white disabled:opacity-60"
        >
          <AppleIcon size={20} />
          <span className="text-base font-medium leading-[1.4]">
            {pendingProvider === "apple" ? "연결 중..." : "Apple로 계속하기"}
          </span>
          <span aria-hidden className="size-6" />
        </button>
      </div>
    </div>
  );
}
