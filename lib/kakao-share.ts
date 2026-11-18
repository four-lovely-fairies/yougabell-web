// 카카오톡 공유 — 카카오 JavaScript SDK로 친구 선택 화면을 바로 연다.
// JavaScript 키는 웹에 그대로 노출되는 공개용 키다(카카오 개발자 콘솔 → 플랫폼 키).
// 카카오 콘솔의 JavaScript SDK 도메인·사이트 도메인에 육아벨 웹 주소와
// 링크 주소(linktr.ee)가 등록돼 있어야 공유가 열린다.

const KAKAO_JS_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "75a869f19e7040f5fea7a8f16a2e8990";
const KAKAO_SDK_URL =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

type KakaoLink = { mobileWebUrl: string; webUrl: string };
type KakaoSdk = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: {
    sendDefault: (template: {
      objectType: "feed";
      content: {
        title: string;
        description: string;
        imageUrl: string;
        imageWidth: number;
        imageHeight: number;
        link: KakaoLink;
      };
      buttons?: Array<{ title: string; link: KakaoLink }>;
    }) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

let loading: Promise<KakaoSdk> | null = null;

function loadKakao(): Promise<KakaoSdk> {
  if (window.Kakao) return Promise.resolve(window.Kakao);
  loading ??= new Promise<KakaoSdk>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () =>
      window.Kakao ? resolve(window.Kakao) : reject(new Error("no Kakao"));
    script.onerror = () => {
      loading = null;
      reject(new Error("Kakao SDK load failed"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** 공유 시트를 열 때 미리 불러 두면 [카카오톡으로 보내기]가 바로 뜬다. */
export function preloadKakao(): void {
  if (typeof window === "undefined") return;
  void loadKakao().catch(() => {});
}

/**
 * 카카오톡 친구 선택 화면을 연다. 실패하면 false — 호출한 쪽에서 복사 방식으로 대신한다.
 */
export async function shareToKakao(input: {
  title: string;
  description: string;
  /** 사이트 기준 경로(/images/...) 또는 전체 주소 */
  imagePath: string;
  linkUrl: string;
  buttonTitle: string;
}): Promise<boolean> {
  try {
    const kakao = await loadKakao();
    if (!kakao.isInitialized()) kakao.init(KAKAO_JS_KEY);
    const link = { mobileWebUrl: input.linkUrl, webUrl: input.linkUrl };
    // 위에 이미지(2:1)가 붙는 피드형 카드. 이미지는 지금 사이트에서 공개로 내려준다.
    kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: input.title,
        description: input.description,
        imageUrl: new URL(input.imagePath, window.location.origin).toString(),
        imageWidth: 800,
        imageHeight: 400,
        link,
      },
      buttons: [{ title: input.buttonTitle, link }],
    });
    return true;
  } catch {
    return false;
  }
}
