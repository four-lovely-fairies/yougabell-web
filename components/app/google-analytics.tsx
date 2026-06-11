import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

// NEXT_PUBLIC_GA_ID가 있을 때만 GA를 로드한다.
// ID는 Vercel production 환경에만 등록 → preview/dev에서는 미설정이라 자동 미로드.
export const GoogleAnalytics = () => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) {
    return null;
  }

  return <NextGoogleAnalytics gaId={gaId} />;
};
