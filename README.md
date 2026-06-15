# yougabell-web

육아밸에서 사용자가 실제로 보는 화면 전부. 온보딩, 홈 대시보드, 미션, 마음 배터리, 챗봇, 주간 리포트가 여기 있다. 흥미로운 점은 이게 단독 웹사이트가 아니라는 것이다 — Expo 앱이 WebView로 띄우는 메인 UI다. 그래서 브라우저에서도 돌지만, 진짜 타깃은 네이티브 셸 안이다.

Next.js 16 App Router로 짜고 Vercel에 올린다.

## WebView 안에서 산다는 것

이 레포의 거의 모든 설계 결정이 "WebView 안에서 돈다"는 전제에서 나온다.

세션이 대표적이다. WebView 안에서는 OAuth 팝업이 제대로 안 뜨기 때문에, web이 직접 Google/Apple 로그인을 시작하지 않는다. 대신 `lib/native-bridge.ts`를 통해 네이티브에 "로그인 좀 해줘"라고 메시지를 보내고, 네이티브가 OS 차원에서 OAuth를 처리한 뒤 Supabase 세션 토큰을 도로 주입해준다. web은 그 세션을 받아 복원만 한다. 브리지 프로토콜은 양쪽 다 타입이 붙은 discriminated union이라(`REQUEST_NATIVE_GOOGLE_SIGN_IN`, `SUPABASE_SESSION_SYNC` 등) 어느 쪽이 무슨 메시지를 보내는지 컴파일 타임에 강제된다.

화면 디테일도 마찬가지다. 노치·다이내믹 아일랜드를 피하려고 `safe-area-inset`을 전역 레이아웃에 발라두고, 네이티브 당겨서 새로고침을 막은 뒤 직접 만든 훅(`use-pull-to-refresh`)으로 대체한다. iOS에서 입력창 포커스 시 화면이 확대되는 걸 막으려고 폰트 크기를 16px로 고정한 것 같은, WebView 아니면 신경 안 쓸 자잘한 것들이 꽤 있다.

## API와 대화하는 법 — OpenAPI 코드젠

도메인 로직은 전부 `yougabell-api`에 있고, web은 그걸 호출만 한다. 여기서 타입 안전성을 공짜로 얻는 방법을 쓴다.

API가 export한 OpenAPI 스펙(`openapi/yougabell-api.json`)을 `openapi-typescript`로 돌려 타입을 생성하고, 실제 호출은 `openapi-fetch`로 한다.

```bash
pnpm codegen:api   # openapi-typescript → lib/generated/api-types.ts
```

`openapi-fetch`의 장점은 런타임 오버헤드가 사실상 없다는 거다. 무거운 클라이언트 객체를 만드는 게 아니라 `fetch`에 타입만 입힌 얇은 래퍼라, 경로·쿼리·바디·응답이 전부 스펙에서 추론된다. API 계약이 바뀌면 `GET("/me/chat")` 같은 호출부에서 빨간 줄이 뜬다. 백엔드와 프론트가 따로 노는 흔한 사고를 빌드가 막아준다.

route handler(`app/api/`)는 진짜 가벼운 것만 한다 — 이미지 변환, 캐시 헤더 정도. DB를 직접 만지지 않는다(Prisma import 금지). 세션 리프레시는 `proxy.ts` 미들웨어가 매 요청마다 처리한다.

## 챗봇 UI

챗봇 응답은 API에서 SSE로 흘러온다. 표준 `EventSource`는 GET 전용이라 메시지 전송(POST)에는 못 쓰고, `fetch` + `ReadableStream`으로 토큰을 직접 파싱한다. 받은 토큰은 `use-chat-typewriter` 훅으로 한 글자씩 떨어뜨려 타이핑되는 느낌을 준다.

LLM이 마크다운으로 구조화한 답(표, 링크, 카드)은 `react-markdown` + `remark-gfm`으로 렌더링한다. 덕분에 챗봇이 그냥 텍스트 덩어리가 아니라 카드나 표 형태로 정리된 답을 줄 수 있다.

## Tailwind v4와 디자인 토큰

Tailwind v4로 넘어오면서 설정이 JS 파일에서 CSS로 옮겨갔다. `tailwind.config.js` 없이 `globals.css`의 `@theme` 블록에 토큰을 정의한다.

토큰은 세 겹이다. primitive 컬러(`primary-50`~`900`, `gray-*`) → role 토큰(`text-primary`, `border-secondary` 같은 CSS 변수) → Tailwind 유틸리티. 코드에서는 role을 통해 쓰기 때문에, 다크 모드나 테마를 바꿀 때 role 매핑만 갈아끼우면 된다. 이 토큰들의 실제 출처는 Figma이고, 매핑 규칙은 [`DESIGN.md`](./DESIGN.md)에 정리돼 있다.

폰트는 한글에 최적화된 Pretendard를 기본으로 쓰고, 홈 통계 숫자나 주차 헤딩처럼 숫자를 강조하는 곳만 SUIT Variable로 바꾼다.

## 라이브러리 메모

- **`next@16`** — App Router의 Server Components 덕에 콘텐츠성 페이지(홈, 설정, 리포트, 온보딩 단계)는 클라이언트 JS가 거의 안 나간다. 상태가 필요한 미션·챗·폼만 `"use client"`. WebView에서 LCP가 중요한 만큼 이게 체감된다.
- **`@supabase/ssr`** — 세션을 localStorage가 아니라 쿠키로 다룬다. 미들웨어에서 매 요청 토큰을 갱신해 stale 토큰 문제를 피한다.
- **`openapi-fetch` + `openapi-typescript`** — 위에 적은 대로, 런타임 비용 없이 API 타입 안전성.
- **`@next/third-parties`** — GA4를 Next 16 방식으로 로드. `NEXT_PUBLIC_GA_ID`는 production에만 넣어서, preview/dev에서는 자동으로 안 붙는다.
- **`class-variance-authority`** — 버튼·칩 같은 컴포넌트의 variant 분기. 클래스 병합은 `cn()`.
- **`lucide-react`** — 시스템 아이콘. 단, Figma에서 따로 받은 캐릭터·전용 아이콘은 SVG 컴포넌트로 직접 넣는다.

## 시작하기

```bash
nvm use
pnpm install
cp .env.example .env.local
# NEXT_PUBLIC_* 와 서버 전용 키 채우기
pnpm dev
```

로컬에서 mobile 앱과 붙여 테스트할 때는 web을 `:3001`로 띄우고, mobile WebView가 그쪽을 보도록 설정한다.

## 스택

Next.js 16(App Router) · React 19 · Tailwind CSS v4 · Supabase Auth(`@supabase/ssr`) · TypeScript(strict) · pnpm · Node 24 LTS. Vercel에 배포하며 `main`은 production, PR은 preview로 나간다. `NEXT_PUBLIC_*` 값은 빌드 타임에 인라인되므로, 바꾸면 재배포해야 반영된다.

## 관련 문서

- 디자인 시스템·토큰: [`DESIGN.md`](./DESIGN.md)
- 레포 전략 / 스키마 / 기능 기획: umbrella 레포 `yougabell`
  - [`yougabell/docs/design/00-repo-strategy.md`](https://github.com/four-lovely-fairies/yougabell/blob/main/docs/design/00-repo-strategy.md)
  - [`yougabell/docs/schema/`](https://github.com/four-lovely-fairies/yougabell/tree/main/docs/schema)
  - [`yougabell/docs/features/`](https://github.com/four-lovely-fairies/yougabell/tree/main/docs/features)
