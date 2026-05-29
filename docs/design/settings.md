# 설정 디자인 갭 — Figma ↔ 현재 구현

> Figma: node `2395:8862` "설정" (fileKey `sKdG5GEBZPdMjFY9nYj5g0`)
> 하위 화면:
>
> - `2395:8863` 설정 - 01 (메인) · `2395:8988` 계정 탈퇴 모달 - 06
> - `2395:9126` 알림설정 -02 · `2395:9211` 알림설정 -02 (시간 sheet 변형) · `2395:9252` 시간 bottom sheet
> - `2395:9162` 관심사 수정 -03
> - `2395:9320` 본인 정보 수정 -04
> - `2395:9362` 아이 정보 입력 - 05 (목록) · `2395:9454` 아이 정보 입력 - 추가 · `2395:9398` 아이 정보 입력 - 수정
>
> 현재 코드: `app/settings/page.tsx`(메인), `app/settings/{notifications,interests,profile}/page.tsx`,
> `app/settings/children/{page,new/page,[id]/page}.tsx`, `app/settings/layout.tsx`
> 재사용 컴포넌트: `components/onboarding/{onboarding-header,interest-card,child-card,segmented-toggle,date-input,time-bottom-sheet}.tsx`, `components/ui/button.tsx`
> 디자인 토큰 출처: `DESIGN.md`
>
> 작성일: 2026-05-29 · Figma MCP `get_metadata` + `get_design_context` + `get_variable_defs` + `get_screenshot`로 실측한 값 기준.
> Figma MCP 정상 동작 확인 (메인/알림/관심사/본인정보/아이목록 화면 + 탈퇴 모달 컨텍스트·스크린샷·변수 추출 완료).

---

## 1. Figma 디자인 요약 (화면별 레이아웃 + 토큰)

공통 토큰 (variable defs 실측):

- Primary 액션 `#9572ff` (= `button/button-primary`) — **모든 CTA·토글·선택칩 보라**
- 본문 `#262626` (`text/text-primary`), 3차 `#7b7b7b` (`text/text-tertiary`), disabled `#c4c4c4` (`text/text-disabled`)
- divider `#e9e9e9` (`color/gray/100` = `border/primary`), surface alt `#f6f6f6` (`color/gray/50`)
- 선택 칩/세그먼트 ON = bg `#efe7ff` (`button/button-secondary`) + border `#b69cfe` (`border/secondary`)
- 폰트 Pretendard. radius: 카드/인풋 `16px`, 토글 알약 `999px`, 모달 상하 `20px`
- 화면 상단 Status Bar(47px) + 하단 Home Indicator(21px)는 **WebView에서 OS가 그림 → 구현 제외**

### 1.1 설정 메인 (`2395:8863`)

```
헤더 (h78 px20): [settings 24] "설정" 20px Bold #262626  ·············  [close_MD 44/24] 우측
본문 (px20 pt20 pb40, 섹션 gap 24):
  ── "설정" 16px Bold #262626 ──            (섹션 타이틀)
     [bell 24] 미션 알림            14m #262626  ›
               오늘의 제안을 놓치지 마세요  12r #7b7b7b
     divider #e9e9e9
     [flag 24] 관심사 수정          14m #262626  ›
               최대 3개 선택됨        12r #7b7b7b
       칩(pl40): #정서발달 #창의놀이 #수면교육  ← bg #efe7ff · 12m #7850ff · radius full
  ── "설정" 16px Bold ──                     (2번째 섹션도 타이틀 "설정")
     [user_01 24] 내 프로필 수정     14m  ›
     divider
     [smile 24] 아이 프로필 추가/수정  14m  ›
  ── "계정 및 구독" 16px Bold ──
     [user_remove 24] 계정 탈퇴      14m  ›
     divider
     [log_out 24] 로그아웃           14m  ›
  ── "기타" 16px Bold ──
     [note_edit 24] 개인정보 보호정책  14m  ›
     divider
     [notebook 24] 서비스 약관       14m  ›
```

- 메인 헤더 좌측 컨테이너 폭 고정 `182.5px`, close 버튼 hit area `44×44`.
- 미션알림/관심사 row는 `py16` (서브타이틀로 키 큼), 나머지 row는 `h60 py16`.
- chevron 색상 = chevron_right 에셋(짙은 회색, `#262626`에 가까움). 첫 두 섹션 타이틀이 **둘 다 "설정"** (Figma 실제 텍스트).
- **개발자 도구 섹션 없음** — Figma엔 임시 "회원 정보 초기화" 항목이 존재하지 않음.

### 1.2 알림 설정 (`2395:9126`, 시간 sheet `2395:9252`)

```
배경 전체 #f6f6f6 (gray-50)
Sub LNB (h56 px12): [arrow_back 44/24]      ← 좌측 back만, 타이틀 없음(투명)
타이틀 영역 (px20 py24): "알림 설정" 24px Bold #262626
섹션 "10분 놀이 알림" 16px Medium #262626   ← 그룹 라벨 16m (코드 14m 와 다름)
  카드 (bg #ffffff radius24 overflow-clip):
    알람 받기      14m #262626   [toggle 62×27 ON=#9572ff]
    divider(가로 324.5)
    알림 받을 시간  14m #262626   [time pill bg #e9e9e9(gray-100) 14px(px14 py6) "7:00 PM" 16m #262626]
섹션 "주간 리포트 알림" (pt28)
  카드: 알람받기 [toggle OFF=#d9d9d9(gray-200)] / 알림받을시간 [pill 7:00 PM]
하단 버튼 없음 (저장은 토글 즉시 PATCH)
```

- 카드형 그룹 (흰 카드 위 2 row + 내부 divider), 카드 외부 배경 `#f6f6f6`.
- 시간 표시는 **회색 알약(pill) `#e9e9e9` 배경** (코드는 흰 배경 pill). 폰트 16px.
- 토글 트랙 `62×27`, knob `37×23`, radius `13.5px`. ON=`#9572ff`, OFF=`#d9d9d9`.
- 시간 선택은 bottom sheet (`2395:9252`, top 428 = 화면 하단 시트).

### 1.3 관심사 수정 (`2395:9162`)

```
배경 #f6f6f6
Sub LNB (h56): [arrow_back]
타이틀(px20 py24): "관심사 수정" 24px Bold
  부제 "하단의 버튼을 눌러 변경 할 관심사를 / 다시 선택해주세요." 14r #7b7b7b
칩 그리드 (p20, gap12, 2열 wrap):
  [🤱🏻 워킹맘·대디] [🏠 가정보육·집놀이]
  [🗣️ 말문터지기]   [👥 사회성·또래관계] ← 선택됨: bg #efe7ff border #b69cfe
  [⚡️ 신체발달·에너지발산] [📖 똑똑한인지학습]
  칩: h44 radius16 pl12 pr16 gap6, 미선택 bg #ffffff border #e9e9e9, 14r #262626
하단 버튼: "변경 완료" 52px(p16) #9572ff radius16 16m 흰글씨
```

- 칩 라벨/이모지가 코드 `INTEREST_LABEL`/`INTEREST_EMOJI`와 **정확히 일치** (워킹맘·대디 등).
- 칩 radius **16px** (코드 `rounded-2xl`=16, 일치). 선택 스타일 bg/border 일치.

### 1.4 본인 정보 수정 (`2395:9320`)

```
배경 #fdfdfe (gray-20)
Sub LNB (h56 px12): [arrow_back]              ← back만 (close 아님)
타이틀(px20 py24): "본인 정보 수정" 24px Bold   ← 한 줄
폼 (p20 gap16):
  이름*           input h48 radius16 border #e9e9e9, 값 "김유스" 14r, 우측 [cancel 20]
  생년월일*       input h48, 값 "2026.05.13" 14r, 우측 [chevron(아래) 20]
  성별*           [여자] [남자(선택 bg #efe7ff border #b69cfe)]  세그먼트 h48 radius16
  직장 유무*      [일을 하고 있어요(선택)] [전업 가정인이에요]    h48 radius16
하단 버튼: "다음" 52px #9572ff radius16 16m   ← 라벨 "다음"
```

- 필수 표시 `*` = `#ff5050` (`color/error/600` 별칭, 코드와 일치).
- 라벨 12px Medium #262626, 라벨↔인풋 gap8.
- 하단 CTA 라벨이 Figma에서는 **"다음"** (코드는 "수정 완료").

### 1.5 아이 정보 — 목록 (`2395:9362`) / 추가·수정 (`2395:9454`, `2395:9398`)

```
[목록 05]
배경 #fdfdfe · Sub LNB [arrow_back]
타이틀(px20 py24): "아이 정보를 / 입력해 주세요" 24px Bold (2줄)
리스트 (p20 gap16, h510 고정):
  자녀 row: bg #f6f6f6 border #e9e9e9 radius16 h55 px16
    "여아  김유스 (1999.01.01)"  (성별 14 SemiBold + 이름/날짜 14r)  · 우측 [edit 20][trash 20]
  자녀 추가 버튼: border-dashed 1.358px #b69cfe radius16 h52, [+ 20] "자녀 추가" 14m #7850ff
하단 버튼: "다음" 52px #9572ff radius16

[추가/수정]
타이틀 "아이 정보를 입력해 주세요" (추가) / "수정할 아이 정보를 입력해 주세요" (수정)
ChildCardForm: 이름/생년월일/성별/특이사항. 하단 버튼 "저장"(추가)·"수정 완료"(수정).
```

### 1.6 계정 탈퇴 모달 (`2395:8988`)

```
배경: 설정 메인 위 dim #00000033 (rgba 0,0,0,0.2)
모달 (w334, 중앙, radius 20px 상하):
  상단부 (pt24 px16 pb8, gap12):
    마스코트 일러스트 (83×75)
    "계정을 탈퇴하시겠어요?" 18px Bold #262626(=content/inverse black) center
    설명 3줄 14m #7b7b7b center
  하단부 (pt16 px16 pb20, gap8):
    [취소하기] Button h48 radius12 bg #9572ff 흰글씨 14m   ← Primary
    "계정 탈퇴하기" 12m #c4c4c4(text-disabled) center        ← 텍스트 링크(약하게)
```

- 모달 radius **20px**(상하), 내부 버튼 radius **12px**. 마스코트 = intro sprite.
- 위험 액션("계정 탈퇴하기")이 약한 텍스트(`#c4c4c4`), 안전 액션("취소하기")이 강조 버튼.

---

## 2. 현재 구현 요약 (라우트별)

| 라우트                    | 파일                     | 요지                                                                                                                           |
| ------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `/settings`               | `page.tsx`               | 4 섹션 + **[임시] 개발자 도구**(회원 정보 초기화) 섹션. 헤더 settings+"설정"+close. 탈퇴/초기화 모달 inline.                   |
| `/settings/notifications` | `notifications/page.tsx` | `OnboardingHeader back`, 카드형 2섹션. 그룹 라벨 14m. 시간 pill **흰 배경**. 토글 인라인 컴포넌트(#9572ff ON / gray-300 OFF).  |
| `/settings/interests`     | `interests/page.tsx`     | `OnboardingHeader back`, 타이틀 "관심사 수정"+부제. `InterestCard` 칩 6개. CTA "변경 완료".                                    |
| `/settings/profile`       | `profile/page.tsx`       | `OnboardingHeader back`, 타이틀 "본인 정보 수정". `Input`/`DateInput`/`SegmentedToggle`. CTA **"수정 완료"**.                  |
| `/settings/children`      | `children/page.tsx`      | `OnboardingHeader back`, 타이틀 "아이 정보를 입력해 주세요". `ChildRow` 목록 + 자녀추가 dashed. CTA "다음". 삭제 confirm 모달. |
| `/settings/children/new`  | `children/new/page.tsx`  | `ChildCardForm` 단일. CTA "저장".                                                                                              |
| `/settings/children/[id]` | `children/[id]/page.tsx` | hydrate 후 `ChildCardForm`. CTA "수정 완료".                                                                                   |

배경: `layout.tsx`가 `bg-[#fdfdfe]`로 전 화면 고정 (알림/관심사 Figma는 `#f6f6f6` 의도).

---

## 3. 갭 표

| 화면         | 요소             | Figma                                                          | 현재                                                      | 차이 / 액션                                                                 |
| ------------ | ---------------- | -------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------- |
| 공통(layout) | 화면 배경        | 알림·관심사 `#f6f6f6`, 본인정보·아이 `#fdfdfe`, 메인 `#ffffff` | 전 화면 `#fdfdfe` 고정                                    | **P2** 알림/관심사 배경을 `#f6f6f6`로. 카드형 대비 필요.                    |
| 공통(헤더)   | 서브 화면 헤더   | Figma는 `Sub LNB` h56 px12, back 44/24 (arrow_back)            | `OnboardingHeader` h56, `IconButton`+`ArrowLeftIcon`      | 거의 동등(높이 56). 아이콘 에셋만 확인.                                     |
| 메인         | divider 색       | `#e9e9e9` (gray-100/border-primary)                            | `bg-gray-100` (`#E9E9E9`)                                 | 일치.                                                                       |
| 메인         | chevron 색       | chevron_right 에셋(짙은 회색≈`#262626`)                        | `text-gray-400` (`#9D9D9D`)                               | **P2** chevron이 디자인보다 연함 → `gray-700`/`gray-800` 검토.              |
| 메인         | 관심사 row 서브  | "최대 3개 선택됨" (고정 카피)                                  | "{n}개 선택됨" (동적)                                     | **P3** 카피 차이(의도적 동적이면 유지). 칩 색은 일치(`#efe7ff`/`#7850ff`).  |
| 메인         | 개발자 도구 섹션 | 없음                                                           | "[임시] 개발자 도구 / 회원 정보 초기화" 섹션 존재         | **P1(운영전)** 운영 노출 전 제거 필요(코드 주석에도 명시).                  |
| 메인         | 섹션 타이틀      | 1·2번째 모두 "설정"                                            | 동일("설정","설정")                                       | 일치(Figma도 중복).                                                         |
| 알림         | 그룹 라벨 폰트   | 16px Medium `#262626`                                          | `text-sm`(14) `text-gray-700`                             | **P2** 16px Medium #262626로.                                               |
| 알림         | 시간 pill        | bg `#e9e9e9`(gray-100), 16px                                   | bg `bg-white`, `text-xs`(12)                              | **P2** pill 배경 회색 + 폰트 키우기(16).                                    |
| 알림         | 카드 radius      | `24px`                                                         | `rounded-2xl`(16)                                         | **P2** Figma 카드 radius 24px (코드 16).                                    |
| 알림         | 토글 OFF 색      | `#d9d9d9` (gray-200)                                           | `bg-gray-300`(`#C4C4C4`)                                  | **P3** OFF 트랙 색 `gray-200`로. ON `#9572ff` 일치.                         |
| 알림         | 토글 치수        | 트랙 62×27, knob 37×23                                         | `w-12 h-7`(48×28), knob 24                                | **P3** 트랙 가로 짧음(48 vs 62), knob 형태 다름(원형 vs 알약).              |
| 관심사       | 칩 라벨/이모지   | 워킹맘·대디 등 6종                                             | `INTEREST_LABEL`/`EMOJI` 동일                             | 일치.                                                                       |
| 관심사       | 칩 선택 스타일   | bg `#efe7ff` border `#b69cfe`                                  | 동일                                                      | 일치.                                                                       |
| 관심사       | 부제 카피        | "하단의 버튼을 눌러 변경 할 관심사를 다시 선택해주세요."       | "하단의 버튼을 눌러 변경 후 관심사를 다시 선택해주세요."  | **P3** "변경 할" vs "변경 후" 미세 차이.                                    |
| 본인정보     | CTA 라벨         | "다음"                                                         | "수정 완료"                                               | **P3** 라벨 불일치(수정 플로우엔 "수정 완료"가 자연스러움 — 디자인 확인).   |
| 본인정보     | 필수 `*` 색      | `#ff5050`                                                      | `#ff5050`                                                 | 일치.                                                                       |
| 본인정보     | 세그먼트 선택    | bg `#efe7ff` border `#b69cfe`                                  | `SegmentedToggle`(확인 필요)                              | 토큰 일치 가정, 실측 권장.                                                  |
| 본인정보     | 인풋 radius      | `16px` (border `#e9e9e9`)                                      | `Input` 컴포넌트(확인 필요)                               | 16px 여부 확인.                                                             |
| 아이목록     | row 스타일       | bg `#f6f6f6` border `#e9e9e9` radius16 h55                     | `bg-gray-50 border-gray-100 rounded-2xl h-[55px]`         | 일치.                                                                       |
| 아이목록     | 자녀추가 dashed  | border 1.358px `#b69cfe` radius16 h52, 텍스트 `#7850ff`        | border-dashed `#dab2ff` h13(52) 텍스트 `#9349f4`          | **P2** 점선 색 `#dab2ff` vs Figma `#b69cfe`, 텍스트 `#9349f4` vs `#7850ff`. |
| 아이목록     | 타이틀           | "아이 정보를 / 입력해 주세요"                                  | 동일(2줄)                                                 | 일치.                                                                       |
| 탈퇴모달     | 위험 액션 위계   | 취소=강조버튼 #9572ff, 탈퇴=약한 텍스트 #c4c4c4                | 취소=`Button`(primary), 탈퇴=회색 텍스트(`text-gray-500`) | **P2** 탈퇴 텍스트 색 `#c4c4c4`로(현재 gray-500=#7B7B7B로 더 진함).         |
| 탈퇴모달     | 모달 radius      | 상하 `20px`, 버튼 `12px`                                       | `rounded-xl`(12), 버튼 `size="full"`(rounded-2xl=16)      | **P2** 모달 radius 20px, 내부 버튼 12px로 조정.                             |
| 탈퇴모달     | 마스코트         | 83×75 sprite                                                   | intro sprite crop(82×67)                                  | 거의 일치(크롭 비율 확인).                                                  |
| 탈퇴모달     | 제목 크기        | 18px Bold                                                      | `text-lg`(18) Bold                                        | 일치.                                                                       |
| 초기화모달   | 존재             | 없음                                                           | inline `ResetOnboardingModal`                             | **P1(운영전)** 개발용 — 운영 제거 대상.                                     |

---

## 4. 액션 아이템

### P1 (운영 노출 전 필수)

1. **메인 "[임시] 개발자 도구" 섹션 제거** (`app/settings/page.tsx:142-149`) — 코드 주석에도 "운영 노출 전 제거" 명시. `ResetOnboardingModal`도 함께 정리.

### P2 (디자인 정합 — 눈에 띄는 차이)

2. **알림 화면 시각 보정** (`notifications/page.tsx`):
   - 화면 배경 `#f6f6f6`, 카드 radius `24px`.
   - 그룹 라벨 16px Medium `#262626`.
   - 시간 pill 배경 `#e9e9e9` + 폰트 16px (현재 흰 배경 12px).
3. **메인 chevron 색 진하게** (`page.tsx` Row의 `text-gray-400` → `gray-700`/`gray-800`).
4. **자녀 추가 dashed 색 보정** (`children/page.tsx`): 점선 `#b69cfe`, 텍스트 `#7850ff`로 (현재 `#dab2ff`/`#9349f4`).
5. **탈퇴 모달 정합** (`page.tsx` `DeleteAccountModal`): 모달 radius `20px`, 버튼 radius `12px`, "계정 탈퇴하기" 텍스트 `#c4c4c4`.
6. **알림/관심사 배경** `#f6f6f6` 적용 — `layout.tsx` 단일 배경 대신 화면별 배경 분기 검토.

### P3 (미세 — 카피/치수)

7. 알림 토글 OFF `#d9d9d9`(gray-200), 트랙 치수 62×27·knob 알약형 검토.
8. 본인정보 CTA 라벨 "다음"↔"수정 완료" 디자인팀 확인 (수정 플로우 의미상 "수정 완료" 합리적).
9. 관심사 부제 "변경 할"/"변경 후", 메인 관심사 서브 "최대 3개 선택됨"/"{n}개 선택됨" 카피 확정.
10. 세그먼트·인풋 radius/선택 토큰 실측 재확인 (`SegmentedToggle`, `Input` — 본 문서는 토큰 일치 가정).

---

> 참고: Status Bar(47px)·Home Indicator(21px)는 Figma 목업 요소로, WebView에선 OS가 그리므로 구현 대상 아님.
> 메인 헤더 좌측 폭 `182.5px`, close hit area `44×44`는 코드와 일치.
