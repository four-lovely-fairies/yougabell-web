# 홈 디자인 갭 — Figma ↔ 현재 구현

> Figma: node `2395:10623` "홈" (fileKey `sKdG5GEBZPdMjFY9nYj5g0`)
> 하위 프레임: `2395:10624`(홈 - 01), `2395:11458`(홈 - 자녀 이름 선택, 자녀 드롭다운 메뉴 포함)
> 현재 코드: `app/(main)/page.tsx`, `app/(main)/layout.tsx`, `components/home/home-dashboard.tsx`, `components/app/bottom-nav.tsx`, `components/app/main-app-shell.tsx`
> 디자인 토큰 출처: `DESIGN.md`
>
> 작성일: 2026-05-29 · Figma MCP `get_design_context`(2395:10624, 2395:11458) + `get_variable_defs`로 실측한 값 기준.

---

## 1. Figma 디자인 요약

### 1.1 전체 레이아웃 (390px 기준, 좌우 마진 20px)

```
Status Bar (iPhone, 48px, top 0)        ← WebView에선 OS가 그림 (구현 제외)
Sub LNB (헤더, 56px, top 47)            ← 자녀 드롭다운(좌) · 설정(44)·벨(44) (우)
주차 표시 (59px, top 103)               ← "2026년 4월"(좌) · "3주차"(우)
요일 캘린더 스트립 (top 162, pb32)      ← 요일+날짜 7칸 + 기분 뱃지 7칸
오늘의 놀이 카드 (top 288, px20)        ← 칩 + 제목 + 일러스트 + CTA 버튼
현재 상황 카드 (top 499, px20 py12)     ← kid_star 아이콘 + "현재 상황 [ 자아 형성기 ]" + 본문
통계 2칸 (top 663, px20 pb8)           ← "지난주 놀이 수행시간" / "아이 반응 긍정률"
Bottom Nav (하단 고정, p20, pill)       ← 홈 · 놀이 · 로드맵 · AI 상담 · 리포트
Home Indicator (21px)                   ← WebView에선 OS가 그림 (구현 제외)
```

> 좌표는 Figma 절대 위치(부모 프레임 기준). 구현은 flex column + gap으로 변환됨. **섹션 순서**: 캘린더 → 오늘의 놀이 → 현재 상황 → 통계.

### 1.2 섹션별 해부 (Figma 실측)

**Sub LNB / 헤더 (node `2395:10760`, h56, px20)**

- 좌: 자녀 드롭다운 — `arrow_drop_down`(16px) + "김유스 (만3세)" / `Pretendard Medium 14px` / `#262626`. (드롭다운 화살표가 텍스트 **왼쪽**에 위치, 전체 `rotate-180`으로 표현됨)
- 우: 설정 아이콘(`Interface/Settings`, 24px, 44×44 탭타깃) + 벨 아이콘(`Communication/Bell`, 24px, 44×44 탭타깃)

**자녀 드롭다운 메뉴 (node `2395:10959`, "홈 - 자녀 이름 선택" 변형)**

- 위치: `top 108`, `w 260`, 헤더 아래 띄움. `rounded-[32px]`, 보더 `#ebecf0` 1px, 그림자 `0 4px 20px rgba(0,0,0,0.04)`.
- 항목: `px24 py20`, 이름 `Pretendard Bold 14px #1f2127` / 부가 `Pretendard Regular 12px #6f7885` ("만 N세 (YYYY년생)").
- 선택 항목 배경: `--color/primary/50 #efe7ff`.
- 항목 우측: 아이콘 2개(수정/삭제, 각 20px).

**주차 표시 (node `2395:10687`, h59, px20 py8)**

- 좌: "2026년 4월" / `SUIT ExtraBold 20px` / lineHeight 28 / `#262626`
- 우: "3주차" / `SUIT Medium 14px` / lineHeight 20 / `#434343` (`icon/secondary`)

**요일 캘린더 스트립 (node `2395:10691`, top 162, pb32)**

- 1행(요일+날짜, gap6): 7칸, 각 칸 `pt8 pb12 px8`, `rounded-[16px]`.
  - 요일 라벨 `SUIT Bold 9px`, 비활성 `#c4c4c4`(`text/text-disabled`).
  - 날짜 `SUIT Bold 14px`, 비활성 `#262626`.
  - **오늘(월/20)**: 칸 배경 `#9572ff`(`button/button-primary`), 텍스트 흰색.
  - 요일 라벨과 날짜 사이 `gap4`.
- 2행(기분 뱃지, gap8): 7칸, 각 32px.
  - 기록 있음: 표정 이모지(컬러 원, 일=`Ellipse2`/blue sleepy, 월=`Group33942`/pink smile).
  - 오늘(미기록): `#262626` 검은 원 + plus 아이콘(10.5px).
  - 미래(미기록): `#e9e9e9`(`color/gray/100`) 회색 원.

**오늘의 놀이 카드 (node `2395:10663`, p24, rounded-[24px])**

- 그림자: `0 4px 11.5px rgba(0,0,0,0.05)`. 카드 배경 흰색. 내부 `gap13`.
- 칩: 배경 `#f6f6f6`(`color/gray/50`), `px10 py5`, `rounded-full`, "아이 10분 가까워지기" / `Pretendard Medium 12px #262626`.
- 제목: "아이와 눈을 마주치며 / 이야기를 해보아요" (2줄) / `Pretendard Bold 20px` / `tracking-[-0.4px]` / `#262626`.
- 일러스트: 우측 84×60px (`image 597`, 보라 마스코트).
- CTA 버튼: `h48`, `rounded-[16px]`, 배경 `#9572ff`, "오늘의 놀이 시작하기" / `Pretendard Medium 16px` / 흰색 / `tracking-[-0.32px]` / lineHeight 1.5.

**현재 상황 카드 (node `2395:10789`, p24, rounded-[33px])**

- 그림자 `0 4px 10px rgba(0,0,0,0.04)`, 내부 `gap12`.
- 헤더: `kid_star` 아이콘(20px) + "현재 상황 [ 자아 형성기 ]" / `Pretendard Bold 12px #262626` / `gap4`.
- 본문: `Pretendard Medium 14px` / `#555`(`text/text-secondary`) / lineHeight 1.4. (자리표시 텍스트에 "00님" 토큰 포함)

**통계 2칸 (node `2395:10773` / `2395:10780`, gap8)**

- 카드 각각 흰색, `px16 py12`, `rounded-[24px]`, 그림자 `0 4px 10px rgba(0,0,0,0.04)`, 내부 `gap8`.
- 라벨: `Pretendard Medium 12px` / `#7b7b7b`(`text/text-tertiary`).
- 좌(수행시간): 숫자 `SUIT ExtraBold 22px` + 단위("시간"/"분") `Pretendard Medium 14px`. 예: **1** 시간 **17** 분.
- 우(긍정률): 아이콘(`Vector` 15×18, 보라 불꽃) + 숫자 `SUIT ExtraBold 24px` + "%" `14px`. 예: 🔥 **92** %.

**Bottom Nav (node `2395:10626` btn, p20 외곽 / p6 pill 내부)**

- pill 컨테이너: 배경 `#fdfdfe`, `rounded-[999px]`, 그림자 `0 4px 12px rgba(0,0,0,0.04)`, 내부 패딩 6px.
- 5칸 균등(`flex-1`), 각 칸 `py4`, 아이콘 24px + 라벨 `12px`.
- 활성(홈): 배경 `#e9e9e9`(`color/gray/100`) pill, 라벨 `Pretendard Medium #262626`.
- 비활성: 라벨 `Pretendard Regular #9d9d9d`(`text/text-placeholder`).
- **라벨 표기가 변형 간 불일치**: "홈 - 01"은 `놀이 / 로드맵`, "홈 - 자녀 이름 선택"은 `10분 놀이 / 성장 로드맵`. (홈/AI 상담/리포트는 동일)

### 1.3 토큰 (Figma `get_variable_defs` 실측)

| 토큰                              | HEX / 값                          |
| --------------------------------- | --------------------------------- |
| `button/button-primary`           | `#9572ff` (CTA·오늘 캘린더 칸)    |
| `background/background-primary`   | `#ffffff` (카드)                  |
| `background/background-secondary` | `#fdfdfe` (화면·bottom nav pill)  |
| `text/text-primary`               | `#262626`                         |
| `text/text-secondary`             | `#555555`                         |
| `text/text-tertiary`              | `#7b7b7b` (통계 라벨)             |
| `text/text-placeholder`           | `#9d9d9d` (비활성 nav 라벨)       |
| `text/text-disabled`              | `#c4c4c4` (캘린더 요일 라벨)      |
| `icon/primary`                    | `#262626` (오늘 기분 plus 원)     |
| `icon/secondary`                  | `#434343` ("3주차")               |
| `color/gray/50`                   | `#f6f6f6` (칩 배경)               |
| `color/gray/100`                  | `#e9e9e9` (활성 nav·미래 기분 원) |
| `color/primary/50`                | `#efe7ff` (드롭다운 선택 항목)    |
| `color/content/primary`           | `#1f2127` (드롭다운 이름)         |
| `color/content/tertiary`          | `#6f7885` (드롭다운 부가)         |

**타이포 (실측)**

- `Title/Medium-b`: Pretendard Bold 20 / lh 1.4 / ls −0.4 (오늘의 놀이 제목)
- `Body/large-m`: Pretendard Medium 16 / lh 1.5 / ls −0.32 (CTA 버튼)
- `Body/medium-m`: Pretendard Medium 14 / lh 1.4 (현재 상황 본문)
- `Label/Label-m`: Pretendard Medium 12 / lh 1.4 (칩·통계 라벨·nav)
- `Label/Label-b`: Pretendard Bold 12 / lh 1.4 (현재 상황 헤더)
- **숫자·월 헤딩은 `SUIT`** (ExtraBold/Bold/Medium) — Pretendard 아님.

> ⚠️ **핵심 토큰 충돌**: 홈 Figma의 primary는 `#9572ff`인데 `DESIGN.md`의 `primary.500`은 `#754AF6`. 또 본문 변수에 `Labels/Primary #000000`이 등장(Home Indicator) — `DESIGN.md`는 `#000000` 직접 사용 금지. 둘 다 토큰 정합성 점검 필요(§4 참조).

---

## 2. 현재 구현 요약

`components/home/home-dashboard.tsx` 단일 클라이언트 컴포넌트(`"use client"`). API(`loadHomeDashboard`)에서 데이터를 받아 렌더.

- **컨테이너**: `min-h-dvh bg-[#fdfdfe] px-5 pb-9 pt-[47px]`. 섹션 간 `flex-col gap-5`(20px).
- **TopAppBar**: 자녀 버튼(`child.name (ageLabel)`, `text-sm Medium`) + chevron SVG(16px) / 설정 `<a>`(44px) + 알림 버튼(44px, 미읽음 빨강 점 `#ec003f`).
- **WeeklyCalendar**: 월 헤딩 `text-[20px] font-extrabold`(="2026년 4월", `monthHeadingLabel`로 조립) + "N주차" `text-sm Medium #434343`. 요일+날짜 grid(`grid-cols-7 gap-[6px]`, 오늘 칸 `bg-[#9572ff]`). 기분 뱃지 grid(`gap-2`), 오늘 미기록 시 `bg-[#262626]` + plus → 클릭하면 기분 모달.
- **TodayMissionCard**: `rounded-[24px] p-6` 카드. 칩 "아이와 {durationMinutes}분 가까워지기" + 제목(`splitMissionTitle`으로 2줄 분할) + 일러스트(`h-15 w-21`) + 버튼.
- **GrowthStageCard**: `rounded-[33px] p-6` 카드. 아이콘 + "현재 상황 [ {stage.name} ]" + 본문.
- **ReportSummaryCard**: `grid-cols-2 gap-2`, 카드 각 `rounded-[24px]`. 수행시간(`DurationValue` 파싱), 긍정률(`◔` 글리프 + 숫자 + %).
- **모달 3종**: ChildSwitcherSheet(자녀 목록 드롭다운, `rounded-[32px]` border `#ebecf0`, 선택 `#efe7ff`, 수정/삭제는 lucide `Pencil`/`Trash2`), NotificationModal, MoodCheckModal.
- **BottomNav** (`components/app/bottom-nav.tsx`): `MainAppShell`에서 `fixed bottom-0` 렌더. pill `rounded-[999px] bg-[#fdfdfe]`. 라벨 `홈 / 10분 놀이 / 성장 로드맵 / AI 상담 / 리포트`. 활성 `bg-[#e9e9e9]`.
- **숫자/월 헤딩 폰트**: `font-extrabold`만 지정 → 실제론 본문 폰트(Pretendard) 사용. **SUIT 미적용**.

---

## 3. 갭 표

| #   | 요소                   | Figma                                                            | 현재 구현                                                           | 차이 / 액션                                                                 |
| --- | ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| H1  | 헤더 자녀 표기         | "김유스 (만3세)" — 이름과 (나이) 사이 공백                       | "{name} ({ageLabel})" — 공백 동일                                   | ✅ 일치. (드롭다운 화살표 위치는 텍스트 왼쪽 vs 오른쪽 — H3 참조)           |
| H2  | 헤더 드롭다운 화살표   | 텍스트 **왼쪽**에 `arrow_drop_down`(16px), 펼침 상태             | 텍스트 **오른쪽**에 chevron(16px)                                   | 🟡 화살표 위치 반대. Figma 디자인은 좌측 배치 → 코드 좌측으로 이동 검토.    |
| H3  | 자녀 드롭다운 메뉴     | `top 108`, 부가텍스트 "만 N세 (YYYY년생)", 우측 수정/삭제 아이콘 | `top-[108px]`, 부가 "{ageLabel} ({year}년생)", lucide Pencil/Trash2 | 🟡 위치·구조 일치. 부가 텍스트 포맷 미세 차이("만 N세" 누락 가능).          |
| C1  | 캘린더 칸 radius       | `rounded-[16px]`                                                 | `rounded-2xl`(=16px)                                                | ✅ 일치.                                                                    |
| C2  | 캘린더 오늘 칸         | `#9572ff` 배경 + 흰 텍스트                                       | `bg-[#9572ff] text-white`                                           | ✅ 일치.                                                                    |
| C3  | 요일 라벨 폰트/크기    | `SUIT Bold 9px`, 비활성 `#c4c4c4`                                | `text-[9px] font-bold`, 비활성 `#c4c4c4` (Pretendard)               | 🟡 색·크기 일치, **폰트 SUIT 미적용**(T1).                                  |
| C4  | 기분 뱃지(미래)        | `#e9e9e9` 회색 원 32px                                           | `bg-[#e9e9e9] size-8 rounded-full`                                  | ✅ 일치.                                                                    |
| C5  | 기분 뱃지(오늘 미기록) | `#262626` 검은 원 + plus(10.5px)                                 | `bg-[#262626]` 원 + plus 아이콘                                     | ✅ 일치(인터랙션: 클릭 시 기분 모달 — 코드 우위).                           |
| M1  | 오늘의 놀이 칩 문구    | "아이 10분 가까워지기" (고정)                                    | "아이와 {durationMinutes}분 가까워지기"                             | 🟠 문구 다름("아이"↔"아이와", 숫자 동적). 카피 확정 필요.                   |
| M2  | 오늘의 놀이 CTA 라벨   | "오늘의 놀이 시작하기"                                           | "미션 시작하기" / 완료 시 "미션 완료"                               | 🔴 라벨 불일치. Figma 카피로 통일 검토(상태 분기는 코드 유지).              |
| M3  | 카드 radius/패딩       | `rounded-[24px] p-24` `gap13`                                    | `rounded-[24px] p-6`(=24) `gap`은 `mt-[13px]`로 표현                | ✅ 사실상 일치.                                                             |
| M4  | CTA 버튼 radius        | `rounded-[16px]` h48                                             | `rounded-2xl`(=16) `h-12`(=48)                                      | ✅ 일치.                                                                    |
| M5  | 제목 줄바꿈            | "아이와 눈을 마주치며 / 이야기를 해보아요" (고정 2줄)            | `splitMissionTitle`으로 동적 분할                                   | 🟡 동적 텍스트라 분할 결과가 디자인과 다를 수 있음. 의도된 차이.            |
| G1  | 현재 상황 radius       | `rounded-[33px]`                                                 | `rounded-[33px]`                                                    | ✅ 일치.                                                                    |
| G2  | 현재 상황 헤더 폰트    | `Pretendard Bold 12px`                                           | `text-xs font-bold`                                                 | ✅ 일치.                                                                    |
| G3  | 현재 상황 본문 lh      | lineHeight **1.4**                                               | `leading-[1.8]`                                                     | 🟠 행간 차이(1.4 vs 1.8). Figma는 1.4 → 코드 조정 검토.                     |
| S1  | 통계 카드 radius       | `rounded-[24px]`                                                 | `rounded-[24px]`                                                    | ✅ 일치.                                                                    |
| S2  | 수행시간 숫자 폰트     | `SUIT ExtraBold 22px`                                            | `text-[22px] font-extrabold` (Pretendard)                           | 🟡 크기 일치, **폰트 SUIT 미적용**(T1).                                     |
| S3  | 긍정률 아이콘          | 보라 불꽃 SVG(`Vector` 15×18)                                    | `◔` 유니코드 글리프(`text-[#9572ff]`)                               | 🔴 아이콘 불일치. Figma 불꽃 SVG export 후 교체 필요.                       |
| S4  | 긍정률 숫자 폰트/크기  | `SUIT ExtraBold 24px`                                            | `text-[24px] font-extrabold` (Pretendard)                           | 🟡 크기 일치, 폰트 SUIT 미적용(T1).                                         |
| N1  | Bottom nav 라벨        | "10분 놀이 / 성장 로드맵" (자녀선택 변형 기준)                   | "10분 놀이 / 성장 로드맵"                                           | ✅ 일치(자녀선택 변형 기준). "홈-01"의 "놀이/로드맵"과는 Figma 내부 불일치. |
| N2  | Bottom nav 위치        | 화면 흐름 하단(absolute bottom)                                  | `fixed bottom-0` (MainAppShell)                                     | ✅ 동등(고정 방식 차이는 WebView상 문제 없음).                              |
| N3  | Bottom nav 활성 배경   | `#e9e9e9` pill                                                   | `bg-[#e9e9e9]`                                                      | ✅ 일치.                                                                    |
| T1  | 숫자/월 헤딩 폰트      | **SUIT** (ExtraBold/Bold/Medium)                                 | Pretendard(`font-extrabold` 등)만, SUIT 로드 없음                   | 🔴 폰트 패밀리 누락. SUIT 폰트 추가 + 적용, `DESIGN.md`에 SUIT 등재.        |
| T2  | primary 색상 토큰      | `#9572ff` (Figma 홈)                                             | `#9572ff` (하드코딩)                                                | 🟠 코드는 Figma값 일치하나 `DESIGN.md`의 `primary.500 #754AF6`과 충돌.      |
| T3  | 하드코딩 hex           | 토큰 변수 사용                                                   | 전부 `bg-[#...]` 인라인 하드코딩                                    | 🟡 `DESIGN.md`는 토큰→CSS변수 사용 규정. 현재 전 컴포넌트 하드코딩.         |

> 범례: ✅ 일치 · 🟡 경미(폰트/포맷/위치 미세) · 🟠 중간(행간·카피) · 🔴 명확한 갭(아이콘·라벨·폰트패밀리)

---

## 4. 액션 아이템

### P1 (디자인 정합성 직접 영향 — 우선)

- **[T1] SUIT 폰트 도입**: 월 헤딩(20px ExtraBold), 캘린더 요일/날짜(9/14px Bold), 통계 숫자(22/24px ExtraBold), "3주차"(14px Medium)에 SUIT 적용. `next/font/local` 또는 CDN으로 SUIT 로드 + `DESIGN.md` 타이포 표에 SUIT 등재.
- **[M2] CTA 라벨 통일**: "미션 시작하기" → "오늘의 놀이 시작하기"로 변경(완료 상태 분기 로직은 유지, 라벨 문구만 디자인 기준으로).
- **[S3] 긍정률 아이콘 교체**: `◔` 유니코드 글리프 → Figma 보라 불꽃 SVG(`node 2395:10783`) export 후 `<img>` 적용.
- **[T2] primary 토큰 정합성 결정**: 홈 Figma `#9572ff` vs `DESIGN.md` `primary.500 #754AF6` 중 진실의 소스 확정. 메모리 규칙상 **Figma 값 우선** → `DESIGN.md` 토큰 갱신 검토.

### P2 (카피·세부 스타일)

- **[M1] 칩 문구 확정**: "아이와 {n}분 가까워지기"(동적) vs Figma "아이 10분 가까워지기"(고정) — 카피 정책 결정.
- **[G3] 현재 상황 본문 행간**: `leading-[1.8]` → `leading-[1.4]`(Figma) 조정.
- **[H2] 헤더 드롭다운 화살표 위치**: 텍스트 우측 → 좌측(Figma)으로 이동 검토.
- **[H3] 자녀 드롭다운 부가 텍스트**: "{ageLabel} ({year}년생)" → "만 N세 (YYYY년생)" 포맷 정합 확인.

### P3 (구조·규약)

- **[T3] 하드코딩 hex 토큰화**: 홈 화면 전체 `bg-[#...]` 인라인 → CSS 변수/Tailwind theme 토큰으로 전환(`DESIGN.md` §9 "하드코딩 hex 금지" 준수). 단기적으로는 토큰 정의 선행 필요.
- **[Figma 내부] bottom nav 라벨 불일치 정리**: "홈-01"(놀이/로드맵) ↔ "자녀 선택"(10분 놀이/성장 로드맵) — 디자인 측 표기 통일 요청. 코드는 후자 기준 유지.

---

## 부록: 일치 항목(변경 불필요)

캘린더 칸/오늘 강조/기분 뱃지, 오늘의 놀이 카드 radius·패딩·CTA 버튼 치수, 현재 상황 카드 radius·헤더, 통계 카드 radius, bottom nav 활성/비활성 스타일·라벨(자녀선택 변형 기준), 자녀 드롭다운 위치·radius·선택 배경(`#efe7ff`) — 모두 Figma와 일치. 코드의 인터랙션(기분 모달, 알림 모달, 자녀 전환, 스켈레톤)은 Figma 정적 화면보다 풍부함.
