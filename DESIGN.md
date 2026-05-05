# Design System — working-mom-dad-web

> 사용자용 웹의 디자인 시스템 컨텍스트. AI 코딩 에이전트가 UI 코드를 생성할 때 참고.
> **현재 placeholder** — Figma MCP 연결 후 토큰·컴포넌트·룰을 자동 또는 수동 동기화한다.

> Figma 파일: TBD (`Wireframe_26.04.29` — 노드 ID는 [`docs/schema/`](https://github.com/youth-corp/working-mom-dad-api/tree/main/docs/schema)에 인용됨)

---

## 1. 토큰 (TBD — Figma Variables에서 동기화)

### 색상 (Color)

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `bg.primary` | TBD | TBD | 본 배경 |
| `bg.surface` | TBD | TBD | 카드·시트 |
| `text.primary` | TBD | TBD | 본문 |
| `text.muted` | TBD | TBD | 보조 |
| `accent.primary` | TBD | TBD | CTA |
| `category.emotion` | `#f5d9ff` | TBD | 감정/정서 카드 (`851:5099`) |
| `category.education` | TBD | TBD | 교육 카드 |
| `category.sleep` | TBD | TBD | 수면 카드 |
| `category.food` | TBD | TBD | 음식 카드 |
| `category.health` | TBD | TBD | 건강 카드 |
| `category.play` | TBD | TBD | 놀이 카드 |

### 타이포그래피 (Type scale)

| 토큰 | 크기 | 행간 | 굵기 |
|---|---|---|---|
| `display` | TBD | TBD | TBD |
| `headline` | TBD | TBD | TBD |
| `title` | TBD | TBD | TBD |
| `body` | TBD | TBD | TBD |
| `caption` | TBD | TBD | TBD |

### 간격 / 반경 / 그림자 (Spacing / Radius / Elevation)

TBD — Figma Variables → CSS variables 매핑.

---

## 2. 컴포넌트 (Components)

> Figma 컴포넌트 ↔ 코드 컴포넌트 매핑. Code Connect로 자동 동기화 가능 (Figma MCP).

| Figma 컴포넌트 | 코드 컴포넌트 | 위치 |
|---|---|---|
| (TBD) | (TBD) | (TBD) |

---

## 3. 화면 (Screens)

`docs/schema/`의 도메인 구조와 1:1 매칭:

| 영역 | Figma 노드 | 코드 라우트 |
|---|---|---|
| 온보딩 01~03 | `851:6743`, `851:6805`, `851:6893` | `app/(onboarding)/` |
| 홈 | `851:3866` | `app/(main)/page.tsx` |
| 마음 배터리 | `851:5347` | `app/(main)/battery/` |
| 마음 케어 | `851:5569`, `851:6020` | `app/(main)/care/` |
| 미션 | `851:3340`, `851:3410`, `851:5197` | `app/(main)/mission/` |
| 미션 피드백 | `851:3647` | `app/(main)/feedback/` |
| 챗봇 | `851:6427` | `app/(main)/chat/` |
| 주간 리포트 | `851:6618` | `app/(main)/report/` |
| 발달 로드맵 | `851:5028` | `app/(main)/roadmap/` |

---

## 4. 작성 규칙 (Authoring rules)

### Do

- **Figma 토큰 → CSS 변수** 매핑 우선. 하드코딩 hex 금지
- **Tailwind utilities** + 커스텀 토큰. 복잡한 스타일은 `cva()` 패턴 (`lib/utils.ts`의 `cn()`)
- **kebab-case 파일명**: `nav-bar.tsx`, `mission-card.tsx`
- **Server Component 기본**, 인터랙션 필요 시 `"use client"` 명시
- **WebView 안전 영역**: `safe-area-inset-*`, 키보드 리사이즈 대응
- **다크 모드**: `dark:` prefix 또는 CSS 변수

### Don't

- 절대 위치 px 좌표 그대로 옮기지 말 것 (Auto Layout으로 변환)
- shadcn/ui 컴포넌트의 내부 구현을 직접 수정하지 말 것 (커스터마이징은 wrapper로)
- `globals.css`에 컴포넌트 스타일 추가 금지 (토큰·전역 reset만)
- Figma 노드 ID를 코드에 주석으로 박지 말 것 (디자인 변경 시 표류)

### 품질 게이트

UI 변경 후 다음을 확인:

1. `pnpm lint` 통과
2. `pnpm dev`로 브라우저에서 시각 확인 (특히 모바일 뷰포트 — 360x640)
3. 다크/라이트 양쪽 토큰 채워졌는지
4. SafeArea 마진 (Expo WebView 고려)

---

## 5. Figma MCP 연결 (TODO)

연결되면 다음 가능:
- `get_design_context(nodeId, fileKey)` — 노드별 디자인 컨텍스트 + Code Connect 매핑
- `get_screenshot(nodeId)` — 시각 참조
- `get_variable_defs()` — 토큰 동기화

연결 후 본 문서 갱신: 토큰 표를 Figma Variables 기준 자동 채우기, 컴포넌트 매핑 표 채우기.
