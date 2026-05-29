# 채팅(AI 챗봇) 디자인 갭 — Figma ↔ 현재 구현

> Figma: node `2395:12599` "채팅" (fileKey `sKdG5GEBZPdMjFY9nYj5g0`) — 상태 3종(01 빈 / 02 로딩 / 03 답변)
> 하위 프레임: `2396:4953`(01 빈), `2396:5287`(02 로딩), `2395:12602`(03 답변)
> 현재 코드: `app/chat/page.tsx`, `components/chat/markdown-message.tsx`, `hooks/use-chat-typewriter.ts`, `lib/chat-data.ts`
> 디자인 토큰 출처: `DESIGN.md`
>
> 작성일: 2026-05-29 · Figma MCP `get_design_context` + `get_variable_defs`로 실측한 값 기준.

---

## 1. Figma 디자인 요약

### 1.1 화면 상태(변형)별 레이아웃

세 상태 모두 공통 골격을 공유한다.

```
Status Bar (iPhone, 48px)         ← WebView에선 OS가 그림 (구현 제외)
Sub LNB (헤더, 56px)              ← back(44) · "Ai 챗봇"(중앙) · close(44, opacity-0)
안내 문구 (px20 py12)             ← "사용자의 행동 데이터와 패턴을 기반으로 대화합니다."
─────────────────────────────────
[상태별 본문 영역]
─────────────────────────────────
퀵리플라이 칩 가로 스크롤 (pt16 px20)
입력바 (Input, p20)
Home Indicator (21px)             ← WebView에선 OS가 그림 (구현 제외)
```

| 상태        | 본문 영역 구성                                                                          |
| ----------- | --------------------------------------------------------------------------------------- |
| **01 빈**   | 본문이 `flex-1 + gap-36 + center` — 마스코트(120px) + "궁금한점을 모두\n물어보세요."    |
| **02 로딩** | 유저 말풍선 + AI 로딩 말풍선(점 3개)                                                    |
| **03 답변** | 유저 말풍선 + AI 답변 말풍선(인트로 단락 + 카드 2장 + 마무리 단락이 **한 말풍선 안에**) |

> **핵심 관찰**: 03 답변 상태에서 AI 응답은 **단일 말풍선**이다. 인트로 텍스트, 카드 블록(`gap-16`), 마무리 텍스트가 한 `#f5f1ff` 버블 안에 `gap-20`으로 쌓인다. 단락마다 버블을 쪼개지 않는다.

### 1.2 핵심 컴포넌트 해부 (Figma 실측)

**헤더 (Sub LNB, node `…:5301`/`…:13021`/`…:4967`)**

- 높이 `56px`, `flex justify-between items-center`, `px-16`
- back 버튼: `44×44` 컨테이너, `p-8`, 내부 `arrow_back` 아이콘 `24×24`
- 타이틀: "Ai 챗봇", Pretendard SemiBold `16px`, line-height `1.4`, 색 `#191f28`
- 우측: `close` 아이콘 `24×24`를 담은 `44×44`, **`opacity-0`** (좌우 균형용 자리만)

**안내 문구 (node `…:5309` 등)**

- `px-20 py-12`, 중앙 정렬
- 텍스트: Pretendard Medium `13px` / line-height `1.4` / letter-spacing `0.2522px` / 색 `#667080` (Content/Secondary)

**유저 말풍선 (node `…:5312`/`…:12858`)**

- 배경 `#f6f6f6` (color/gray/50), radius `16px` (radius-system/l)
- `px-16 py-12`, `width 260px` (max-width 260)
- 우측 정렬(`items-end`), 바깥 패딩 `px-20 py-10`
- 텍스트: Pretendard Regular `14px` / line-height `1.4` / 색 `#262626` (text-primary)

**AI 말풍선 — 로딩 (node `…:5317`)**

- 배경 `#f5f1ff`, radius `16px`, `px-16 pt-11.995 pb-12`
- 로딩 인디케이터(node `2396:5261`): `42×25` 영역, 점 3개 각 `6.193px`
- 좌측 정렬, 컨테이너 `max-w-310 / w-310`, 바깥 패딩 `px-20 py-10`

**AI 말풍선 — 답변 (node `…:12847`)**

- 배경 `#f5f1ff`, radius `16px`, `px-16 pt-11.995 pb-12`, `w-full`(컨테이너 310)
- 내부 세로 `gap-20`: [인트로 단락] → [카드 컨테이너] → [마무리 단락]
- 바깥 패딩 `p-20`
- 본문 텍스트: Pretendard Regular `14px` / line-height `1.4` / 색 **`#242b37` (Content/Primary)**

**카드 (node `…:13131` VerticalBorder)**

- 카드 컨테이너 세로 `gap-16`, 카드 1장은 `gap-4`(제목↔본문)
- 제목(Heading 4): Pretendard **Bold** `14px` / 1.4 / 색 `#262626`
- 본문: Pretendard Regular `14px` / 1.4 / 색 **`#4d4351`**
- 카드 배경/보더/radius **없음** (AI 버블 안에 텍스트 블록으로만 존재). 이름이 "VerticalBorder"지만 실제 적용된 보더는 `border-0 border-transparent`

**퀵리플라이 칩 (Button, node `…:4980` 등)**

- 배경 `#f6f6f6` (color/gray/50), radius `9999px`(pill)
- 패딩: **01·03 상태 = `px-24 py-14`**, **02 상태 = `px-20 py-12`** (상태별 불일치 — Figma 자체 편차)
- 칩 간격: 01·03 = `gap-12`, 02 = `gap-10`
- 가로 컨테이너 `pt-16 px-20`, `overflow-clip`(가로 스크롤)
- 텍스트: Pretendard Medium `14px` / 1.4 / 색 `#262626`

**입력바 (Input, node `…:5329` 등)**

- 배경 `#ffffff` (background-primary), radius `48px`
- `px-20 py-14`, `justify-between`
- 그림자: `0px 4px 24px 0px rgba(0,0,0,0.04)` 2겹
- placeholder: Pretendard Regular `14px` / 1.4 / 색 `#9d9d9d` (text-placeholder)
- 전송 버튼: `24×24` 원형(radius 856 ≈ full), 배경 **`#000000` (color/gray/900)**, 내부 화살표 `Arrow_Up_MD` `20.571px`, 아이콘 색 `#ffffff`
- 입력바 래퍼 바깥 패딩 `p-20`

**빈 상태 마스코트 (node `2396:5003`)**

- 컨테이너 `120×120`(size-30)
- `image 599`(aspect 147/127) — 큰 sprite에서 잘라 쓴 이미지: `left -125.02% / top -220.04% / w 339.56% / h 320.45%`
- 마스코트↔텍스트 `gap-36`, 본문 영역은 `flex-1 + justify-center`
- 텍스트: Pretendard **Bold** `18px`(Title/Small-b) / 1.4 / 색 `#262626` / 중앙 / 2줄("궁금한점을 모두" + "물어보세요.")

### 1.3 사용 토큰 (Figma `get_variable_defs` 실측)

| 토큰                              | 값        | 쓰임                             |
| --------------------------------- | --------- | -------------------------------- |
| `background/background-secondary` | `#fdfdfe` | 화면 배경                        |
| `background/background-primary`   | `#ffffff` | 입력바 배경                      |
| `color/gray/50`                   | `#f6f6f6` | 유저 말풍선·퀵리플라이 배경      |
| `color/gray/900`                  | `#000000` | 전송 버튼 배경                   |
| `text/text-primary`               | `#262626` | 유저 텍스트·헤더 외 본문         |
| `text/text-placeholder`           | `#9d9d9d` | 입력 placeholder                 |
| `Content/Primary`                 | `#242b37` | AI 답변 본문 텍스트              |
| `Content/Secondary`               | `#667080` | 안내 문구                        |
| (raw) AI 버블 배경                | `#f5f1ff` | AI 말풍선 (토큰 미바인딩)        |
| (raw) 카드 본문                   | `#4d4351` | 카드 설명 텍스트 (토큰 미바인딩) |
| (raw) 헤더 타이틀                 | `#191f28` | "Ai 챗봇" (토큰 미바인딩)        |
| `radius-system/l`                 | `16`      | 말풍선 radius                    |
| `icon-color`                      | `#ffffff` | 전송 화살표                      |

타이포 스타일:

| 스타일          | 폰트/굵기          | size | line-height | letter-spacing | 쓰임           |
| --------------- | ------------------ | ---- | ----------- | -------------- | -------------- |
| `Body/Small/M`  | Pretendard Medium  | 13   | 1.4         | `1.94px`\*     | 안내 문구      |
| `Body/Medium-r` | Pretendard Regular | 14   | 1.4         | 0              | 말풍선 본문·칩 |
| `Body/medium-m` | Pretendard Medium  | 14   | 1.4         | 0              | 퀵리플라이 칩  |
| `Body/medium-b` | Pretendard Bold    | 14   | 1.4         | 0              | 카드 제목      |
| `Title/Small-b` | Pretendard Bold    | 18   | 1.4         | 0              | 빈 상태 문구   |

> \* `Body/Small/M`의 letter-spacing은 변수 정의상 `1.94`(% 기반)이며, 14px 안내 문구에서는 코드의 `tracking-[0.2522px]`로 환산되어 적용됨.

---

## 2. 현재 구현 요약

| 파일                                   | 구현 요소                                                                                                                                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/chat/page.tsx`                    | 전체 화면. 헤더, 안내 문구, 에러 배너, 스크롤 영역, 빈 상태, "이전 대화 더보기" 윈도잉, 퀵리플라이, 입력바. 서브 컴포넌트 `EmptyState`/`UserBubble`/`LoadingBubble`/`StreamingBubble`/`AssistantMessage`/`AssistantBubble` |
| `components/chat/markdown-message.tsx` | `react-markdown` + `remark-gfm`로 본문 마크다운 렌더. 색 `#242b37`, 14px/1.4                                                                                                                                               |
| `hooks/use-chat-typewriter.ts`         | 스트리밍 타자기(22ms/글자), 단락(`\n\n`) 경계마다 버블 분할 + 점 인터루드(650ms)                                                                                                                                           |
| `lib/chat-data.ts`                     | `QUICK_REPLIES`(3개), `INITIAL_VISIBLE_MESSAGES=4`, `splitParagraphs()`(단락 분할)                                                                                                                                         |

현재 코드가 쓰는 색/치수(요약):

- 화면 배경 `#fdfdfe` ✓ · 헤더 56px 아님 **h-14(56px)** ✓ · 타이틀 `#191f28` 16px semibold ✓
- 안내 문구 `#667080` 13px medium `tracking-[0.2522px]` ✓
- 유저 말풍선 `#f6f6f6` / `rounded-2xl`(16px) / `px-4 py-3` / `max-w-[260px]` / 텍스트 `#262626` 14px ✓
- AI 말풍선 `#f5f1ff` / `rounded-2xl` / `px-4 py-3` / **`w-[310px]`(고정)** / 텍스트 `#242b37` ✓
- 카드: 제목 `#262626` bold 14px ✓, 본문 `#4d4351` 14px ✓, 카드 컨테이너 `gap-4`, AI 버블 내부 `gap-5`(20px) ✓
- 퀵리플라이 `#f6f6f6` pill / `px-6 py-3.5`(24/14) / `gap-3`(12px) / `#262626` 14px medium ✓ (01·03 기준)
- 입력바 `bg-white` / `rounded-[48px]` / `px-5 py-3.5`(20/14) / 그림자 2겹 ✓, 전송 버튼 `bg-black` size-24 ✓
- 빈 상태 마스코트 `size-30`(120px) sprite 동일 offset ✓, `gap-9`(36px) ✓, 텍스트 `text-lg`(18px) bold `#262626` ✓

---

## 3. 갭 표 (Figma vs 현재)

| 요소                  | Figma                                                          | 현재 구현                                                             | 차이 / 액션                                                                                                                 |
| --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 헤더 높이             | `56px`                                                         | `h-14` (56px)                                                         | 일치 ✓                                                                                                                      |
| 헤더 back/close 박스  | `44×44` (`p-8`, 아이콘 24)                                     | `size-11`(44) 아이콘 `size-6`(24)                                     | 일치 ✓                                                                                                                      |
| 헤더 타이틀           | `#191f28` / 16 / SemiBold / 1.4                                | `#191f28` / `text-base` / `font-semibold` / 1.4                       | 일치 ✓ (단, hardcoded hex — 토큰화 미정)                                                                                    |
| 안내 문구             | `#667080` / 13 Medium / ls 0.2522px                            | 동일                                                                  | 일치 ✓                                                                                                                      |
| 유저 말풍선 색·radius | `#f6f6f6` / radius 16                                          | `#f6f6f6` / `rounded-2xl`(16)                                         | 일치 ✓                                                                                                                      |
| 유저 말풍선 padding   | `px-16 py-12`                                                  | `px-4 py-3` (16/12)                                                   | 일치 ✓                                                                                                                      |
| 유저 말풍선 width     | `width 260 / max 260`                                          | `max-w-[260px]` (hug)                                                 | Figma는 고정 `260px`, 코드는 max만 — 짧은 메시지에서 폭 차이 가능 (**P3**)                                                  |
| **AI 답변 구조**      | **인트로+카드+마무리가 단일 버블 (`gap-20`)**                  | **단락마다 별도 버블로 분할**(`splitParagraphs`+타자기 단락 인터루드) | **가장 큰 갭.** Figma는 한 버블, 코드는 N버블. 카드는 마지막 버블에만 붙음 (**P1**)                                         |
| AI 버블 색            | `#f5f1ff`                                                      | `#f5f1ff`                                                             | 일치 ✓ (토큰 미바인딩 — `primary.50`=`#F1EAFF`와 다른 별도 값)                                                              |
| AI 버블 width         | `w-full` (컨테이너 310, fill)                                  | `w-[310px]` 고정                                                      | Figma는 컨테이너 안 fill, 코드는 고정 310px. 좁은 뷰포트(<350)에서 오버플로 위험 (**P2**)                                   |
| AI 버블 padding       | `px-16 pt-11.995 pb-12`                                        | `px-4 py-3` (상하 12/12)                                              | 상단 `11.995`≈12로 사실상 일치 ✓                                                                                            |
| AI 본문 텍스트 색     | `#242b37` (Content/Primary)                                    | `#242b37`                                                             | 일치 ✓                                                                                                                      |
| 카드 제목             | `#262626` Bold 14 / 1.4                                        | `#262626` `font-bold` 14 / 1.4                                        | 일치 ✓                                                                                                                      |
| 카드 본문             | `#4d4351` Regular 14 / 1.4                                     | `#4d4351` 14 / 1.4                                                    | 일치 ✓                                                                                                                      |
| 카드 간격             | 카드 컨테이너 `gap-16`, 카드 내부 `gap-4`                      | 카드 컨테이너 `gap-4`(16px), 카드 내부 `gap-1`(4px)                   | 일치 ✓                                                                                                                      |
| 카드 정렬             | `order` 없음(고정 순서)                                        | `card.order`로 정렬 후 렌더                                           | 코드가 서버 order 의존 — 디자인엔 영향 없음, OK                                                                             |
| 로딩 점               | `42×25`, 점 `6.193px`, 색 이미지(Ellipse)                      | `42×25` 영역, 점 `6.193px` `bg-[#a483ff]` `animate-pulse`             | 크기 일치 ✓. 색은 Figma 점이 이미지라 hex 미확정 → 코드는 `primary.300`(#a483ff) 추정. 애니메이션은 코드 자체 결정 (**P3**) |
| 퀵리플라이 색·shape   | `#f6f6f6` pill                                                 | `#f6f6f6` `rounded-full`                                              | 일치 ✓                                                                                                                      |
| 퀵리플라이 padding    | 01·03 `px-24 py-14` / 02 `px-20 py-12`                         | `px-6 py-3.5` (24/14)                                                 | 01·03과 일치 ✓ (Figma 02 상태는 자체 편차 — 무시 가능)                                                                      |
| 퀵리플라이 텍스트     | `#262626` Medium 14                                            | `#262626` `text-sm`(14) `font-medium`                                 | 일치 ✓                                                                                                                      |
| 퀵리플라이 라벨       | "떼스는 아이 관리 및 교육법" / "수면 조언" / "Morning Routine" | 동일 (`QUICK_REPLIES`)                                                | 일치 ✓ ("떼스는"은 Figma 오타로 보이나 그대로 유지됨)                                                                       |
| 입력바 배경·radius    | `#ffffff` / radius 48                                          | `bg-white` / `rounded-[48px]`                                         | 일치 ✓                                                                                                                      |
| 입력바 padding        | `px-20 py-14`                                                  | `px-5 py-3.5` (20/14)                                                 | 일치 ✓                                                                                                                      |
| 입력바 그림자         | `0 4 24 rgba(0,0,0,0.04)` ×2                                   | 동일 2겹                                                              | 일치 ✓ (DESIGN.md `shadow.2`와는 다른 커스텀 값)                                                                            |
| placeholder           | `#9d9d9d` Regular 14                                           | `#9d9d9d` `text-sm`                                                   | 일치 ✓                                                                                                                      |
| 전송 버튼             | `24×24` 원, `#000000`, 화살표 20.571 흰색                      | `size-6` `bg-black` `ArrowUp size-5` 흰색                             | 일치 ✓. 단 DESIGN.md "`#000000` 직접 사용 금지" 규칙과 충돌 (Figma는 `color/gray/900`=#000) (**P3**)                        |
| 전송 버튼 disabled    | (디자인 미정의)                                                | `disabled:bg-[#c4c4c4]`(gray.300)                                     | 코드 자체 보강 — OK                                                                                                         |
| 빈 상태 마스코트      | `120×120` sprite, 동일 offset                                  | `size-30` sprite, 동일 offset                                         | 일치 ✓                                                                                                                      |
| 빈 상태 간격          | `gap-36`, 본문 `flex-1 justify-center`                         | `gap-9`(36) `h-full justify-center`                                   | 일치 ✓ (마스코트가 화면 중앙. Figma도 동일하게 세로 중앙)                                                                   |
| 빈 상태 문구          | `#262626` Bold 18 / 2줄                                        | `text-lg`(18) `font-bold` `#262626` / `<br/>` 2줄                     | 일치 ✓                                                                                                                      |
| 안내 문구 토큰        | `Content/Secondary` 등 변수 바인딩                             | hardcoded hex 다수                                                    | DESIGN.md "하드코딩 hex 금지"와 충돌 — 토큰/CSS 변수화 필요 (**P2**)                                                        |
| 에러 배너             | 디자인 없음                                                    | `#fff1f2` 배경 / `#ec003f` 텍스트 (error.50/600)                      | 코드 자체 추가 — 디자인 정의 필요 (**P3**)                                                                                  |
| "이전 대화 더보기"    | 디자인 없음                                                    | `#f6f6f6` pill / `#555555` 텍스트                                     | 코드 자체 추가(윈도잉) — 디자인 정의 필요 (**P3**)                                                                          |

---

## 4. 액션 아이템 (우선순위)

### P1 — 디자인 의도와 구조가 어긋남 (반드시 결정 필요)

1. **AI 답변 말풍선 분할 정책 확정.** Figma는 인트로·카드·마무리를 **단일 버블**에 담는다. 현재 코드는 `splitParagraphs` + 타자기 단락 인터루드로 **단락마다 버블을 쪼갠다**.
   - 옵션 A(Figma 충실): 완료된 AI 메시지는 단일 버블로 렌더. 타자기 단락 분할은 "스트리밍 중 연출"로만 두고, `onTurnComplete` 커밋 시 하나의 버블로 합치기.
   - 옵션 B(연출 우선): 현재 다중 버블 UX를 의도로 채택 → DESIGN.md/Figma에 멀티버블 패턴을 역으로 반영.
   - **결정 주체가 필요** (디자인 vs 제품 연출). 우선 디자이너와 합의.

### P2 — 시각/반응형 정확도

2. **AI 버블 폭을 고정 `w-[310px]` → fill/`max-w` 기반으로.** Figma는 컨테이너(310) 안 `w-full`. 좁은 WebView(<350px)에서 `310px` 고정은 좌우 패딩을 깨거나 가로 스크롤을 만든다. `max-w-[310px] w-full`(컨테이너 폭) 권장.
3. **하드코딩 hex → 토큰/CSS 변수화.** `#191f28`(헤더), `#f5f1ff`(AI 버블), `#4d4351`(카드 본문) 등은 현재 DESIGN.md 토큰에 없다. 토큰화 의논 후 Tailwind theme/CSS 변수로 승격 (DESIGN.md "하드코딩 hex 금지" 규칙 준수). 최소한 `chat-bubble-ai`, `chat-card-body` 같은 role 토큰 추가 검토.

### P3 — 미세 정합 / 디자인 보완

4. **유저 말풍선 폭**: Figma 고정 `260px` vs 코드 `max-w-[260px]`. 짧은 메시지 폭 차이 — 디자인 의도가 "항상 260" 인지 "hug" 인지 확인.
5. **로딩 점 색 확정**: Figma 점이 이미지 에셋이라 hex 불명. 코드는 `#a483ff`(primary.300) 사용 중. 디자이너에게 실제 색 확인 후 토큰 바인딩.
6. **전송 버튼 `bg-black`(#000000)**: Figma는 `color/gray/900`(=#000000)이지만 DESIGN.md는 "`#000000` 직접 사용 금지 → gray.800". 디자인이 진짜 순수 검정을 의도하는지 확인, 아니면 `gray.800`(#262626)로.
7. **코드 자체 추가 요소의 디자인 정의**: 에러 배너, "이전 대화 더보기" 칩 — Figma에 없음. 디자인 스펙을 Figma에 추가하거나 현재 스타일을 DESIGN.md에 명문화.
