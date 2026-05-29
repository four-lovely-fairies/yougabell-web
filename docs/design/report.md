# 리포트(주간 리포트) 디자인 갭 — Figma ↔ 현재 구현

> Figma: node `2385:4957` "리포트" (fileKey `sKdG5GEBZPdMjFY9nYj5g0`)
> 메인 프레임: `2183:3502` "리포트-Default" (390×1509)
> 현재 코드: `app/(main)/weekly-report/page.tsx`, `components/weekly-report/weekly-report-screen.tsx`
> 데이터 타입: `lib/weekly-report-data.ts` (OpenAPI codegen DTO), 데모 데이터 `getDemoWeeklyReportCurrent()`
> Figma MCP 정상 동작 확인 (whoami: 사요정 team / pro). 본 문서는 get_metadata + get_design_context + get_variable_defs + get_screenshot 결과 기반.

리포트 섹션은 Figma에 **5개 변형(variant)** 으로 존재한다.

| Figma node  | 변형 이름                                | 현재 코드 대응                                  |
| ----------- | ---------------------------------------- | ----------------------------------------------- |
| `2183:3502` | 리포트-Default                           | `WeeklyReportDetailView`                        |
| `2183:6606` | 미션 피드백에서 키워드 등록을 안 했을 때 | `KeywordSection`의 `keywordEmptyState` 분기     |
| `2183:6775` | 베스트 모먼트가 2개 이상일때             | `BestMomentSection`의 `moments.length > 1` 분기 |
| `2183:3895` | 미션 최초 수행 전 (empty state)          | `WeeklyReportEmpty`                             |
| `2183:6979` | 미션 최초 수행 전 (variant 2)            | `WeeklyReportEmpty` (동일 분기)                 |

---

## 1. Figma 디자인 요약 (섹션별 레이아웃 + 토큰)

### 공통 컨테이너 토큰 (모든 리포트 카드)

- 배경: `background/background-primary` = `#FFFFFF`
- 화면 배경: `background/background-secondary` = `#FDFDFE`
- 카드 radius: `radius-system/xl` = **20px** (모든 카드 동일)
- 카드 padding: **24px** (`space-system/7`)
- 카드 내부 세로 gap: **15px**
- 그림자 `shadow1`: `0 1px 1px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.05)` (drop-shadow, blur 1px)
- 콘텐츠 좌우 마진: 20px (`space-system/6`), 섹션 간 세로 간격 ≈ 32px
- 텍스트: `text-primary #262626` / `text-secondary #555555` / `text-tertiary #7B7B7B` / `text-placeholder #9D9D9D` / `text-brand #9572FF`
- 폰트: Pretendard (75% 수치만 Manrope Bold), 본문 line-height 1.4

### 1.1 Sub LNB 헤더 (`2183:3515`)

- 높이 56px (StatusBar 47px 별도, 합 103px)
- 좌: `arrow_back` 24px (44×44 터치영역), 중앙: "주간 리포트" Callout/Bold 16/600 lineHeight 21, 우: `Communication / Bell` 24px

### 1.2 "나는 잘하고 있는가?" 카드 (`2183:3522` / 카드 `2183:3524`)

- 섹션 제목 "나는 잘하고 있는가?" — Title/Small-b = Pretendard Bold **18**/lineHeight 1.4
- 카드 제목 "지금 충분히 잘하고 계십니다." — Body/large-b = Pretendard Bold **16**, color `#262626`
- 카드 본문 — Body/Medium-r = Pretendard Regular **14**, color `#7B7B7B`, leading 1.4

### 1.3 "이번주 요약" (`2183:3530`)

- 미션 현황 카드(`2183:3533`): 라벨 "이번주 미션 현황" 16px, 요일 7개
  - 완료 동그라미: 32px ellipse, fill `#9572FF` 계열, `check-rounded` 24px 흰색
  - 미완료: 빈 32px 원형 (보더)
  - 요일 라벨: 12px `#7B7B7B`
- 통계 2분할 카드(`2183:3567`): 좌 171px / 우 171px, gap 8px
  - 좌 "누적 미션 수행시간": 숫자 32px Bold + 단위(시간/분) 20px
  - 우 "아이 반응 긍정률": 불꽃 vector 아이콘 + 숫자 32px + "%"

### 1.4 "아이의 관심 키워드 Top 3" (`2183:3582`)

칩 3개 (`2183:3584`), 정확한 스타일(get_design_context 확인):

- 칩: `padding pl-12 pr-14 py-8`, `gap 8`, radius **12px**(`radius-system/m`), 아이콘 14px
- 칩 배경: **15% 알파** — `rgba(255,166,33,0.15)` / `rgba(147,73,244,0.15)` / `rgba(73,122,244,0.15)`
- 칩 텍스트: SemiBold 14, color `#FFA621` / `#9349F4` / `#497AF4`
- 칩 inset 그림자: `inset 0 0 10px rgba(<색>,0.1)`
- 칩 아이콘: **커스텀 SVG** — `blank-calendar`(공룡), `slide-deck`(우주), `waning-crescent-moon`(아이스크림)

키워드 미등록 변형(`2183:6606`): 카드에 안내문 "피드백에서 아이가 가장 많이 말한 단어들을 입력하면 관심 키워드를 확인할 수 있어요"

### 1.5 "아이의 '베스트 모먼트'" (`2183:3603`)

- 라벨 "순수한 기쁨" 12px `#555`, 제목 16px Bold, 본문 14px `#7B7B7B`
- 2개 이상 변형(`2183:6775`): 카드 + 페이지네이션 dot (활성 가로 막대 + 점들)

### 1.6 "사용자의 내면 상태" (`2183:3613` / 카드 `2183:3615`)

- "심리적 에너지" Label/Label-m 12 Medium `#555`, 우측 "75%" **Manrope** Bold 16 `#262626`
- 게이지 Bar(`2183:3622`): 높이 20px, 트랙 radius **100px**
  - fill: `#9572FF`, radius 4px, 보더 `rgba(0,0,0,0.03)`
  - track: `rgba(0,0,0,0.03)` 보더 `rgba(0,0,0,0.02)`
- 팁 "기분 전환을 위한 팁" 14px Medium `#7B7B7B`, leading 1.6

### 1.7 "미래 행동 제안 (AI 기반)" 카드 (`2183:3626`)

- 섹션 제목 없는 **독립 카드** (헤더 X)
- 아이콘 `assistant_navigation` **18px** (커스텀 SVG) + 제목 16px Bold, gap 4px
- 본문 14px `#7B7B7B` leading 1.4

### 1.8 Empty state — "미션 최초 수행 전" (`2183:3895`)

- 화면 배경에 **장식용 보라 그라데이션 ellipse**(563×253, `Ellipse 87`)
- 중앙 **마스코트 캐릭터 일러스트** 120×120 (image 599) — 단순 회색 원이 아님
- 제목 "아직 주간 리포트가 없습니다" 18px Bold
- 본문 "미션을 수행하고 아이와의 소중한 순간을 기록해보세요. 일주일 후 첫 리포트를 확인할 수 있습니다." 14px `#7B7B7B`
- CTA "미션 시작하기": 263×48, bg `button/button-primary #9572FF`, radius **16px**, padding 20/12, 텍스트 Pretendard Medium 16 흰색

---

## 2. 현재 구현 요약

- `WeeklyReportScreen`(`"use client"`): `loadWeeklyReport()`로 로드 → 로딩/에러/empty/상세 분기. URL `?reportId` 지원.
- 헤더: 높이 103px(47+56), `ArrowLeft`/`Bell` lucide 아이콘, 제목 16px semibold.
- 상세 `WeeklyReportDetailView`: `px-5 pt-5 gap-8`(섹션 간 32px)로 6개 섹션 렌더.
- `ReportCard`: `rounded-xl`(**12px**), `p-6`(24px), shadow `0 1px 2px / 0 0 2px rgba(0,0,0,0.05)`.
- `ReportSection` 제목: `text-lg`(**18px**) bold leading-[25px].
- 미션 현황: 요일 원 32px, 완료 `bg-[#9572ff]` + lucide `Check` 18px / 미완료 `border-[#d9d9d9]`.
- `StatCard`: 2-col, 흰 카드 radius 12px, duration는 `splitDurationLabel`로 숫자/단위 분리, percent는 lucide `Sparkles`(fill `#9572ff`).
- 키워드: `keywordStyles` 배열로 **lucide** `CalendarDays`/`MessageSquare`/`Moon`, **불투명 배경** `#fff0d6`/`#efe4ff`/`#e5ecff`, 텍스트 `#f9a116`/`#9349f4`/`#497af4`, 칩 `h-9 px-3.5 rounded-xl`(12px). 미등록 시 흰 카드 안내문.
- 베스트 모먼트: 첫 모먼트만 카드, 2개 이상이면 dot(활성 `w-6 bg-black`).
- 내면 상태: progressbar a11y, 트랙 `rounded-full bg-[rgba(0,0,0,0.03)]` h-5, fill `bg-[#9572ff] rounded-xs`.
- AI 제안: 독립 `ReportCard` + lucide `Bot` 18px + 제목 16px bold.
- Empty(`WeeklyReportEmpty`): **단순 회색 원** `size-[120px] bg-[#f2f2f2]`, 제목/본문 + CTA `h-12 w-[263px] rounded-2xl(16px) bg-[#9572ff]`.

---

## 3. 갭 표

| 요소                         | Figma                                                           | 현재                                                         | 차이 / 액션                                                             |
| ---------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **카드 radius**              | **20px** (`radius-system/xl`) — 전 카드 공통                    | `rounded-xl` = **12px**                                      | **P1** `ReportCard`/`StatCard` radius 12→20 (`rounded-[20px]`)          |
| **카드 그림자**              | `0 1px 1px / 0 0 1px rgba(0,0,0,0.05)` (blur 1px)               | `0 1px 2px / 0 0 2px rgba(0,0,0,0.05)` (blur 2px)            | **P2** blur 2px→1px로 맞춤                                              |
| **키워드 칩 배경**           | 색상 **15% 알파** `rgba(255,166,33,0.15)` 등                    | 불투명 틴트 `#fff0d6` 등                                     | **P1** rgba 알파 배경으로 교체 (시각 톤 다름)                           |
| **키워드 칩 아이콘**         | 커스텀 SVG `blank-calendar`/`slide-deck`/`waning-crescent-moon` | lucide `CalendarDays`/`MessageSquare`/`Moon`                 | **P1** 의미 불일치(달력/슬라이드/달 ≠ 일정/메시지/달) → SVG export 검토 |
| **키워드 칩 치수/radius**    | `pl-12 pr-14 py-8` gap 8, radius **12px**, 아이콘 14px          | `h-9 px-3.5 gap-2 rounded-xl`(12px), 아이콘 14px(`size-3.5`) | **P2** 좌우 padding 비대칭(12/14)·py 8 반영                             |
| **키워드 칩 inset 그림자**   | `inset 0 0 10px rgba(<색>,0.1)`                                 | 동일하게 적용됨 ✓                                            | 일치                                                                    |
| **75% 수치 폰트**            | Manrope Bold 16                                                 | Pretendard bold(leading-6)                                   | **P3** Manrope 미적용 (폰트 로드 시 반영)                               |
| **내면 상태 게이지 트랙**    | radius **100px**, h 20px                                        | `rounded-full` h-5(20px) ✓                                   | 거의 일치 (트랙 보더 미세 차 P3)                                        |
| **게이지 fill**              | `#9572FF` radius 4px + 보더 `rgba(0,0,0,0.03)`                  | `bg-[#9572ff] rounded-xs`(2px)                               | **P3** fill radius 2→4, 미세 보더 추가                                  |
| **"심리적 에너지" 라벨**     | `#555` 12px Medium                                              | `#555` 12px medium ✓                                         | 일치                                                                    |
| **AI 제안 아이콘**           | 커스텀 `assistant_navigation` 18px                              | lucide `Bot` 18px                                            | **P2** 아이콘 모양 불일치 → SVG export 검토                             |
| **AI 제안 본문 leading**     | 1.4                                                             | `leading-5`(20px on 14≈1.43)                                 | 거의 일치 ✓                                                             |
| **Empty 일러스트**           | 보라 그라데이션 ellipse + **마스코트 캐릭터** 120×120           | **단순 회색 원** `bg-[#f2f2f2]` 120px                        | **P1** 핵심 시각 누락 — 배경 ellipse + 캐릭터 이미지 추가 필요          |
| **Empty CTA radius**         | 16px                                                            | `rounded-2xl`(16px) ✓                                        | 일치                                                                    |
| **Empty CTA 텍스트 굵기**    | Medium 16                                                       | `font-medium` 16 ✓                                           | 일치                                                                    |
| **에러 화면**                | Figma에 해당 변형 없음                                          | `WeeklyReportError`(붉은 원 placeholder) 자체 구현           | 디자인 부재 — Figma에 추가 요청 또는 현행 유지(임시)                    |
| **헤더 제목 폰트**           | Callout/Bold 16/600 lineHeight 21                               | 16px semibold leading-[22px]                                 | 거의 일치 ✓                                                             |
| **섹션 제목 크기**           | 18px Bold(Title/Small-b)                                        | `text-lg`(18px) bold ✓                                       | 일치                                                                    |
| **베스트 모먼트 dot 활성색** | (확인) 가로 막대 활성                                           | `w-6 bg-black`                                               | **P3** 활성 dot 색이 검정 — 브랜드색(`#9572FF`) 여부 Figma 재확인       |

> 데이터/문구는 데모 데이터(`getDemoWeeklyReportCurrent`)와 Figma 텍스트가 일치(헤드라인·키워드·베스트모먼트·팁·AI제안 동일). 단, 베스트 모먼트 제목 Figma "10분 눈마추지면서 웃기"(오타)는 무시, 코드 "10분 눈마주치면서 웃기"가 맞음.

---

## 4. 액션 아이템

### P1 (시각적으로 명확히 다름 — 우선)

1. **카드 radius 12px → 20px**: `ReportCard`·`StatCard`의 `rounded-xl` → `rounded-[20px]`. 전 카드 영향.
2. **키워드 칩 배경을 15% 알파로**: `bg-[#fff0d6]` 등 → `bg-[rgba(255,166,33,0.15)]` / `rgba(147,73,244,0.15)` / `rgba(73,122,244,0.15)`.
3. **키워드 칩 아이콘 교체**: lucide 3종 → Figma 커스텀 SVG(`blank-calendar`/`slide-deck`/`waning-crescent-moon`) export 후 사용. 의미 불일치 해소.
4. **Empty state 마스코트 + 배경 ellipse**: 회색 원 placeholder 제거 → 캐릭터 일러스트(120px) + 보라 그라데이션 배경 추가.

### P2 (디테일 정합)

5. 카드 그림자 blur 2px → 1px (`shadow-[0_1px_1px...,0_0_1px...]`).
6. AI 제안 아이콘 lucide `Bot` → `assistant_navigation` SVG.
7. 키워드 칩 padding 비대칭(`pl-3 pr-3.5 py-2`)으로 정렬.

### P3 (미세/후순위)

8. 75% 수치 Manrope Bold 적용(폰트 로드 시).
9. 게이지 fill radius 2px → 4px + 미세 보더.
10. 베스트 모먼트 활성 dot 색(검정 → 브랜드색?) Figma 재확인 후 결정.
11. 에러 화면은 Figma 변형 부재 — 디자인 추가 요청 또는 현행 임시 유지.

> 토큰 매핑: 본 화면 색은 모두 `DESIGN.md` role 토큰으로 표현 가능 (`#262626`/`#555`/`#7B7B7B`/`#9572FF`/`#FFFFFF`/`#FDFDFE`). 칩 3색(`#FFA621`/`#9349F4`/`#497AF4`)·radius 20px·shadow1은 토큰 외 값이므로 토큰화 또는 인라인 허용 여부 의논 필요.
