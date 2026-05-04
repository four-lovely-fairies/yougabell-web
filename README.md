# working-mom-dad-web

> Working Mom Dad — user-facing web. Expo WebView가 띄우는 메인 UI.
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
- API 호출은 `working-mom-dad-api`로 (BFF는 가벼운 프록시 정도)
- Expo WebView에서 띄워지므로 **하단 시스템 영역(SafeArea) 고려 필요**

## Hosting

Vercel — preview / production

## 관련 문서

- 워크스페이스 인덱스: [`../CLAUDE.md`](../CLAUDE.md) (로컬)
- 레포 전략 / 스키마: anchor 레포 `working-mom-dad-api`
  - [`working-mom-dad-api/docs/design/00-repo-strategy.md`](https://github.com/youth-corp/working-mom-dad-api/blob/main/docs/design/00-repo-strategy.md)
  - [`working-mom-dad-api/docs/schema/`](https://github.com/youth-corp/working-mom-dad-api/tree/main/docs/schema)
