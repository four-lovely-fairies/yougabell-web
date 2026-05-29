# 10분 미션 & 피드백 디자인 갭 — Figma ↔ 현재 구현

> Figma: node `2395:9758` "10분 미션 & 피드백" (fileKey `sKdG5GEBZPdMjFY9nYj5g0`)
> 하위 프레임:
>
> - `2470:5718` 미션 시작하기 - 2 (인트로) · `2658:5264` 미션 시작하기 - 3 (변형) · `2511:3128` 미션 출처 - 03
> - `2511:2620` 미션 타이머 - 4 (진행) · `2511:3207` 미션 타이머 - 6 (변형) · `2395:9967` 미션 타이머 - 멈추기 (일시정지)
> - `2395:10109` 미션 효과 - 04 · `2395:9759` 미션 피드백 -05 · `2395:9837` 피션 피드백 닫기 시 팝업 (닫기 확인 모달)
> - `2395:10071` 피드백 작성 완료 - 06 · `2395:12101` 미션 완료 이후 홈 - 07
>
> 현재 코드: `app/mission/page.tsx`(인트로), `app/mission/{timer,effect,feedback,done}/page.tsx`, `components/mission/mission-screens.tsx`
> 디자인 토큰 출처: `DESIGN.md`
>
> 작성일: 2026-05-29 · Figma MCP `get_design_context` + `get_variable_defs` + `get_screenshot`로 실측한 값 기준.
> Figma MCP 정상 동작 확인 (5개 핵심 화면 + 닫기 모달 컨텍스트/스크린샷/변수 추출 완료).

---

## 1. Figma 디자인 요약 (화면별 레이아웃 + 토큰)

모든 화면 공통:

```
Status Bar (iPhone, 47~48px)        ← WebView에선 OS가 그림 (구현 제외)
Sub LNB (헤더, 56px)                ← back(44) · 중앙 아동 라벨/제목 · 우측 액션(44)
─────────────────────────────────
[화면별 본문]
─────────────────────────────────
하단 버튼 (button, p20)              ← Primary CTA 52px
Home Indicator (21px)               ← WebView에선 OS가 그림 (구현 제외)
```

공통 토큰: 배경 `#fbfbfb` (효과/완료/인트로) 또는 `#ffffff` (피드백·모달), Primary `#9572ff`(=`button/button-primary`),
본문 `#262626`(`text/text-primary`), 보조 `#555`(`text/text-secondary`), 3차 `#7b7b7b`(`text/text-tertiary`),
플레이스홀더 `#9d9d9d`(`text/text-placeholder`). 한글 폰트 Pretendard. 배경 글로우 = `Ellipse 87` (보라 radial, 564×253, `left -100 / top 192`).

### 1.1 미션 시작하기 / 인트로 (`2470:5718`)

```
Sub LNB: back · "김유스 (만3세)" + arrow_drop_down(16) · 우측 calendar(opacity-0)
본문(중앙, gap 24, px20, top104~h589):
  일러스트 image594 (110×92)
  서브테마 "아이와 10분 가까워지기"   12px Medium #9572ff(text-brand)
  타이틀 "짝짜꿍 노래 게임"            24px SemiBold #262626 (Headline/Small)
  설명 3줄                            14px Regular #555 center
  메타 카드 (white, border #f4f4f4, radius 24px, px24 py20, row gap 16):
    [alarm]  시간      | 10분
    [folder] 카테고리  | 언어발달
    [guide]  출처      | CDC 2022  ›   ← 우측에 chevron(20)
    [flag_2] 목표      | #친숙얼굴인식 #사회적반응
하단:
  "출처 자세히 보기"  14px Medium #7b7b7b  ← CTA 위 보조 링크
  Button "미션 시작하기" 52px #9572ff radius16 흰글씨 16px Medium
```

메타 row 라벨에 **아이콘**(alarm/folder/developer_guide/flag_2, 20px) 동반. 출처 row는 값 우측에 **chevron(›)** = 탭 가능.

### 1.2 미션 타이머 (`2511:2620`, 일시정지 `2395:9967`)

```
Sub LNB: back · (우측 close opacity-0)
상단 DescriptionPanel (left18 top117 w353, #fbfbfb, radius24, shadow 0 4 23 rgba(0,0,0,0.05), px24 py20):
  "짝짜꿍 노래 게임"  18px Bold #262626   + "접기"(opacity-0)
  설명 본문           14px Regular #555
본문(중앙, gap 68):
  원형 타이머 273px (보라 진행 링 + 흰 노브)
  타이머 텍스트 "12:35" 52px  font-family "SUIT" Bold #262626
  버튼 영역 (gap 15):
    Pill 버튼 50px  bg #000(gray/900) radius999  [아이콘] "멈추기"/"다시 시작하기" 16px 흰글씨
    "조기완료"  16px Medium #7d8180
```

- 진행 시 라벨 "멈추기" + pause 아이콘 / 일시정지 시 "다시 시작하기" + play 아이콘 (스크린샷 `2395:9967` 확인).
- 타이머 숫자 폰트는 **SUIT Bold** (Pretendard 아님).

### 1.3 미션 효과 (`2395:10109`)

```
Sub LNB: back · (우측 close opacity-0)        ← 좌측만 노출
본문(중앙, gap 24, top104~h625):
  일러스트 image594 (110×92)
  타이틀 (gap 15):
    "아이와 “정서적 안정감”이 상승하셨습니다!"  20px Bold #262626 tracking -0.4 center  (강조어 따옴표 포함, 동일 색)
    "오늘 하루도 너무 수고하셨습니다!"          14px Regular #555 center
  효과 카드 (white, border #f4f4f4, radius24, px24 py20, gap8):
    "미션 효과"   12px Medium rgba(0,0,0,0.5)
    효과 본문      14px Regular #000(black) leading 1.4
하단: Button "다음" 52px #9572ff radius16
```

- 강조 텍스트 색은 본문과 **동일**(보라 강조 아님). 폰트 20px(28px 아님).
- 카드 배경 **white + 회색 보더**(보라 틴트 아님). "목표" 줄 **없음**.

### 1.4 미션 피드백 (`2395:9759`)

```
Sub LNB: back · "미션피드백"(16px SemiBold, 중앙) · close(24, 활성)
섹션 1 (p20, gap24): "오늘 진행한 미션에서\n아이의 반응은 어땠나요?" 18px Bold #262626
  + "향후 미션 생성과 주간 리포트 작성에 도움이 됩니다."  14px Medium #7b7b7b
  반응 이모지 5종 (gap 18, 각 52px col): 나빠요/별로에요/보통이에요/좋아요!/최고에요!  라벨 12px #7b7b7b
섹션 2 (p20, gap24): "미션을 마친 지금,\n엄마의 에너지 상태는 어떤가요?" 18px Bold
  슬라이더 (트랙 ~28px, w351) — 눈금 양끝 "0점" … "10점"
섹션 3 (p20, gap24): "오늘 미션은 얼마나 만족스러웠나요?" 18px Bold
  + "소중한 의견을 담아 더 만족스러운 다음 미션을 준비할게요."  14px Medium #7b7b7b
  만족도 이모지 5종 (gap 18): 아쉬워요/부족해요/보통이에요/만족해요/완벽해요!
섹션 4 (p20, gap16): "오늘 아이가 가장 많이 말한\n단어들을 적어주세요." 18px Bold
  textarea 126px (white, border #f2f2f2, radius20, p20) placeholder rgba(0,0,0,0.5)
하단: Button "미션 완료" 52px #9672ff radius16
```

- 화면 배경 **#ffffff**. 슬라이더 스케일 **0~10**(양끝 라벨 "0점"/"10점").
- 만족도 질문에 "**얼마나**" 포함. close 버튼 **활성**(탭 시 닫기 모달).

### 1.5 피션 피드백 닫기 시 팝업 (`2395:9837`)

피드백 화면 위에 뜨는 닫기 확인 모달. **현재 코드에 미구현.**

```
오버레이: rgba(0,0,0,0.4) 전체
모달 (w334, radius20, center, white):
  상단부 (pt24 px16 pb8, gap12):
    일러스트 image603 (83×75)
    타이틀 "잠시만요! 지금 아니면\n피드백 작성이 어려워요."  18px Bold #262626 center
    본문 "지금 작성하지 않으시면 정확한 분석 리포트를\n받아보실 수 없는데, 그래도 건너뛰시겠어요?" 14px Medium #7b7b7b center
  하단부 (pt16 px16 pb20, gap8):
    Button "피드백 작성하기"  48px #9572ff radius12 흰글씨 14px Medium  (모달 닫고 작성 유지)
    "건너뛰기"  12px Medium #9d9d9d center  (피드백 포기, 이탈)
```

### 1.6 피드백 작성 완료 (`2395:10071`)

```
Sub LNB: back만 (우측 액션 opacity-0)
본문(중앙, w275, gap24):
  일러스트 image594 (110×92)
  "피드백 작성이\n완료되었습니다."  20px Bold #262626 tracking -0.4 center
  "남겨주신 피드백은 / 주간 리포트에 반영될 예정입니다. / 오늘도 수고 많으셨습니다."  14px Regular #555 center
하단: Button "홈으로 가기" 52px #9572ff radius16
```

---

## 2. 현재 구현 요약

- 라우팅: `/mission`(인트로) → `/mission/timer` → `/mission/effect` → `/mission/feedback` → `/mission/done`. 각 page는 thin wrapper, 본체는 `components/mission/mission-screens.tsx`(`'use client'`)에 집약.
- 레이아웃 `app/mission/layout.tsx`: 인증 가드(`fetchServerMe` → `getAppRedirectPath`) + `max-w-[390px]` 컨테이너.
- 토큰은 전부 **인라인 hex**(`bg-[#fbfbfb]`, `text-[#9572ff]` 등) — DESIGN.md role 토큰/CSS 변수 미사용.
- 인트로: 일러스트+서브테마+타이틀+설명+메타 카드(시간/카테고리/출처). 상태 기반 CTA(`미션 시작하기`/`이어서 하기`/`미션 완료`). API 연동(`startMissionExecution`).
- 타이머: `TimerRing`(conic-gradient 273px + 노브), `formatTimer`(MM:SS), 멈추기/다시시작/조기완료, 0초 도달 시 자동 complete. 낙관적 업데이트.
- 효과: 일러스트 132×158 + 타이틀 28px(보라 강조) + 효과 카드(보라 틴트 `#f7f1ff`) + "목표" 줄. CTA "다음".
- 피드백: `FeedbackChoiceGroup`(이모지 5종, justify-between) ×2 + `EnergySlider`(1~10, 기본 1) + textarea. draft localStorage 영속(`persistMissionFeedbackDraft`). 헤더 close → `router.push('/')` 즉시 이탈. CTA "미션 완료".
- 완료: 배경 글로우 + 일러스트 92×110 + 타이틀 20px + 본문. 헤더에 아동 라벨/캘린더(주간 리포트) 버튼. CTA "홈으로 가기".

---

## 3. 갭 표

| 화면             | 요소                 | Figma                                                  | 현재                                            | 차이 / 액션                                                  |
| ---------------- | -------------------- | ------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| 공통             | 색상 토큰            | role 토큰/CSS 변수(`button/button-primary` 등)         | 인라인 hex 직접(`#9572ff` 등)                   | DESIGN.md "하드코딩 hex 금지" 위반. role 토큰 매핑 필요 (P3) |
| 공통             | Primary hex          | `#9572ff` (button-primary)                             | 인트로/완료 `#9572ff`, 효과/피드백 `#9672ff`    | hex **불일치**(`#9572ff` vs `#9672ff`) — 통일 (P2)           |
| 인트로           | 메타 row 아이콘      | 각 라벨 좌측 아이콘 alarm/folder/guide/flag_2 (20px)   | 아이콘 없이 라벨 텍스트만                       | 아이콘 추가 (P2)                                             |
| 인트로           | 메타 항목            | 시간·카테고리·**출처(›)**·**목표** 4행                 | 시간·카테고리·출처 3행                          | **목표 행 누락** + 출처 chevron/탭 누락 (P2)                 |
| 인트로           | 출처 자세히 보기     | CTA 위 보조 링크 "출처 자세히 보기" 14px #7b7b7b       | 없음                                            | 보조 링크 + 미션 출처 화면(`2511:3128`) 누락 (P2)            |
| 타이머           | 설명 패널            | 상단 DescriptionPanel(미션명+설명, radius24, shadow)   | 없음(타이머만 표시)                             | 상단 미션 설명 패널 추가 (P2)                                |
| 타이머           | 숫자 폰트            | `SUIT` Bold 52px                                       | `font-bold`(Pretendard 추정) 52px               | 폰트 패밀리 불일치 — SUIT 적용 검토 (P3)                     |
| 타이머           | 멈추기 pill 색       | bg `#000`(gray/900)                                    | bg `black`                                      | 일치(검정) — OK                                              |
| 효과             | 타이틀 카피/크기     | "…상승하셨**습니다**!" 20px, 강조 본문색               | "…상승하셨**어요**!" 28px, 강조 보라(`#9572ff`) | 카피·크기·강조색 **불일치** (P1)                             |
| 효과             | 부제                 | "오늘 하루도 너무 수고하셨습니다!" 14px #555           | 없음                                            | 부제 누락 (P2)                                               |
| 효과             | 효과 카드            | white + border #f4f4f4, radius24, 라벨 rgba(0,0,0,0.5) | 보라 틴트 `#f7f1ff`, radius28, 라벨 #9572ff     | 카드 배경/보더/색 **불일치** (P1)                            |
| 효과             | 목표 줄              | 없음                                                   | "목표: …" 조건부 표시                           | Figma에 없음 — 제거 검토 (P2)                                |
| 피드백           | 화면 배경            | `#ffffff`                                              | `#fbfbfb`                                       | 배경색 불일치 (P3)                                           |
| 피드백           | 에너지 슬라이더 범위 | **0~10** (양끝 "0점"/"10점")                           | **1~10** (기본 1, "1점"/"10점")                 | 범위·기본값·라벨 **불일치** (P1)                             |
| 피드백           | 만족도 질문 카피     | "오늘 미션은 **얼마나** 만족스러웠나요?"               | "오늘 미션은 만족스러웠나요?"                   | 카피 누락("얼마나") (P3)                                     |
| 피드백           | 이모지 정렬          | gap 18px (각 52px col)                                 | `justify-between`                               | 정렬 방식 차이(시각 유사) (P3)                               |
| 피드백           | 헤더 제목 굵기       | "미션피드백" 16px SemiBold                             | `text-lg`(18px) `font-semibold`                 | 크기 18→16 조정 (P3)                                         |
| 피드백           | close 동작           | **닫기 확인 모달** 표시                                | `router.push('/')` 즉시 이탈                    | **모달 미구현** — draft 유실 위험 (P1)                       |
| 피드백           | 닫기 모달            | `2395:9837` 전체 모달                                  | 없음                                            | **전체 누락** — 신규 구현 (P1)                               |
| 효과/피드백/완료 | CTA radius           | 16px                                                   | `rounded-2xl`(16px)                             | 일치 — OK                                                    |
| 완료             | 헤더 우측            | 캘린더 opacity-0 (비활성)                              | 캘린더 버튼 활성 → `/weekly-report`             | Figma는 back만 노출. 의도 확인 필요 (P3)                     |
| 완료             | 일러스트 크기        | 110×92                                                 | 92×110 (w/h 뒤바뀜)                             | **가로/세로 반전** — 92h×110w로 정정 (P2)                    |
| 효과             | 일러스트 크기        | 110×92                                                 | 132×158                                         | 크기 불일치 (P2)                                             |

---

## 4. 액션 아이템

### P1 — 기능/카피 정확성 (먼저)

1. **피드백 닫기 확인 모달 신규 구현** (`2395:9837`). close 탭 시 모달 오픈 → "피드백 작성하기"(닫기, draft 유지) / "건너뛰기"(이탈). 현재 즉시 `/`로 빠져 draft 유실. 오버레이 `rgba(0,0,0,0.4)`, 모달 w334 radius20, 일러스트 83×75, 버튼 48px radius12.
2. **에너지 슬라이더 0~10으로 수정**. 현재 1~10(기본 1). 범위·기본값·양끝 라벨("0점"/"10점")을 Figma에 맞춤. (`EnergySlider`, `MissionFeedbackDraft.parentEnergy` 기본값)
3. **효과 화면 카피/스타일 정정**. 타이틀 "상승하셨습니다!" 20px, 강조어 본문색 유지(보라 X). 효과 카드 white + border `#f4f4f4` radius24, 라벨 rgba(0,0,0,0.5) (현 보라 틴트 `#f7f1ff` 제거).

### P2 — 레이아웃/요소 보강

4. 인트로 메타 카드: **목표 행 추가**, 각 행 **아이콘**(20px) 추가, 출처 값에 chevron(탭).
5. 인트로 CTA 위 "**출처 자세히 보기**" 보조 링크 + 미션 출처 화면(`2511:3128`) 연결.
6. 타이머 **상단 설명 패널** 추가(미션명 + 설명, radius24, shadow `0 4 23 rgba(0,0,0,0.05)`).
7. 효과 화면 **부제** "오늘 하루도 너무 수고하셨습니다!" 추가, "목표" 줄 제거 검토.
8. 일러스트 크기 정정: 효과 132×158 → 검토, 완료 92×110 → **110w×92h**(가로/세로 반전 수정), Primary hex `#9672ff` → `#9572ff` 통일.

### P3 — 토큰/미세 정합

9. 인라인 hex → DESIGN.md role 토큰/CSS 변수로 치환(전 화면).
10. 피드백 화면 배경 `#fbfbfb` → `#ffffff`, 헤더 "미션피드백" 18→16px, 만족도 질문에 "얼마나" 추가.
11. 타이머 숫자 폰트 SUIT 적용 검토. 완료 화면 헤더 우측 캘린더 노출 의도(Figma는 비활성) 확인.
