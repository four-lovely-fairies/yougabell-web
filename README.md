# yougabell-web

> 육아밸 — user-facing web. Expo WebView가 띄우는 메인 UI.
> Next.js 16 + Tailwind, Vercel 배포.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS
- TypeScript (strict)
- pnpm
- Node 24 LTS

## Quick start

```bash
nvm use
pnpm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_* and server-only keys
pnpm dev
```

## Role

- 온보딩, 홈, 미션, 마음 배터리, 챗봇, 주간 리포트 등 사용자 플로우 전반
- Supabase Auth로 로그인 (`@supabase/ssr`)
- API 호출은 `yougabell-api`로 (BFF는 가벼운 프록시 정도)
- Expo WebView에서 띄워지므로 **하단 시스템 영역(SafeArea) 고려 필요**
- WebView 안 Google 로그인은 native로 위임하고, mobile이 주입한 Supabase 세션을 수신해 복원
- WebView 안 Apple 로그인도 native 브리지로 위임하고, mobile이 주입한 Supabase 세션을 수신해 복원

## Hosting

Vercel — preview / production

## 관련 문서

- 워크스페이스 인덱스: [`../CLAUDE.md`](../CLAUDE.md) (로컬)
- 레포 전략 / 스키마 / 기능 기획: umbrella 레포 `yougabell`
  - [`yougabell/docs/design/00-repo-strategy.md`](https://github.com/four-lovely-fairies/yougabell/blob/main/docs/design/00-repo-strategy.md)
  - [`yougabell/docs/schema/`](https://github.com/four-lovely-fairies/yougabell/tree/main/docs/schema)
  - [`yougabell/docs/features/`](https://github.com/four-lovely-fairies/yougabell/tree/main/docs/features)
