# 온보딩 디자인 갭 — Figma ↔ 현재 구현

> Figma: node `2388:4424` "온보딩 과정 (첫 로그인)" (fileKey `sKdG5GEBZPdMjFY9nYj5g0`)
> 하위 화면(상단 frame · 390×844 기준): `2146:4252`(온보딩-01 인트로), `2146:4307`(프로필 정보 입력-02), `2146:4348`(프로필 정보 입력-03, 날짜 휠 노출), `2146:4467`(관심 주제-04), `2146:4530`(알림 시간대 선택-05) / `2146:4703`(알림 시간대 선택-Selected) / `2146:4582`(알림-직접 입력), `2146:4912`(자녀 정보-06 입력 폼) / `2146:4959`(자녀 정보-Selected) / `2146:5015`(자녀 정보-07 행 표시), `2146:5045`(자녀정보-삭제 모달), `2146:4786`(서비스 동의-08), `2146:4771`(로딩중-09). bottom sheet: `2146:4401`(동의), `2146:4635`(날짜 휠), `2146:4857`(동의 시트 본문).
> 현재 코드: `app/onboarding/*`, `components/onboarding/*`
> 디자인 토큰 출처: `DESIGN.md`
>
> 작성일: 2026-05-29 · Figma MCP `get_design_context`(2146:4252 / 4307 / 4467 / 4703 / 4857) + `get_screenshot`(2146:4348 / 4401 / 4635 / 4912 / 5015) + `get_variable_defs`(2388:4424)로 실측한 값 기준.

---

## 0. Figma vs 코드 라우트 매핑

| Figma 화면               | 코드 라우트                                                    | 비고                                                              |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| 온보딩-01 (인트로)       | `app/onboarding/intro/page.tsx`                                | OAuth 로그인 (Google / Apple)                                     |
| 서비스 동의-08           | `(protected)/consent/page.tsx` (bottom sheet)                  | **순서 불일치** — 아래 §3 참고                                    |
| 프로필 정보 입력-02/03   | `(protected)/parent/page.tsx`                                  | 03은 날짜 휠 bottom sheet open 상태                               |
| 관심 주제-04             | `(protected)/interest/page.tsx`                                | Figma는 06(자녀)→07 흐름 위치가 코드와 다름                       |
| 알림 시간대 선택-05      | `(protected)/notification/page.tsx` **+** `app-usage/page.tsx` | 코드는 권한요청(notification)과 시간대선택(app-usage)로 **2분할** |
| 자녀 정보-06/07/Selected | `(protected)/children/page.tsx`                                | `child-card.tsx`                                                  |
| 자녀정보-삭제 모달       | `children/page.tsx` 내 `DeleteConfirm`                         | `2146:5045`                                                       |
| 로딩중-09                | `(protected)/done/page.tsx`                                    | API 제출 + 로딩                                                   |

> **코드 흐름**: intro → consent → parent → interest → notification(권한) → [granted] app-usage(시간대) → children → done. **Figma 화면 번호 순서**: 01 → 02/03 → 04 → 05 → 06/07 → 08(동의) → 09(로딩). 번호상 동의(08)가 뒤에 있으나, 코드는 동의를 intro 직후(02 앞)에 배치. 자녀(06/07)도 Figma는 04~05 뒤이고 코드도 마지막 입력 단계라 일치.

---

## 1. Figma 디자인 요약 (단계별)

전 화면 공통: 폭 **390px**, 좌우 마진 **20px**(`space-system/9`), 본문 카드 영역 패딩 20px. 상단 StatusBar(47px)·하단 Home Indicator(21px)는 WebView에서 OS가 그림 → **구현 제외**. 헤더(Sub LNB)는 h56, px12, 좌측 `arrow_back`(24px, 44×44 탭타깃).

토큰 실측(`get_variable_defs`):

| 의미             | Figma 변수                                     | 값          | DESIGN.md 토큰                        |
| ---------------- | ---------------------------------------------- | ----------- | ------------------------------------- |
| 액션 버튼        | `button/button-primary`                        | `#9572ff`   | ⚠️ `primary.500`=`#754AF6`와 다름     |
| 버튼 비활성      | `button/button-disabled`                       | `#d4c4fe`   | ⚠️ `primary.100`=`#D9CBFE`와 다름     |
| 선택 배경        | `button/button-secondary` / `color/primary/50` | `#efe7ff`   | DESIGN엔 없음 (primary.50=`#F1EAFF`)  |
| 선택 보더        | `border/secondary`                             | `#b69cfe`   | DESIGN엔 없음                         |
| 브랜드 텍스트    | `text/text-brand`                              | `#9572ff`   | —                                     |
| 일반 보더        | `border/primary`                               | `#e9e9e9`   | `gray.100`                            |
| 본문 텍스트      | `text/text-primary`                            | `#262626`   | `gray.800` ✓                          |
| 보조 텍스트      | `text/text-tertiary`                           | `#7b7b7b`   | `gray.500` ✓                          |
| placeholder      | `text/text-placeholder`                        | `#9d9d9d`   | `gray.400` ✓ (DESIGN 매핑은 disabled) |
| 에러(필수\*)     | `color/error/600`                              | `#ff5050`   | ⚠️ `error.600`=`#EC003F`와 다름       |
| 화면 배경        | `background/background-secondary`              | `#fdfdfe`   | `gray.20`                             |
| radius l/xl      | `radius-system/l` / `xl`                       | `16` / `20` | `radius.l` / `radius.xl` ✓            |
| 인풋/카드 radius | `color/number/8`                               | `16`        | (대부분 16px 사용)                    |

> ⚠️ **핵심**: Figma 온보딩은 액션/포인트 색으로 `#9572ff`·`#b69cfe`·`#efe7ff`·`#ff5050`를 쓰는데, `DESIGN.md`의 primary/error 토큰과 **hex가 다름**. 코드는 이를 인지하고 일부 컴포넌트에서 하드코딩 hex로 Figma 값을 따름(메모리 규칙 "디자인은 Figma 우선"과 일치). 단 일관성은 부족 (§3 참조).

### 1.1 온보딩-01 인트로 (`2146:4252`)

- 배경: 흰색 + 좌상단/중앙 보라 ellipse 2개 (`#efe7ff` 계열 blur). 좌상단 ellipse는 `rotate -5.78deg`.
- 카피(중앙, 상단에서 gap40): 제목 `Pretendard Bold 24px #262626` "워킹맘의 하루를 / 더 의미있게" (line-height 1.4), 부제 `Pretendard Medium 14px #7b7b7b` "바쁜 일상 속에서도 / 아이와의 소중한 순간을 놓치지 마세요". 제목 블록 `pt 80px`(`color/number/20`).
- 일러스트: 보라 문어 마스코트, `152×124px`(=`image 598`), 카피 아래 중앙.
- 하단 버튼 영역(p20, gap12):
  - Google: 흰 배경, 보더 `#e9e9e9` 1px, radius 12px, h52. 좌 아이콘(24) + 중앙 "Google로 계속하기" `Pretendard Medium 16px #262626` + 우측 더미 24px(텍스트 중앙정렬용).
  - Apple: 검정 배경(`#000`, `backdrop-blur 6.75px`), radius 12px, h52, 흰 텍스트, 좌 애플 아이콘.

### 1.2 프로필 정보 입력-02 (`2146:4307`)

- 헤더: arrow_back. 타이틀 `Bold 24px #080c14`("프로필 정보를 / 입력해 주세요"), 타이틀 영역 px20 py24.
- 폼(p20, 필드 간 gap16, 화면 h510 고정):
  - 라벨: `Pretendard Medium 12px #262626` + 필수 `*` `Bold 12px #ff5050` (gap2).
  - 이름 인풋: 흰 배경, 보더 `#e9e9e9`, radius 16px, h48, px16 py12, placeholder `Regular 14px #9d9d9d` "이름을 입력해 주세요.".
  - 생년월일: 동일 인풋 + 우측 `chevron`(20px) "생년월일을 입력해 주세요.".
  - 성별: 2-segment(여자/남자), 각 `flex-1 h48` radius16 보더 `#e9e9e9` 흰배경, 텍스트 `Regular 14px #262626`.
  - 직장 유무: 2-segment(일을 하고 있어요 / 전업 가정인이에요).
- 하단 버튼(p20): "다음" 비활성 상태 = `#d4c4fe` 배경, 흰 텍스트 `Medium 16px`, radius 16px, p16.

### 1.3 프로필 정보 입력-03 = 날짜 휠 bottom sheet (`2146:4348` / `2146:4635`)

- 02 위에 날짜 선택 bottom sheet open. 시트: 흰 배경, 상단 radius 큰 곡률, 헤더 "생년월일을 선택하세요" `Bold 18px` + 우측 X(20px).
- 3-컬럼 휠(년/월/일): 중앙 선택값 `Bold #262626`, 위아래 항목 흐려짐(회색 그라데이션). 중앙 selection band 회색(`gray.50`). 선택 행 예: "1998년 / 10월 / 24일".
- 하단 "확인" 버튼: `#9572ff` 풀폭.

### 1.4 관심 주제-04 (`2146:4467`)

- 헤더: arrow_back. 타이틀 `Bold 24px #262626`("어떤 주제에 / 관심 있으신가요?") + 부제 `Regular 14px #7b7b7b` "최근 관심사를 선택해주세요 (최대 3개)".
- 칩(flex-wrap, gap12, 화면 h482): 각 칩 h44, `pl12 pr16 py12`, radius16, gap6. 미선택=흰 배경+보더 `#e9e9e9`; 선택="사회성·또래관계"가 선택 상태 → 배경 `#efe7ff` + 보더 `#b69cfe`. 이모지(20px box) + 라벨 `Regular 14px #262626`.
- 6개: 🤱🏻 워킹맘·대디 / 🏠 가정보육·집놀이 / 🗣️ 말문터지기 / 👥 사회성·또래관계 / ⚡️ 신체발달·에너지발산 / 📖 똑똑한인지학습.
- 하단 "다음" 비활성 `#d4c4fe`.

### 1.5 알림 시간대 선택-05 (`2146:4530` / Selected `2146:4703` / 직접입력 `2146:4582`)

- **헤더: arrow_back은 `opacity-0`(숨김), 우측 상단 X(close, 24px)만 노출.** → 뒤로가기 없이 닫기만.
- 타이틀 `Bold 24px #262626`("알림을 받고싶으신 / 시간대를 선택해 주세요") + 부제 `Regular 14px #7b7b7b` "주간 리포트, 하루 10분 놀이 등 / 육아에 필요한 정보 알림만 보내드려요.".
- 슬롯 리스트(p20, gap12, 화면 h462): 각 슬롯 h61, `pl12 pr16 py12`, radius16. 이모지(28px box) + 라벨`Medium 14px`/부가`Regular 12px #7b7b7b`.
  - 🌅 오전 (08:00-09:00) / ☀️ 오후 (12:00-13:00) / 🌙 저녁 (18:00-20:00) / 🌃 밤 (22:00 이후) / 🌞 직접 입력 (시간대를 직접 입력합니다.)
  - **Selected 상태(오전 선택)**: 선택 슬롯 배경 `#efe7ff` + 보더 `#b69cfe`. 바로 아래 시간 칩 4개(07:30/08:00/08:30/09:00) 노출 — 각 칩 `flex-1 h44` radius**14px** 흰배경 보더 `#e9e9e9`.
- 직접 입력 선택 시 시간 휠 bottom sheet(`2146:4582`): "시간대를 선택해 주세요" + 시/분/AM·PM 3-컬럼 휠 + "확인".
- 하단 "알림 설정완료" 활성 `#9572ff`.

### 1.6 자녀 정보-06 입력 폼 (`2146:4912`) / 07 행 (`2146:5015`) / 삭제 모달 (`2146:5045`)

- 화면 높이 **858px**(다른 화면 844보다 큼 — 폼 길이 반영).
- 타이틀 `Bold 24px`("아이 정보를 / 입력해 주세요").
- **06 입력 폼 카드**: radius16, 흰 배경, 옅은 보더, p20, gap16. 헤더 "자녀1" `SemiBold 14px`. 필드: 이름(placeholder "아이의 이름을 입력해 주세요.") / 생년월일(휠) / 성별(여아·남아 2-segment, **선택 텍스트 brand 색 `#6d3aff`**) / 특이사항(textarea, placeholder "식품 알레르기, 질병, 복용 중인 약 등").
- **자녀 추가 버튼**: dashed 보더 `~1.358px` 보라 `#b69cfe`, radius16, h52, 텍스트 `#9572ff` "＋ 자녀 추가".
- **07 저장된 행(`ChildRow`)**: h55, radius16, 배경 `gray.50`(`#f6f6f6`) + 보더 `#e9e9e9`. "여아 김유스 (1999.01.01)" + 우측 연필(편집)·휴지통(삭제) 아이콘 20px. 하단 "다음" 활성 `#9572ff`.
- **삭제 모달(`2146:5045`)**: 중앙 정렬, w334, radius20, 마스코트(82×67) + "자녀 정보를 삭제하시겠습니까?" + 하단 [취소][삭제하기] 2버튼.

### 1.7 서비스 동의-08 bottom sheet (`2146:4786` / `2146:4401` / `2146:4857`)

- bottom sheet 형태(h~416). 상단 radius 큰 곡률. 헤더에 "서비스를 이용을 위해 동의가 필요해요"는 시트 본문 frame(2146:4857) 캡처엔 안 보이나 코드에 존재.
- 전체동의 행: 배경 `gray/100`=`#f8f9fb`, radius16, p16, 체크박스(20) + "약관 전체동의" `Medium 14px` + "선택 동의 포함" `Medium 12px #646870`.
- 개별 3행(p16): 체크(20) + 라벨 `Medium 14px #262626` + 우측 chevron(24, 자세히 보기). "서비스 이용약관 동의 (필수)" / "개인정보 처리방침 (필수)" / "마케팅 수신동의 (선택)".
- 하단 "다음" 버튼 `#9572ff`, h52, radius16, p20.

### 1.8 로딩중-09 (`2146:4771`)

- 배경 보라 ellipse 2개 + 중앙 정렬 텍스트 + 로딩 점(Group 33924, 4개 점 wave). 코드 `done/page.tsx`의 `LoadingScreen`/`LoadingDots`와 대응.

---

## 2. 현재 구현 요약

| 라우트/컴포넌트                                                                                   | 역할                                                                          |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `app/onboarding/page.tsx`                                                                         | `/onboarding/intro`로 redirect                                                |
| `app/onboarding/layout.tsx`                                                                       | 모바일 frame(`max-w-98`≈392, px20), `bg-[#ddd2df]` 바깥, safe-area inset 처리 |
| `intro/page.tsx`                                                                                  | OAuth(Google/Apple) + native bridge + "이어서 작성" 드래프트 복구 분기        |
| `(protected)/consent/page.tsx`                                                                    | `ConsentBottomSheet` 컨테이너 → 확인 시 parent로                              |
| `(protected)/parent/page.tsx`                                                                     | 이름/생년월일/성별/직장유무 폼 (`Field` 로컬 컴포넌트)                        |
| `(protected)/interest/page.tsx`                                                                   | 관심사 6개 칩 (최대 3), `InterestCard`                                        |
| `(protected)/notification/page.tsx`                                                               | **알림 권한 요청** 화면 (허용하기 / 나중에) — Figma엔 대응 화면 없음          |
| `(protected)/app-usage/page.tsx`                                                                  | **시간대 선택** 화면(05에 대응), `NotificationSlotPicker`, 헤더 close(X)      |
| `(protected)/children/page.tsx`                                                                   | 자녀 카드 추가/편집/삭제, `DeleteConfirm` 모달                                |
| `(protected)/done/page.tsx`                                                                       | `completeOnboarding` API 제출 + 로딩/성공/에러/타임아웃 상태                  |
| `components/onboarding/onboarding-header.tsx`                                                     | back/close/none variant 헤더(h56)                                             |
| `components/onboarding/child-card.tsx`                                                            | `ChildCardForm`(편집 폼) + `ChildRow`(저장 행)                                |
| `components/onboarding/interest-card.tsx`                                                         | 관심사 칩 (selected/disabled)                                                 |
| `components/onboarding/consent-bottom-sheet.tsx`                                                  | 동의 시트 (전체동의 + 3항목)                                                  |
| `components/onboarding/segmented-toggle.tsx`                                                      | 2-segment 토글 (default/brand tone, allowDeselect)                            |
| `components/onboarding/date-input.tsx` + `date-bottom-sheet.tsx` + `date-wheel.tsx` + `wheel.tsx` | 날짜 휠 picker                                                                |
| `components/onboarding/time-bottom-sheet.tsx`                                                     | 시간 휠 picker (시/분5분/AM·PM)                                               |
| `components/onboarding/notification-slot-picker.tsx`                                              | 슬롯 5개 + 시간 칩 + 직접입력 휠                                              |

구현 특이점:

- 슬롯 메타(`lib/types.ts` `NOTIFICATION_SLOT_META`)는 Figma와 **정확히 일치**(라벨/부가/이모지/오전 칩 07:30·08:00·08:30·09:00).
- 코드는 알림을 **권한요청 + 시간대선택 2화면**으로 쪼갬. Figma는 05 한 화면(시간대). 권한요청 화면은 신규(WebView OS 권한 흐름).
- 다수 컴포넌트가 Figma hex를 **하드코딩**(`#9572ff` 대신 `bg-primary-500` 미사용; `#b69cfe`·`#efe7ff`·`#ff5050` 등). 토큰화 안 됨.

---

## 3. 갭 표

| 단계      | 요소                 | Figma                                   | 현재                                                                                                   | 차이 / 액션                                                                                                                           |
| --------- | -------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 전역      | 액션 버튼 색         | `#9572ff` (`button-primary`)            | 컴포넌트별 혼재: `Button` 기본은 `primary-500`(`#754AF6`), slot-picker/consent 등은 하드코딩 `#9572ff` | `Button`이 `#9572ff`를 안 쓰면 색 불일치. **토큰 정리 필요** — `primary.500`을 `#9572ff`로 재정의하거나 별도 `action` 토큰 신설. (P1) |
| 전역      | 비활성 버튼 색       | `#d4c4fe` (`button-disabled`)           | `Button` disabled 스타일 확인 필요(코드 직접 미확인)                                                   | `#d4c4fe`로 통일 검토. (P2)                                                                                                           |
| 전역      | 필수 `*` 색          | `#ff5050` (`error/600`)                 | `parent`는 `text-error-600`(=DESIGN `#EC003F`), `child-card`는 하드코딩 `#ff5050`                      | 동일 화면 흐름인데 빨강 hex가 다름. **`error.600` 토큰을 `#ff5050`으로 맞추거나** child-card를 토큰화. (P1)                           |
| 전역      | 선택 배경/보더       | bg `#efe7ff` / border `#b69cfe`         | 하드코딩 `#efe7ff`·`#b69cfe`(interest/slot/segmented 일관)                                             | 시각 일치 OK, 단 **토큰 부재**. `primary.50`(`#F1EAFF`)과 다른 `#efe7ff` → DESIGN.md에 토큰 추가. (P2)                                |
| 전역      | 화면 배경            | `#fdfdfe`(`bg-secondary`)               | layout `bg-white` + 바깥 `#ddd2df`                                                                     | 본문은 흰색이라 거의 동일. Figma `#fdfdfe`(아주 옅은 회백). 무시 가능. (P3)                                                           |
| 전역      | 인풋/카드 radius     | 16px                                    | 인풋 `rounded-lg`(8px, `date-input`), 카드/segment `rounded-2xl`(16px)                                 | **`date-input` 버튼은 8px** → Figma 16px와 불일치. segmented/interest는 16px OK. (P2)                                                 |
| 흐름      | 동의 단계 위치       | 08(번호상 후반)                         | intro 직후(parent 앞)                                                                                  | 코드가 동의를 앞으로. 제품 결정이면 OK. Figma 번호와 순서만 다름. (P3, 확인)                                                          |
| 흐름      | 알림 권한 화면       | 없음                                    | `notification/page.tsx` 신규                                                                           | WebView OS 권한 흐름. Figma에 디자인 없음 → **디자인 보강 필요** 또는 권한은 native가 처리. (P2)                                      |
| 흐름      | 시간대 화면 진입     | 항상 노출(05)                           | 권한 granted일 때만 `app-usage`                                                                        | denied 시 시간대 skip. Figma엔 분기 없음. 제품 결정 확인. (P2)                                                                        |
| 01 인트로 | 일러스트             | `image 598` 152×124 보라 문어           | `/onboarding/intro.png` crop(좌-145.57%/상-16.11%, 381% 스케일)                                        | 같은 스프라이트에서 crop. 위치/크기 미세 차이 가능. 시각 확인. (P3)                                                                   |
| 01 인트로 | 버튼 radius          | 12px                                    | `rounded-[12px]` ✓                                                                                     | 일치. (—)                                                                                                                             |
| 01 인트로 | 제목 letter-spacing  | `Title/Large` ls 0                      | `tracking` 미지정(인트로) / 타 화면 `-0.2px`                                                           | Figma 인트로 제목은 ls 0. 코드 인트로도 ls 없음 ✓. 단 parent/interest 등은 코드가 `-0.2px` 추가(Figma는 0). (P3)                      |
| 02 프로필 | 라벨 크기            | `Medium 12px`                           | `text-xs`(12px) ✓                                                                                      | 일치. (—)                                                                                                                             |
| 02 프로필 | 인풋 placeholder     | "이름을 입력해 주세요."                 | "이름을 입력하세요"                                                                                    | **문구 다름**(주세요 누락). 통일. (P2)                                                                                                |
| 02 프로필 | 인풋 높이            | h48                                     | `Input` 높이 확인 필요                                                                                 | Figma 48px. 확인. (P3)                                                                                                                |
| 03 날짜휠 | 시트 헤더            | "생년월일을 선택하세요"                 | 동일(`title` 기본값) ✓                                                                                 | 일치. (—)                                                                                                                             |
| 03 날짜휠 | 선택 band            | `gray.50` 회색 band                     | `bg-gray-50` band ✓                                                                                    | 일치. (—)                                                                                                                             |
| 04 관심   | 부제 문구            | "최근 관심사를 선택해주세요 (최대 3개)" | 동일(MAX_SELECT 보간) ✓                                                                                | 일치. (—)                                                                                                                             |
| 04 관심   | 칩 레이아웃          | flex-wrap 2열 느낌, gap12               | `flex-wrap gap-3`(12px) ✓                                                                              | 일치. (—)                                                                                                                             |
| 04 관심   | 칩 radius            | 16px                                    | `rounded-2xl`(16px) ✓                                                                                  | 일치. (—)                                                                                                                             |
| 04 관심   | 칩 height            | h44                                     | `h-11`(44px) ✓                                                                                         | 일치. (—)                                                                                                                             |
| 05 알림   | 헤더                 | arrow_back opacity-0 + 우측 X           | `app-usage`는 `variant="close"`(X만) ✓                                                                 | 일치. (—)                                                                                                                             |
| 05 알림   | 슬롯 height          | h61                                     | `h-[61px]` ✓                                                                                           | 일치. (—)                                                                                                                             |
| 05 알림   | 시간 칩 radius       | **14px**                                | `rounded-[14px]` ✓                                                                                     | 일치. (—)                                                                                                                             |
| 05 알림   | 슬롯/칩 메타         | 5슬롯 + 칩 시간                         | `NOTIFICATION_SLOT_META` 정확 일치 ✓                                                                   | 일치. (—)                                                                                                                             |
| 06 자녀   | 성별 선택 텍스트     | brand `#6d3aff`                         | `segmented-toggle` brand tone `#6d3aff` ✓                                                              | 일치. (—)                                                                                                                             |
| 06 자녀   | 입력 카드 보더       | 옅은 보더(`#f2f1f0` 추정)               | `border-[#f2f1f0]` ✓                                                                                   | 일치(코드 주석 명시). (—)                                                                                                             |
| 06 자녀   | 특이사항 placeholder | "식품 알레르기, 질병, 복용 중인 약 등"  | 동일 ✓                                                                                                 | 일치. (—)                                                                                                                             |
| 07 자녀행 | 행 배경/높이         | `gray.50` + 보더, h55                   | `bg-gray-50 border-gray-100 h-[55px]` ✓                                                                | 일치(주석 `2146:5015`). (—)                                                                                                           |
| 07 자녀행 | 자녀 추가 버튼       | dashed 보라 1.358px radius16            | `border-[1.358px] border-dashed border-[#b69cfe]` ✓                                                    | 일치. (—)                                                                                                                             |
| 삭제 모달 | 레이아웃             | w334 radius20 마스코트+2버튼            | `max-w-[334px] rounded-[20px]` + intro.png ✓                                                           | 일치. 단 마스코트가 intro.png 재사용(전용 에셋 아님). (P3)                                                                            |
| 08 동의   | 전체동의 배경        | `#f8f9fb`(`gray/100`)                   | `bg-[#f8f9fb]` ✓                                                                                       | 일치. (—)                                                                                                                             |
| 08 동의   | 체크 표현            | 체크박스(채워짐/빈) 20px                | 자체 SVG `CheckMark`(filled→`gray.800`, active→`#9572ff`)                                              | Figma는 이미지 체크. 코드 SVG로 근사. 시각 미세 차이. (P3)                                                                            |
| 08 동의   | 항목 우측            | chevron(자세히 보기)                    | `ChevronRight` + TODO(약관 본문)                                                                       | UI는 있으나 **링크 미구현**(placeholder). (P2, 콘텐츠)                                                                                |
| 09 로딩   | 로딩 점              | Group 33924 4점 wave                    | `LoadingDots` 4점 opacity 그라데이션 + pulse                                                           | 근사 구현. animationDelay로 wave. (P3)                                                                                                |
| 09 로딩   | 배경 ellipse         | 보라 2개                                | `bg-primary-200/60` / `bg-primary-100/70` blur                                                         | `primary` 토큰 사용 → Figma `#efe7ff` 계열과 hue 다를 수 있음. 시각 확인. (P3)                                                        |

---

## 4. 액션 아이템

### P1 (색 토큰 정합성 — 디자인 일관성 직결)

1. **액션 색 통일**: Figma `button-primary=#9572ff`. 현재 `Button` 기본(`primary-500=#754AF6`)과 slot/consent의 하드코딩 `#9572ff`가 공존 → 같은 "확인/다음" 버튼이 화면마다 보라 톤이 다를 위험. `DESIGN.md`에서 온보딩 액션 토큰을 `#9572ff`로 확정하고 `Button`·하드코딩을 한 소스로 수렴.
2. **에러(필수 `*`) 색 통일**: `parent`는 `error-600`(`#EC003F`), `child-card`는 `#ff5050`. Figma는 `#ff5050`. `error.600` 토큰을 `#ff5050`으로 맞추거나 두 곳 모두 동일 토큰 사용.

### P2 (개별 화면 정확도 · 흐름)

3. **선택 상태 토큰화**: `#efe7ff`(선택 배경)·`#b69cfe`(선택 보더)를 `DESIGN.md`에 토큰으로 추가(interest/slot/segmented가 모두 하드코딩 중). `primary.50`(`#F1EAFF`)과 hex가 다름에 유의.
4. **`date-input` radius**: 8px(`rounded-lg`) → Figma 16px로 수정.
5. **인풋 placeholder 문구**: parent 이름 "이름을 입력하세요" → Figma "이름을 입력해 주세요."로 통일.
6. **알림 권한 화면 디자인 부재**: `notification/page.tsx`(허용/나중에)는 Figma에 대응 디자인 없음. 디자인 보강 의뢰 또는 native 권한 위임으로 화면 제거 검토.
7. **약관 본문 링크**: 동의 시트 chevron 클릭 시 약관 화면 이동 미구현(`TODO`). 콘텐츠/라우트 정의 필요.
8. **시간대 skip 분기 확인**: 권한 denied 시 시간대 화면 skip → 제품 의도인지 확정(Figma엔 분기 없음).

### P3 (미세 · 확인)

9. 제목 letter-spacing: Figma `Title/Large` ls 0인데 코드 일부 화면 `-0.2px` 추가 → 통일 검토.
10. 화면 배경 `#fdfdfe` vs 흰색, 로딩 ellipse hue, 동의 체크 SVG vs 이미지, 삭제 모달 마스코트 전용 에셋, 인트로 일러스트 crop 위치 — 실기기 시각 확인.
11. 동의 단계 순서(코드: intro 직후 / Figma: 08) 제품 결정 문서화.

---

> **요약**: 레이아웃·치수·문구는 대부분 일치(특히 자녀·관심·알림 슬롯은 Figma와 정밀 일치). 최대 리스크는 **색 토큰 불일치**(액션 `#9572ff`, 에러 `#ff5050`, 선택 `#efe7ff`/`#b69cfe`가 `DESIGN.md` primary/error 토큰과 hex가 다르고 코드 내 하드코딩/토큰 혼용). 흐름 차이는 동의 위치 + 알림 권한 화면 신설 2건.
