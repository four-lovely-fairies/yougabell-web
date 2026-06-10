import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

// NEXT_PUBLIC_GA_ID가 있고 production일 때만 GA를 로드한다.
// dev/preview 트래픽이 프로덕션 측정치를 오염시키지 않도록 게이팅.
export const GoogleAnalytics = () => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";

  if (!gaId || !isProduction) {
    return null;
  }

  return <NextGoogleAnalytics gaId={gaId} />;
};
