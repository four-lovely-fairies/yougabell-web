# working-mom-dad-web

> 사용자용 웹. Expo WebView가 띄우는 메인 UI.
> 워크스페이스 전체 컨벤션은 umbrella 레포 [`working-mom-dad`](https://github.com/youth-corp/working-mom-dad/blob/main/AGENTS.md) 참조.
> 디자인 시스템·토큰은 [`DESIGN.md`](./DESIGN.md) 참조 (Figma MCP 연결 후 채워짐).

## 빌드 · 실행 · 검증 명령

```bash
pnpm install
pnpm dev          # next dev (http://localhost:3000 또는 :3001)
pnpm build        # next build
pnpm start        # next start (production)
pnpm lint         # eslint
```

## 스택

- Next.js 16 (App Router, Server Components 기본)
- Tailwind CSS + shadcn/ui (검토)
- TypeScript strict
- pnpm, Node 24 LTS
- Vercel 배포

## 핵심 원칙

- **WebView 환경 가정**: SafeArea / 키보드 / 스크롤 위임을 항상 고려.
- **API 호출**: `working-mom-dad-api` OpenAPI 코드젠 클라이언트 사용. Prisma 직접 import 금지.
- **인증**: `@supabase/ssr`로 쿠키 기반 세션. JWT는 API 호출 시 Bearer 헤더로.
- **BFF는 가볍게**: 도메인 로직은 API에. Next route handler는 프록시·이미지 변환·캐시 정도만.
- **컴포넌트 파일명**: kebab-case (`nav-bar.tsx`), 함수형 + `const`, Server Component 기본.

## 디렉토리 (예정, src 없는 형식)

```
.
├── app/
│   ├── (onboarding)/
│   ├── (main)/
│   ├── chat/
│   ├── report/
│   └── api/         # 가벼운 BFF 라우트만
├── components/
├── lib/             # supabase client, api client (codegen)
├── hooks/
└── styles/
```

> tsconfig paths: `@/*` → `./*` (src 제거 후 루트 기준)

## 환경 변수

`NEXT_PUBLIC_*`은 클라이언트 노출. service role key는 서버 전용.

## 배포

Vercel — `main` → production, PR → preview.
