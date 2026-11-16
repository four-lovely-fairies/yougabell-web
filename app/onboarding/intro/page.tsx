"use client";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Mascot } from "@/components/characters/mascot";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { AppleIcon, GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { buildOAuthRedirectTo, getOAuthErrorMessage } from "@/lib/auth-oauth";
import { track } from "@/lib/analytics";
import { getOnboardingResumePath } from "@/lib/onboarding-draft";
import {
  hasSeenOnboardingGuide,
  ONBOARDING_GUIDE_PATH,
} from "@/lib/onboarding-guide";
import { waitForServerSession } from "@/lib/server-session-ready";
import {
  isNativeWebView,
  notifyMobile,
  subscribeToNativeMessages,
} from "@/lib/native-bridge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "apple";

const subscribeNoop = () => () => {};

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
  // 서버 렌더에서는 알 수 없으므로 null → 클라이언트에서 확인 후 결정.
  const guideSeen = useSyncExternalStore(
    subscribeNoop,
    hasSeenOnboardingGuide,
    () => null,
  );

  useEffect(() => {
    if (guideSeen === false) router.replace(ONBOARDING_GUIDE_PATH);
  }, [guideSeen, router]);

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

  // 서비스 소개를 아직 안 봤으면 가이드로 이동하는 동안 아무것도 그리지 않는다.
  if (guideSeen !== true) {
    return <div className="flex-1" />;
  }

  if (shouldShowResume) {
    return (
      <div className="flex flex-1 animate-dissolve flex-col justify-center gap-4 px-6 motion-reduce:animate-none">
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
    <div className="relative flex min-h-0 flex-1 animate-dissolve flex-col motion-reduce:animate-none">
      {/* 배경 — 아주 옅게 번지는 보라 원 2개. layout px-5(20px)만큼 좌표 보정. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[163px] -top-[94px] h-[297px] w-[321px] rotate-[-5.78deg] rounded-full bg-primary-100/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[120px] top-[252px] h-[253px] w-[564px] rounded-full bg-primary-50 blur-[140px]"
      />

      {/* 상태바(47px) + 9px 아래에서 시작, 314px 영역(pt 80px) 안에서 문구를 세로 가운데 정렬 */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center pt-[calc(max(47px,env(safe-area-inset-top))+9px)]">
        <div className="flex h-[314px] min-h-0 w-full shrink flex-col items-center justify-center gap-5 pt-20 text-center">
          <h1
            className="animate-enter-up text-[24px] font-bold leading-[1.4] text-gray-800 motion-reduce:animate-none"
            style={{ animationDelay: "120ms" }}
          >
            워킹맘의 하루를
            <br />더 의미있게
          </h1>
          <p
            className="animate-enter-up text-sm font-medium leading-[1.4] text-gray-500 motion-reduce:animate-none"
            style={{ animationDelay: "220ms" }}
          >
            바쁜 일상 속에서도
            <br />
            아이와의 소중한 순간을 놓치지 마세요
          </p>
        </div>
        <div
          className="mt-10 shrink-0 animate-dissolve motion-reduce:animate-none"
          style={{ animationDelay: "360ms" }}
        >
          <Mascot pose="spiky" className="w-38" />
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col gap-3 pb-2">
        {authError ? (
          <p className="text-center text-sm font-medium text-red-500">
            {authError}
          </p>
        ) : null}
        <button
          type="button"
          disabled={pendingProvider !== null}
          onClick={() => void handleOAuthSignIn("google")}
          className="flex h-[52px] w-full items-center justify-between rounded-[12px] border border-gray-100 bg-white px-4 disabled:opacity-60"
        >
          <GoogleIcon size={24} />
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
          <AppleIcon size={24} />
          <span className="text-base font-medium leading-[1.4]">
            {pendingProvider === "apple" ? "연결 중..." : "Apple로 계속하기"}
          </span>
          <span aria-hidden className="size-6" />
        </button>
      </div>
    </div>
  );
}
