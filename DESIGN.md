# Design System — yougabell-web

> 사용자용 웹의 디자인 시스템. AI 코딩 에이전트가 UI 코드를 생성할 때 1차 참고.
> **단일 진실의 소스**: Figma 파일 [Yougabell OS Figma](https://www.figma.com/design/sKdG5GEBZPdMjFY9nYj5g0).
> admin·mobile 레포는 본 문서를 재사용하고, 자체 영역(운영자 컴포넌트, 네이티브 셸)만 각자의 `DESIGN.md`에서 다룬다.

---

## 0. Figma 출처

| 페이지       | Figma 노드  | 다루는 것                                     |
| ------------ | ----------- | --------------------------------------------- |
| ⓪ Foundation | `2046:3807` | Primitive/Semantic Color, Typography          |
| ⓪ Theme      | `2046:4539` | System Icons (24px 기준, 12/16/20/24/32/40)   |
| ① Element    | `2046:4278` | Radius, Spacing, Elevation, Grid              |
| ① Component  | `2046:4680` | Bottom Navigation, Text Field, Header, Button |

> AI 에이전트는 노드 직접 조회 시 `mcp__plugin_figma_figma__get_design_context(nodeId, fileKey="sKdG5GEBZPdMjFY9nYj5g0")` 사용.

---

## 1. 색상 토큰 (Color)

### 1.1 Primitive — Primary

브랜드 메인 (보라-블루 계열). **Figma Foundation(`2046:3807`) 실측값** — 한 화면 내 가장 중요한 버튼·강조 정보에 사용.

| 토큰          | HEX       | 용도                     |
| ------------- | --------- | ------------------------ |
| `primary.50`  | `#EFE7FF` | 배경 틴트                |
| `primary.100` | `#D4C4FE` | disabled 채움            |
| `primary.200` | `#B69CFE` | 활성 탭 보더             |
| `primary.300` | `#9572FF` | **기본 액션** (버튼·CTA) |
| `primary.400` | `#7850FF` |                          |
| `primary.500` | `#5A31F4` |                          |
| `primary.600` | `#4C2CED` |                          |
| `primary.700` | `#3425E4` |                          |
| `primary.800` | `#111FDC` |                          |
| `primary.900` | `#0013CD` |                          |

> ⚠️ 2026-05 갱신: 이전 팔레트(`500 #754AF6` 등)는 출처 불명으로 폐기. **기본 액션색은 `primary.300 #9572FF`** (Figma 버튼 컴포넌트 실측). role `--primary` → `primary.300`.

### 1.2 Primitive — Grayscale

| 토큰       | HEX       | 용도                              |
| ---------- | --------- | --------------------------------- |
| `gray.0`   | `#FFFFFF` | 화면 배경                         |
| `gray.20`  | `#FDFDFE` | surface                           |
| `gray.50`  | `#F6F6F6` | surface alt                       |
| `gray.100` | `#E9E9E9` | divider weak                      |
| `gray.200` | `#D9D9D9` | border                            |
| `gray.300` | `#C4C4C4` | disabled fg                       |
| `gray.400` | `#9D9D9D` |                                   |
| `gray.500` | `#7B7B7B` | text tertiary                     |
| `gray.600` | `#555555` | text secondary                    |
| `gray.700` | `#434343` | icon secondary                    |
| `gray.800` | `#262626` | text primary                      |
| `gray.900` | `#000000` | (가급적 미사용 — `gray.800` 권장) |

### 1.3 Semantic

| 그룹        | 토큰                                  | HEX                                           | 용도                                                                                          |
| ----------- | ------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Error       | `error.500` / `.50` / `.100` / `.600` | `#FF5050` / `#FFF1F2` / `#FB9CA7` / `#EC003F` | 위험·오류 (기본 `error.500 #FF5050` — Figma 컴포넌트 실측. 50/100/600은 legacy 배경·텍스트용) |
| Information | `info.50` / `.500` / `.700` / `.800`  | `#E2F4FF` / `#009CFF` / `#0565FF` / `#263FE0` | 정보·링크                                                                                     |
| Warning     | `warning.50` / `.600` / `.800`        | `#FDF3E9` / `#FBDA2B` / `#F9AB16`             | 경고                                                                                          |
| Success     | `success.50` / `.200` / `.500`        | `#E5F6ED` / `#98D8B5` / `#06B26C`             | 완료·긍정                                                                                     |

### 1.4 Role 토큰 (실제 사용)

코드에서는 primitive를 직접 쓰지 말고 role 토큰을 통해 사용. 다크모드·테마 변경 시 role만 갱신하면 됨.

| Role               | 라이트                    | 용도                    |
| ------------------ | ------------------------- | ----------------------- |
| `text.primary`     | `#262626` (`gray.800`)    | 본문                    |
| `text.secondary`   | `#555555` (`gray.600`)    | 보조                    |
| `text.tertiary`    | `#7B7B7B` (`gray.500`)    | placeholder             |
| `text.disabled`    | `#C4C4C4` (`gray.300`)    | disabled                |
| `border.primary`   | `#D9D9D9` (`gray.200`)    | 일반 보더               |
| `border.secondary` | `#E9E9E9` (`gray.100`)    | 약한 디바이더           |
| `border.tertiary`  | `#F6F6F6` (`gray.50`)     | 거의 안 보이는 디바이더 |
| `border.error`     | `#FF5050` (`error.500`)   | 에러 보더 (Figma 실측)  |
| `primary` (action) | `#9572FF` (`primary.300`) | 기본 버튼·CTA·강조      |
| `icon.primary`     | `#262626`                 | 강조 아이콘             |
| `icon.secondary`   | `#434343`                 | 일반                    |
| `icon.tertiary`    | `#555555`                 | 보조                    |
| `icon.disabled`    | `#9D9D9D`                 | disabled                |

### 사용 규칙

- **하드코딩 hex 금지** — Tailwind theme/CSS 변수 통해 사용
- `#000000` 직접 사용 금지 → `gray.800` 사용
- 새 컬러가 필요하면 토큰화 의논 먼저. index/커버 등 단기 페이지에 한해 직접 hex 허용
- opacity 변형은 가급적 피함 (성능 — 합성 추가 비용)

---

## 2. 타이포그래피 (Typography)

기본 폰트 패밀리: **Pretendard** (한글 + 영문). UI 일부에 **Wanted Sans Variable** 병용 가능.

> **숫자·월 헤딩 강조는 `SUIT Variable`** (Figma 실측 — 홈 통계 숫자/주차 헤딩 등). self-host: `public/fonts/suit/SUIT-Variable.woff2`, `globals.css` `@font-face` + `--font-suit` 토큰(`font-suit` 유틸). 본문·일반 텍스트는 Pretendard 유지.

| 스타일        | 폰트       | 굵기          | 크기 | 행간 | letter-spacing |
| ------------- | ---------- | ------------- | ---- | ---- | -------------- |
| `headline.h1` | Pretendard | Bold (700)    | 24   | 34   | -0.4           |
| `headline.h2` | Pretendard | Bold (700)    | 20   | 30   | -0.4           |
| `headline.h3` | Pretendard | Bold (700)    | 18   | 30   | -0.4           |
| `subtitle.1`  | Pretendard | Bold (700)    | 16   | 24   | -0.2           |
| `subtitle.2`  | Pretendard | Bold (700)    | 14   | 22   | -0.2           |
| `subtitle.3`  | Pretendard | Medium (500)  | 16   | 24   | -0.2           |
| `subtitle.4`  | Pretendard | Medium (500)  | 14   | 22   | -0.2           |
| `body.1`      | Pretendard | Regular (400) | 16   | 26   | -0.4           |
| `body.2`      | Pretendard | Regular (400) | 15   | 25   | -0.4           |
| `body.3`      | Pretendard | Regular (400) | 14   | 24   | -0.4           |
| `caption.1`   | Pretendard | Regular (400) | 12   | 20   | -0.2           |
| `caption.2`   | Pretendard | Regular (400) | 10   | 18   | -0.2           |

---

## 3. 형태 — Radius

> 4px 배수 기반 6단계. 컴포넌트 위계에 따라 곡률 적용.

| 토큰          | 값      | 용도                    |
| ------------- | ------- | ----------------------- |
| `radius.xs`   | `4px`   | 작은 칩, 인풋 내부 요소 |
| `radius.s`    | `8px`   | Input, 작은 버튼        |
| `radius.m`    | `12px`  | 카드                    |
| `radius.l`    | `16px`  | 큰 카드, 모달           |
| `radius.xl`   | `20px`  | 시트, 큰 컨테이너       |
| `radius.full` | `999px` | Pill 버튼, 아바타       |

---

## 4. 레이아웃 — Spacing

> 4px 그리드 기반 (일부 2px). 일관된 여백 규칙으로 시각적 질서 유지.

| 토큰       | 값     |
| ---------- | ------ |
| `space.1`  | `2px`  |
| `space.2`  | `4px`  |
| `space.3`  | `8px`  |
| `space.4`  | `12px` |
| `space.5`  | `16px` |
| `space.6`  | `20px` |
| `space.7`  | `24px` |
| `space.8`  | `32px` |
| `space.9`  | `40px` |
| `space.10` | `48px` |

### 카드 패딩 가이드

- 일반 카드: `padding: space.7 (24px)` 또는 `space.8 (32px)`
- 큰 카드: `padding: space.9 (40px)`

### 화면 레이아웃 — 헤더·하단 버튼 고정 (필수 규칙)

> **이 앱의 모든 화면에서 헤더는 항상 상단에, 하단 버튼(CTA·입력 바)은 항상 하단에 고정된다. 스크롤되는 것은 가운데 콘텐츠뿐이다.**
> 콘텐츠 길이와 무관하게 헤더·하단 버튼은 절대 스크롤로 움직이지 않는다. 짧은 콘텐츠에서 버튼이 중앙에 뜨거나, 긴 콘텐츠에서 헤더·버튼이 스크롤로 사라지면 **위반**이다.

#### 표준 패턴 (뷰포트 고정 Flex 컬럼 + 스크롤 영역 + 고정 헤더/푸터)

```tsx
// 뷰포트 높이에 고정된 flex 컬럼
<div className="flex h-dvh flex-col …">
  {/* 헤더 = 항상 상단 고정 (흐름 안이면 shrink-0, 또는 position:fixed 헤더) */}
  <header className="shrink-0 …">…</header>

  {/* 콘텐츠 = 유일한 스크롤 영역. 길면 여기서만 스크롤 */}
  <div className="min-h-0 flex-1 overflow-y-auto …">…</div>

  {/* 하단 CTA = 항상 뷰포트 하단 고정 */}
  <div className="shrink-0 pb-[max(20px,env(safe-area-inset-bottom))] …">
    <button>…</button>
  </div>
</div>
```

- **루트**: `flex h-dvh flex-col` — 뷰포트 높이에 고정(`h-dvh`)해야 헤더·푸터가 항상 붙는다. `min-h-dvh`/`min-h-screen`은 콘텐츠가 길어지면 컨테이너가 늘어나 헤더·버튼이 함께 스크롤되므로 **금지**(아래 안티패턴).
- **헤더**: `shrink-0`(흐름 안) 또는 CSS `position: fixed`/`sticky top-0`. 이 앱의 공유 헤더 `MissionHeader`·`OnboardingHeader`·`AppHeader fixed`는 이미 `position: fixed` → 그대로 통과.
- **콘텐츠**: `min-h-0 flex-1 overflow-y-auto` — 남는 공간을 채우고, 넘칠 때 **콘텐츠만** 스크롤. 중첩 flex에서 스크롤이 동작하려면 조상 flex 아이템에 `min-h-0` 필요.
- **푸터**: `shrink-0` + `pb-[max(20px,env(safe-area-inset-bottom))]` — 절대 줄어들지 않고, WebView 홈 인디케이터 침범 방지(Expo WebView 타깃 필수).
- **공유 레이아웃이 padding을 소유하면**(예: `app/onboarding/layout.tsx`의 `px-5` + 안전영역 `pb`) 레이아웃 루트를 `flex h-dvh flex-col`로 두고, 각 화면 루트는 `flex min-h-0 flex-1 flex-col`로 채운다. 레이아웃이 padding을 안 주면(예: `app/settings/layout.tsx`) 화면 루트가 직접 `flex h-dvh flex-col px-5 pb-[safe]`를 갖는다.

#### 금지 (Anti-pattern)

- ❌ **`min-h-*` + `flex-1` 필러 푸터**: `min-h-dvh` 루트에 `<div className="min-h-8 flex-1" />` 스페이서로 버튼을 밀어내는 방식. 짧은 콘텐츠에선 붙지만, 콘텐츠가 뷰포트를 넘으면 페이지 전체가 스크롤되어 헤더·버튼이 사라진다. → 루트를 `h-dvh`로, 콘텐츠를 `flex-1 overflow-y-auto`로.
- ❌ **매직 넘버 스페이서**: `min-h-[calc(100dvh-104px-115px)]` 처럼 헤더·푸터 높이를 하드코딩해 버튼을 밀어내는 방식. 헤더 높이·안전영역·콘텐츠가 바뀌면 즉시 깨진다.
- ❌ **매직 최소높이**: `min-h-180`(=720px) 같은 고정 min-height로 상태 화면을 채우는 방식. 짧은 뷰포트에서 CTA가 화면 밖으로 밀린다. → `flex-1`로.
- ❌ **자연 높이 의존**: 콘텐츠 자연 높이에만 기대어 버튼을 배치(스크롤 영역 없음). 짧으면 중앙에 뜨고, 길면 스크롤로 사라진다.

> **예외**: 중앙 정렬 상태 화면(로딩·완료·빈 상태 등 — 버튼이 콘텐츠와 함께 중앙에 놓이는 화면. 예: `app/onboarding/(protected)/done`, `mission-screens/done` 계열 안내)은 하단 고정 대상이 아니다. "콘텐츠 하단에 붙는 CTA"가 있는 화면에만 본 규칙을 적용한다.

#### 참고 구현

- 표준(자체 `h-dvh`): `app/chat/page.tsx`, `components/mission/mission-screens/{intro,done,effect,timer,feedback}.tsx`, `app/settings/**`(CTA 페이지)
- 레이아웃 `h-dvh` 상속: `app/onboarding/**`(루트 `flex min-h-0 flex-1 flex-col` + 스크롤 영역 + `shrink-0` 푸터)

---

## 5. Elevation (그림자)

기본 모드 4단계. X·Y 오프셋, blur, alpha 조합.

| 토큰       | offset           | blur     | color             |
| ---------- | ---------------- | -------- | ----------------- |
| `shadow.1` | `0 1px` + `0 0`  | `2 / 2`  | `#0000000D` (5%)  |
| `shadow.2` | `0 4px` + `0 0`  | `8 / 2`  | `#00000014` (8%)  |
| `shadow.3` | `0 8px` + `0 0`  | `16 / 2` | `#0000001F` (12%) |
| `shadow.4` | `0 16px` + `0 0` | `24 / 2` | `#0000001F` (12%) |

> 기본 모드에서 효과적. 선명한 모드에서는 약화되므로 `surface` 밝기와 함께 사용.

---

## 6. Grid — 모바일 (375 width 기준)

- **컬럼**: 2-column
- **거터**: 20px (`space.6`)
- **마진**: 좌우 20px (`space.6`)
- **컬럼 너비**: 157.5px × 2

```
┌─[20]─┬─[157.5]─┬─[20]─┬─[157.5]─┬─[20]─┐
│ M    │ Col 1   │ Gut  │ Col 2   │ M    │
└──────┴─────────┴──────┴─────────┴──────┘
```

---

## 7. 아이콘 시스템

- **기준 사이즈**: 24px
- **사용 사이즈**: 12 / 16 / 20 / 24 / 32 / 40
- **세트**: ~95개 시스템 아이콘 (`icon/*` Figma 컴포넌트, 노드 `2046:4567` 영역)

주요 아이콘 (코드에서 자주 쓰임):

`accessibility`, `arrow-down/left/right/top`, `bookmarks`, `btn-more`, `calendar`, `call`, `check_circle`, `close`, `delete`, `download`, `edit`, `expand_less/more`, `face_smile` / `face_sad`, `filter`, `heart`, `home`, `inquiry`, `mail`, `map`, `menu`, `myinfo`, `search`, `setting`, `share`, `system-danger/info/success/warning`, `time`, `visibility` / `visibility_off`

> 아이콘 라이브러리 선택은 미정. Figma 아이콘 SVG export → `lucide-react` 호환 컴포넌트화 또는 자체 `<Icon name="..." size={24} />` 채택 검토.

---

## 8. 핵심 컴포넌트

> Figma 컴포넌트 ↔ 코드 컴포넌트 매핑. Code Connect 도입 시 자동 동기화.

| Figma 컴포넌트    | Figma 노드  | 코드 위치 (예정)                | 비고                        |
| ----------------- | ----------- | ------------------------------- | --------------------------- |
| Bottom Navigation | `2046:4681` | `components/nav/bottom-nav.tsx` | 모바일 탭 바                |
| Text Field        | `2046:4897` | `components/ui/text-field.tsx`  | 인풋 (focus/error/disabled) |
| Header            | `2046:4902` | `components/nav/header.tsx`     | 페이지 상단 헤더            |
| Button            | `2046:4907` | `components/ui/button.tsx`      | CVA로 variant 분기          |

### Button variant 가이드 (예상)

- `primary`: 배경 `primary.500`, 텍스트 `gray.0`
- `secondary`: 배경 `gray.50`, 텍스트 `gray.800`, 보더 `gray.200`
- `ghost`: 투명 배경, 텍스트 `primary.500`
- `danger`: 배경 `error.600`
- 사이즈: sm(36) / md(44) / lg(52) — height 기준
- radius: `radius.s` 또는 `radius.full` (Pill)

> 정확한 variant 명·치수는 첫 컴포넌트 구현 시 Figma 노드 하위 frame을 추가 조회해서 확정 (`2046:4911` 영역).

---

## 9. 작성 규칙 (Authoring rules)

### Do

- **토큰 → CSS 변수 → Tailwind theme** 매핑. 직접 hex 금지
- **Tailwind utilities** + 복잡 스타일은 CVA. 클래스 병합은 `cn()` (`lib/utils.ts`)
- **Server Component 기본**, 인터랙션·상태 필요 시에만 `"use client"`
- **kebab-case 파일명**: `bottom-nav.tsx`, `text-field.tsx`
- **WebView 안전 영역**: `safe-area-inset-*`, 키보드 리사이즈 대응 (Expo WebView 타깃)
- **다크 모드**: `dark:` prefix 또는 CSS 변수 (role 토큰만 갱신)

### Don't

- Figma 절대 좌표 그대로 옮기지 말 것 → flex/grid Auto Layout으로 변환
- shadcn/ui 내부 구현 직접 수정 금지 (커스터마이징은 wrapper)
- `globals.css`에 컴포넌트 스타일 금지 (토큰·전역 reset만)
- Figma 노드 ID를 컴포넌트 코드 주석으로 박지 말 것 — 디자인 변경 시 표류. 본 DESIGN.md에서만 추적
- `#000000` 직접 사용 금지

### 품질 게이트

UI 변경 후:

1. `pnpm lint` 통과
2. `pnpm dev`로 모바일 뷰포트(375px) 시각 확인
3. 라이트/다크 양쪽 role 토큰 채워졌는지
4. SafeArea 마진 (Expo WebView 고려)

---

## 10. Figma MCP 워크플로

새 컴포넌트·화면 구현 시:

```
1. mcp__plugin_figma_figma__get_design_context(
     nodeId="...",
     fileKey="sKdG5GEBZPdMjFY9nYj5g0"
   )
   → 코드 + 스크린샷 + Code Connect 매핑

2. mcp__plugin_figma_figma__get_variable_defs(nodeId)
   → 사용된 토큰만 추출 (이 문서의 토큰과 매칭)

3. 결과를 본 DESIGN.md의 토큰·컴포넌트 표와 비교 후 코드 작성
```

토큰 변경이 감지되면 본 문서를 먼저 갱신 후 코드에 반영.
