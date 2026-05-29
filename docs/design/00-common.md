# 공통 디자인 갭 — Figma ↔ 현재 구현 (전 화면 공유 요소)

> **Figma**: Foundation `2046:3807` / Element `2046:4278` / Component `2046:4680` (fileKey `sKdG5GEBZPdMjFY9nYj5g0`)
> **실 화면 검증**: 홈 `2395:10623` (Sub LNB `2395:10760` · 표준 Sub LNB `2146:5652` · 바텀 `btn` `2524:2807` · StatusBar `2395:10675` · Home Indicator `2395:10659` · Button `2138:3683` · Input `2136:3617`)
> **현재 코드**: `components/app/*`, `components/ui/*`, `app/globals.css`, `DESIGN.md`
> Figma MCP 정상 동작 확인 (variable_defs + design_context 추출 성공). 본 문서는 전 화면 공유 요소만 다룬다.

---

## ⚠️ 가장 중요한 발견 — Primary 컬러 스케일 전면 불일치

Foundation 노드의 실제 Primary 토큰이 **DESIGN.md / `globals.css` 와 완전히 다르다.** 코드 버튼은 Figma `Primary/300`(`#9572ff`)을 기본 액션으로 쓰고 있어, "기본 액션 = `primary.500`" 라는 DESIGN.md 규칙과도 어긋난다.

| 단계  | Figma Foundation (실제) | DESIGN.md / globals.css | 일치 |
| ----- | ----------------------- | ----------------------- | ---- |
| `50`  | `#efe7ff`               | `#f1eaff`               | ✗    |
| `100` | `#d4c4fe`               | `#d9cbfe`               | ✗    |
| `200` | `#b69cfe`               | `#c0a8fe`               | ✗    |
| `300` | `#9572ff`               | `#a483ff`               | ✗    |
| `400` | `#7850ff`               | `#8c65fe`               | ✗    |
| `500` | `#5a31f4`               | `#754af6`               | ✗    |
| `600` | `#4c2ced`               | `#6945ef`               | ✗    |
| `700` | `#3425e4`               | `#583ce5`               | ✗    |
| `800` | `#111fdc`               | `#4737dc`               | ✗    |
| `900` | `#0013cd`               | `#2a2bce`               | ✗    |

→ **10단계 전부 불일치.** 그런데 실제 버튼 컴포넌트(`2138:3681`, default)는 `#9672ff`(≈`Primary/300 #9572ff`)을 기본 채움으로, disabled(`2138:3682`)는 `#d4c4fe`(`Primary/100`)을 쓴다.
**결론: Figma 디자이너의 "기본 버튼 색"은 `Primary/300 #9572ff`** 이며, 현 코드 버튼(`#9572ff`)이 우연히 이 값과 거의 일치한다. 반대로 DESIGN.md/globals.css 의 primary 토큰 세트는 **출처 불명의 다른 팔레트**다. → 토큰 재정의 P1.

---

## 1. 디자인 토큰 갭

### 1.1 색 — Primary

위 표 참조(전 단계 불일치). 추가로 코드는 토큰을 거치지 않고 **하드코딩 hex** 를 직접 쓴다(`bg-[#9572ff]` 등) — DESIGN.md "하드코딩 hex 금지" 위반.

### 1.2 색 — Grayscale / Text / Border / Icon

Foundation 노드의 Text/Border/Icon role 토큰은 코드/DESIGN.md 와 **거의 일치**. 단, Greyscale primitive 이름·값이 다른 시스템이 섞여 있다.

| 토큰             | Figma Foundation | DESIGN.md / globals.css | 차이                               |
| ---------------- | ---------------- | ----------------------- | ---------------------------------- |
| Text/Primary     | `#262626`        | `#262626` (gray.800)    | ✓                                  |
| Text/Secondary   | `#555555`        | `#555555` (gray.600)    | ✓                                  |
| Text/Tertiary    | `#7b7b7b`        | `#7b7b7b` (gray.500)    | ✓                                  |
| Text/Disabled    | `#c4c4c4`        | `#c4c4c4` (gray.300)    | ✓                                  |
| Border/Primary   | `#d9d9d9`        | `#d9d9d9` (gray.200)    | ✓                                  |
| Border/Secondary | `#e9e9e9`        | `#e9e9e9` (gray.100)    | ✓                                  |
| Border/Tertiary  | `#f6f6f6`        | `#f6f6f6` (gray.50)     | ✓                                  |
| Icon/Primary     | `#262626`        | `#262626`               | ✓                                  |
| Icon/Secondary   | `#434343`        | `#434343` (gray.700)    | ✓                                  |
| Icon/Disabled    | `#9d9d9d`        | `#9d9d9d` (gray.400)    | ✓                                  |
| Greyscale/900    | `#1a1a1a`        | gray.800 `#262626`      | ✗ Figma는 별도 `#1a1a1a` 사용      |
| Greyscale/025    | `#f9f9f9`        | gray.50 `#f6f6f6`       | ✗                                  |
| Greyscale/100    | `#e5e5e5`        | gray.100 `#e9e9e9`      | ✗                                  |
| Greyscale/500    | `#808080`        | gray.500 `#7b7b7b`      | ✗                                  |
| surface(바텀/셸) | `#fdfdfe`        | gray.20 `#fdfdfe`       | ✓ (코드 `MainAppShell`/`btn` 일치) |

> Text/Border/Icon role 은 신뢰 가능. **Greyscale primitive 는 Figma 안에서도 두 세트(`Greyscale/*` vs `Color/*`)가 공존** — primitive 직접 참조 금지, role 토큰만 사용 권장.

### 1.3 색 — Semantic (Error 불일치 주의)

| 그룹           | Figma 컴포넌트 실측 | DESIGN.md / 코드           | 차이                            |
| -------------- | ------------------- | -------------------------- | ------------------------------- |
| Error / border | `#ff5050` (Input)   | error.600 `#ec003f` (토큰) | ✗ **컴포넌트는 `#ff5050` 사용** |
| Error (코드)   | —                   | `#ff5050` (input.tsx 하드) | 코드는 `#ff5050` 직접 박음      |

> Input 에러 보더는 Figma·코드 모두 `#ff5050`. 그러나 DESIGN.md 의 `error.600`/`border.error` 토큰은 `#ec003f`.
> → **`#ff5050` 을 error 계열 토큰으로 정식 등록**하거나, 컴포넌트를 `#ec003f` 로 통일해야 함. 현재 토큰과 실 사용값이 갈라져 있음.

### 1.4 타이포 (Figma Foundation 실측 vs DESIGN.md)

| 스타일      | Figma (family / size / weight / lh / ls) | DESIGN.md              | 차이 |
| ----------- | ---------------------------------------- | ---------------------- | ---- |
| Headline H1 | Pretendard Bold 24 / 34 / -0.4           | Bold 24 / 34 / -0.4    | ✓    |
| Headline H2 | Pretendard Bold 20 / 30 / -0.4           | Bold 20 / 30 / -0.4    | ✓    |
| Headline H3 | Pretendard Bold 18 / 30 / -0.4           | Bold 18 / 30 / -0.4    | ✓    |
| subtitle1   | Pretendard Bold 16 / 24 / -0.2           | Bold 16 / 24 / -0.2    | ✓    |
| subtitle2   | Pretendard Bold 14 / 22 / -0.2           | Bold 14 / 22 / -0.2    | ✓    |
| subtitle3   | Pretendard Medium 16 / 24 / -0.2         | Medium 16 / 24 / -0.2  | ✓    |
| subtitle4   | Pretendard Medium 14 / 22 / -0.2         | Medium 14 / 22 / -0.2  | ✓    |
| body1       | Pretendard Regular 16 / 26 / -0.4        | Regular 16 / 26 / -0.4 | ✓    |
| body2       | Pretendard Regular 15 / 25 / -0.4        | Regular 15 / 25 / -0.4 | ✓    |
| body3       | Pretendard Regular 14 / 24 / -0.4        | Regular 14 / 24 / -0.4 | ✓    |
| caption1    | Pretendard Regular 12 / 20 / -0.2        | Regular 12 / 20 / -0.2 | ✓    |
| caption2    | Pretendard Regular 10 / 18 / -0.2        | Regular 10 / 18 / -0.2 | ✓    |

> 타이포 토큰은 **완전 일치**. 단 **코드에 타이포 토큰이 전혀 없다** — Tailwind text utility(`text-[15px]`, `leading-[1.4]`)만 산발 사용. `@theme` 에 `--text-*` 토큰 미정의 → 타이포 토큰화 P2.
> 컴포넌트 실측 letter-spacing 은 `-0.32px`(버튼 16px), `-2`(body) 등 추가값 발견 — Foundation 표준(-0.4/-0.2)과 미세 불일치 존재.

### 1.5 Radius

| 토큰 | Figma Element  | DESIGN.md | globals.css         | 차이                              |
| ---- | -------------- | --------- | ------------------- | --------------------------------- |
| xs   | (small≈4)      | 4px       | `--radius-xs: 4px`  | ✓                                 |
| sm   | (small≈4–8)    | 8px       | `--radius-sm: 8px`  | ✓                                 |
| md   | 12px (xlarge2) | 12px      | `--radius-md: 12px` | ✓                                 |
| lg   | 16px           | 16px      | `--radius-lg: 16px` | ✓                                 |
| xl   | 20px           | 20px      | `--radius-xl: 20px` | ✓                                 |
| full | 999px          | 999px     | **미정의**          | ✗ globals 에 `--radius-full` 없음 |

> 토큰 표는 일치하나 **`radius.full(999px)` 가 `@theme` 에 없음** → 바텀 nav 가 `rounded-[999px]` 하드코딩. 토큰화 필요.
> Element 노드 raw 값(`radius/small1: 4`, `radius/medium1: 6`, `radius/xlarge2: 12`)은 다른 시스템(GOV) 스케일이 섞인 것 — DESIGN.md 의 4·8·12·16·20 스케일을 정본으로 본다.

### 1.6 Spacing

| 토큰   | DESIGN.md | Figma Element(raw)        | 비고 |
| ------ | --------- | ------------------------- | ---- |
| 1      | 2px       | `gap/1: 2`                | ✓    |
| 2      | 4px       | `padding/2: 4`            | ✓    |
| 3      | 8px       | `padding/3: 8` `gap/3: 8` | ✓    |
| 5      | 16px      | `gap/5: 16`               | ✓    |
| 7      | 24px      | `gap/7: 24`               | ✓    |
| card-m | 32px      | `padding-card/medium: 32` | ✓    |
| card-l | 40px      | `padding-card/large: 40`  | ✓    |

> Spacing 스케일 일치. **코드에 spacing 토큰 미정의** — Tailwind 기본 스케일(px-5=20, py-4 등) 직접 사용. `@theme --spacing-*` 없음. 일관성은 유지되나 토큰화 안 됨.

### 1.7 Elevation (그림자)

| 토큰    | Figma Element 실측                            | DESIGN.md           | 차이 |
| ------- | --------------------------------------------- | ------------------- | ---- |
| shadow1 | `0 1 / 2 / 0` + `0 0 / 2`, `#0000000d`(5%)    | `0 1px`+`0 0`, 5%   | ✓    |
| shadow2 | `0 4 / 8 / 0` + `0 0 / 2`, `#00000014`(8%)    | `0 4px`+`0 0`, 8%   | ✓    |
| shadow3 | `0 8 / 16 / 0` + `0 0 / 2`, `#0000001f`(12%)  | `0 8px`+`0 0`, 12%  | ✓    |
| shadow4 | `0 16 / 24 / 0` + `0 0 / 2`, `#0000001f`(12%) | `0 16px`+`0 0`, 12% | ✓    |

> Elevation 토큰 일치. 그러나 **바텀 nav 코드 그림자가 디자인 토큰과 무관** — 코드 `shadow-[0_4px_12px_rgba(0,0,0,0.04)]`, Figma `btn` 도 `0 4 12 / 4%`(이중). shadow2(`0 4 8 / 8%`)와 다른 **별도 값**. → 바텀 전용 그림자를 토큰화하거나 shadow 스케일 재정의 필요. `@theme` 에 shadow 토큰 미정의.

---

## 2. 공통 컴포넌트 갭

### 2.1 Sub LNB (공통 헤더) — **현재 공용 컴포넌트 없음 (P1)**

Figma 에는 두 변형이 존재하나, 코드에는 `onboarding-header.tsx`(온보딩 전용)만 있고 **메인 화면용 공통 헤더가 없다.**

#### (A) 표준 헤더 — back + 중앙 타이틀 + 우측 아이콘 (`2146:5652`)

| 속성        | Figma 실측                                            | 현재 코드 (`onboarding-header.tsx`) | 갭                     |
| ----------- | ----------------------------------------------------- | ----------------------------------- | ---------------------- |
| 높이        | **56px**                                              | `h-14` = 56px                       | ✓ 높이만 동일          |
| 배경        | white                                                 | 없음(투명)                          | ✗                      |
| 좌우 패딩   | `px-16`                                               | 없음(부모 의존)                     | ✗                      |
| back 버튼   | 44×44 hit area, p-8, arrow 24×24                      | `IconButton` 44×44 (`-m-2`)         | △ 마진 방식 다름       |
| 타이틀      | **중앙 정렬**, Pretendard SemiBold 16, `#191f28`      | **타이틀 없음**                     | ✗ 타이틀 미지원        |
| 우측 아이콘 | 44×44, bell 등 24×24 (옵션)                           | close 1종만(`ml-auto`)              | ✗ 우측 액션 슬롯 없음  |
| 정렬        | `justify-between` (좌/중앙/우 3-슬롯, 양끝 44px 균형) | 단일 아이콘만                       | ✗ 3-슬롯 레이아웃 없음 |

> ⚠️ 타이틀 색 `#191f28`(Toss 계열 다크)로, role `text.primary #262626` 과도 다름 — 컴포넌트 한정 별색.

#### (B) 대시보드 헤더 — 자녀 선택 + 우측 설정/알림 (`2395:10760`)

| 속성 | Figma 실측                                                                |
| ---- | ------------------------------------------------------------------------- |
| 높이 | 56px, `px-20`, `justify-between`                                          |
| 좌측 | 자녀 셀렉터: 텍스트 Pretendard Medium 14 `#262626` + arrow_drop_down 16px |
| 우측 | 아이콘 2개(설정/알림) 각 44×44, 아이콘 24×24                              |

→ **공통 `<AppHeader>` 신설 필요**: `variant`(back / dashboard), `title`, `right`(액션 슬롯) props. 온보딩 헤더는 이 컴포넌트의 한 케이스로 흡수 검토.

### 2.2 Bottom Navigation (`2524:2807` "btn")

코드(`components/app/bottom-nav.tsx`)와 Figma 를 정밀 비교. **구조는 거의 일치, 아이콘·라벨에 갭.**

| 속성            | Figma `btn` 실측                                                           | 현재 코드                                           | 갭                              |
| --------------- | -------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------- |
| 컨테이너 배경   | `#fdfdfe`                                                                  | `bg-[#fdfdfe]`                                      | ✓                               |
| 컨테이너 패딩   | `p-6`                                                                      | `p-[6px]`                                           | ✓                               |
| 컨테이너 radius | `999px`                                                                    | `rounded-[999px]`                                   | ✓ (토큰화는 안 됨)              |
| 그림자          | `0 4px 12px rgba(0,0,0,0.04)` (이중 동일)                                  | `shadow-[0_4px_12px_rgba(0,0,0,0.04)]`              | ✓ 값 동일 (토큰 아님)           |
| 아이템 gap      | `gap-4` (4px)                                                              | `gap-1` (4px)                                       | ✓                               |
| 아이템          | flex-1, 세로, `gap-2`(2px), `py-4`                                         | `flex-1`, 세로, `gap-0.5`(2px), `py-1`(4px)         | ✓                               |
| 아이템 높이     | hug(아이콘24+gap2+라벨) ≈ 51px                                             | `h-[56px]` 고정                                     | ✗ 코드가 5px 더 큼              |
| 아이콘 크기     | **24×24** (전 탭)                                                          | 18~22px 변칙(`h-[18px] w-4` 등)                     | ✗ **코드 아이콘이 작고 제각각** |
| 활성 배경       | `#e9e9e9`, radius 999                                                      | `bg-[#e9e9e9]`                                      | ✓                               |
| 활성 라벨       | Pretendard Medium 12 `#262626`                                             | `font-medium`, `text-[#262626]`                     | ✓                               |
| 비활성 라벨     | Pretendard Regular 12 `#9d9d9d`                                            | `font-normal`, `text-[#9d9d9d]`                     | ✓                               |
| 라벨 텍스트     | 홈 / **놀이** / 로드맵 / AI 상담 / 리포트                                  | 홈 / **10분 놀이** / 성장 로드맵 / AI 상담 / 리포트 | ✗ 워딩 불일치 (아래 주석)       |
| 아이콘 종류     | home / **mountain_flag** / **assignment_turned_in** / maps_ugc / bar_chart | nav-home/play/roadmap/ai/weekly-report (자체 SVG)   | ✗ 아이콘 의미 다름              |

> ⚠️ **Figma 스티키 노트(`2433:9331`, 오유현)**: "‘미션’ 대신 ‘놀이’, 네비게이션은 ‘10분 놀이’보다 ‘오늘 놀이’로 변경" — 디자이너 의도는 **"놀이"(또는 "오늘 놀이")**. 코드의 "10분 놀이"/"성장 로드맵"은 구버전 워딩. 라우트(`/mission`)도 ‘놀이’ 네이밍과 어긋남.
> → 아이콘 크기 24px 통일 + 라벨 워딩 정합 + (가능하면) 아이콘 셋을 Figma(mountain_flag 등)에 맞춤. 정렬/색/그림자/radius 는 OK.

### 2.3 Button (`2138:3683`)

| 속성             | Figma 실측                                       | 현재 코드 (`button.tsx`)               | 갭                                  |
| ---------------- | ------------------------------------------------ | -------------------------------------- | ----------------------------------- |
| primary 채움     | `#9672ff` (default) / `#9572ff` (Button variant) | `bg-[#9572ff]`                         | ✓ (≈ Primary/300)                   |
| primary hover    | (Figma 미정의)                                   | `#8965f5` / active `#7d57ec`           | △ 코드 자체 정의                    |
| disabled 채움    | `#d4c4fe` (Primary/100)                          | `disabled:bg-[#d4c4fe]`                | ✓                                   |
| lg 높이          | **52px** (default 큰 버튼)                       | `lg: h-14` = 56px                      | ✗ **코드가 4px 큼**                 |
| sm/Button 높이   | **48px** (작은 버튼 w-148)                       | `md: h-12` = 48px                      | ✓                                   |
| lg radius        | **16px**                                         | `lg/full: rounded-2xl` = 16px          | ✓                                   |
| md/Button radius | **12px**                                         | `md: rounded-xl` = 12px                | ✓                                   |
| lg 패딩          | `px-20 py-12`                                    | `lg: px-6`(24) — py 없음(h로 제어)     | ✗ px 24 vs 20                       |
| Button(sm) 패딩  | `px-16 py-14`                                    | `md: px-5`(20)                         | ✗ px 20 vs 16                       |
| 폰트(lg)         | Pretendard **Medium** 16, ls `-0.32`             | `font-semibold` text-base(16)          | ✗ **weight Medium vs SemiBold**     |
| 폰트(sm)         | Pretendard Medium 14                             | `font-semibold` text-[15px]            | ✗ weight + size(15 vs 14)           |
| variant 종류     | default / disabled / Button(보조) 정도           | primary/secondary/outline/dashed/ghost | △ 코드가 더 많음(Figma엔 없는 변형) |

> 주요 갭: **lg 높이 56→52, 폰트 weight SemiBold→Medium, lg/sm 가로 패딩(20/16), sm size 15→14.** secondary/outline/dashed/ghost 는 Figma 미정의 → 디자인 확정 필요.

### 2.4 Input / Text Field (`2136:3617`)

| 속성          | Figma 실측                             | 현재 코드 (`input.tsx`)               | 갭                                       |
| ------------- | -------------------------------------- | ------------------------------------- | ---------------------------------------- |
| 높이          | **48px**                               | `h-12` = 48px                         | ✓                                        |
| radius        | **16px**                               | `rounded-2xl` = 16px                  | ✓                                        |
| 패딩          | `px-16 py-12`                          | `px-4`(16) — py 없음(h제어)           | ✓                                        |
| 기본 보더     | `#e9e9e9` (border.secondary)           | `border-[#e9e9e9]`                    | ✓                                        |
| focus 보더    | (Figma typing 상태엔 명시 보더색 없음) | `focus-within:border-[#9572ff]`       | △ 코드가 primary 로 정의                 |
| error 보더    | **`#ff5050`**                          | `border-[#ff5050]`                    | ✓ (단 토큰 `error.600 #ec003f`와 어긋남) |
| error 메시지  | Pretendard Medium 12 `#ff5050`         | **미지원** (보더만 변경)              | ✗ 에러 텍스트 슬롯 없음                  |
| placeholder   | Pretendard Regular 14 `#9d9d9d`        | `placeholder:text-gray-400` (#9d9d9d) | ✓                                        |
| 입력 텍스트   | Pretendard Regular 14 `#080c14`        | `text-gray-800` (#262626)             | ✗ 색 다름(`#080c14` vs `#262626`)        |
| disabled      | bg `#fdfdfe`, 텍스트 `#c4c4c4`         | `disabled:text-gray-400` (#9d9d9d)    | ✗ disabled 텍스트색·배경 미반영          |
| dropdown 변형 | chevron 우측, 동일 박스                | `trailing` 슬롯으로 대응 가능         | △ 전용 변형 없음                         |

> 주요 갭: **에러 메시지 텍스트 슬롯 부재, 입력/placeholder 폰트(14px) 미고정**(코드는 globals `input{font-size:16px}` 으로 WebView zoom 방지 — 디자인 14px 과 충돌), **disabled 스타일 불완전**, error 색이 토큰과 분리.
> ⚠️ globals.css `input,select,textarea { font-size:16px }` 가 Figma 14px 와 상충 — WebView zoom 방지가 우선이므로 의도적 예외임을 문서화 필요.

### 2.5 StatusBar (iPhone) (`2395:10675`)

| 속성 | Figma 실측                                   | 현재 코드 | 갭                |
| ---- | -------------------------------------------- | --------- | ----------------- |
| 크기 | 390×48, `py-4`                               | **없음**  | ✗ 컴포넌트 미구현 |
| 시간 | SF Pro Semibold 17 `#262626`, pl-40          | —         | ✗                 |
| 우측 | Cellular/Wifi/Battery 아이콘, `gap-7`, pr-16 | —         | ✗                 |

> WebView 안에서는 실제 OS 상태바가 보이므로 **웹 구현은 보통 불필요**. 단 safe-area 상단 인셋 확보는 필요 — 현재 `MainAppShell` 에 상단 `safe-area-inset-top` 처리 없음(하단만 있음). → 상단 인셋 가드 추가 검토.

### 2.6 Home Indicator (`2395:10659`)

| 속성      | Figma 실측                                    | 현재 코드                                                                        | 갭                 |
| --------- | --------------------------------------------- | -------------------------------------------------------------------------------- | ------------------ |
| 크기      | 390×21, 바 139×5, radius 100, black, bottom-8 | **없음** (시각 요소)                                                             | ✗ 미구현           |
| safe-area | 하단 인셋 영역                                | `pb-[max(20px,env(safe-area-inset-bottom))]` (바텀) / `pb-[calc(96px+...)]` (셸) | △ 인셋 처리만 존재 |

> Home Indicator 시각 바 자체는 OS 가 그리므로 웹 미구현 정당. **하단 safe-area 인셋은 이미 처리됨**(바텀 nav + 셸). OK.

---

## 3. 액션 아이템 (P1 / P2 / P3)

### P1 — 즉시 (정합성 깨짐 / 공통 컴포넌트 부재)

1. **Primary 컬러 스케일 재정의** — Foundation 실값(`50 #efe7ff … 500 #5a31f4 … 900 #0013cd`)으로 `globals.css` `--color-primary-*` 전면 교체. 단, **버튼 기본색은 `Primary/300 #9572ff`** 임을 디자이너와 확인 후 role 토큰(`--primary`) 매핑. (현 DESIGN.md primary 팔레트는 출처 불명 → 폐기 검토)
2. **공통 `<AppHeader>` 신설** (`components/app/app-header.tsx`) — `variant: back | dashboard`, `title`(중앙, SemiBold 16 `#191f28`), `right` 액션 슬롯, 높이 56 / bg white / px-16(back)·px-20(dashboard). 온보딩 헤더 흡수 검토.
3. **바텀 nav 아이콘 24px 통일 + 라벨 워딩 정합** — `놀이`(또는 `오늘 놀이`) / `로드맵` 등 Figma·스티키 의도 반영. 아이템 고정 높이 `h-[56px]` → hug(약 51) 재검토.
4. **Error 색 일원화** — `#ff5050`(컴포넌트 실사용) vs `#ec003f`(토큰). 하나로 통일 후 `--color-error-*` 갱신, Input·메시지 모두 토큰 참조.

### P2 — 토큰화 / 컴포넌트 보강

5. **타이포 토큰 `@theme` 등록** — `--text-headline-h1 …` + size/lh/weight/ls 세트. 현재 utility 산발 사용 → CVA `<Text>` 또는 Tailwind 커스텀 유틸로 묶기.
6. **`radius.full(999px)` · spacing · shadow 토큰화** — `--radius-full`, `--spacing-*`, `--shadow-1~4` (+바텀 전용 `0 4 12 / 4%`) `@theme` 정의. 바텀 nav `rounded-[999px]`·그림자 하드코딩 제거.
7. **Button 치수·폰트 정합** — `lg` 높이 56→52, 폰트 SemiBold→**Medium**, lg 패딩 `px-6`→`px-5`(20), sm 패딩 `px-5`→`px-4`(16) + size 15→14. secondary/outline/dashed/ghost variant 디자인 확정.
8. **Input 보강** — 에러 메시지 텍스트 슬롯(Medium 12 error색), disabled(bg `#fdfdfe`·텍스트 `#c4c4c4`), 입력 텍스트색 토큰화. dropdown 변형 정식 지원. WebView 16px zoom 예외 명시.

### P3 — 정리 / 문서

9. **하드코딩 hex 제거** — `bottom-nav.tsx`·`button.tsx`·`input.tsx`·`main-app-shell.tsx` 의 `#fdfdfe`·`#9572ff`·`#e9e9e9`·`#ff5050` 등 → role 토큰/Tailwind 토큰 클래스로 치환 (DESIGN.md "하드코딩 금지" 준수).
10. **StatusBar 상단 safe-area 가드** — `MainAppShell` 에 `pt-[env(safe-area-inset-top)]` 또는 헤더 sticky 시 상단 인셋 반영. (시각 상태바 자체는 OS 담당, 웹 미구현 유지)
11. **Greyscale primitive 정리** — Figma 내 `Greyscale/*`(`#1a1a1a` 등)과 `Color/*` 두 세트 공존. role 토큰만 코드에서 참조하도록 못박고, primitive 직접 사용 금지 재확인.
12. **DESIGN.md ↔ 본 문서 동기화** — 위 토큰 갱신값을 `DESIGN.md` §1~5 에 반영(특히 primary 팔레트, error 색).
