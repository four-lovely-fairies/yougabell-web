# 공통 컴포넌트 카탈로그 — 화면 갭 통합

> 9개 화면 갭 문서([README](./README.md))를 교차 검토해, **여러 화면에 반복되는 UI를 공통 컴포넌트로 통합**한 목록.
> 목적: Phase 2 구현 시 화면마다 따로 만들지 않고 **하나의 컴포넌트로 합쳐** 일관성·유지보수성 확보.
> 토큰(특히 primary 색)은 [00-common.md](./00-common.md) §3 P1 확정이 **선행**돼야 한다 — 아래 스펙의 hex는 Figma 실측값.

---

## 0. 출현 매트릭스 (어느 화면에서 쓰이나)

| 공통 컴포넌트                   | 홈  | 로드맵 | 채팅 | 리포트 | 설정 | 온보딩 | 미션 | 현재 코드                            |
| ------------------------------- | --- | ------ | ---- | ------ | ---- | ------ | ---- | ------------------------------------ |
| `AppHeader` (Sub LNB)           | ●   | ●      | ●    | ●      | ●    | ●      | ●    | `onboarding-header`만(전용)          |
| `BottomNav`                     | ●   | ●      |      | ●      | ●    |        |      | `components/app/bottom-nav.tsx`      |
| `Button`                        | ●   | ●      | ●    | ●      | ●    | ●      | ●    | `components/ui/button.tsx`           |
| `TextField`(Input)              |     |        | ●    |        | ●    | ●      | ●    | `components/ui/input.tsx`            |
| `Card` (정보 카드 컨테이너)     | ●   | ●      | ●    | ●      | ●    | ●      | ●    | 없음(화면마다 인라인)                |
| `SectionInfoCard` ("현재 상황") | ●   | ●      |      |        |      |        |      | 인라인 ×2 (home/roadmap 중복)        |
| `SectionHeading` (아이콘+제목)  | ●   | ●      |      | ●      | ●    |        | ●    | 인라인                               |
| `Chip`                          | ●   | ●      | ●    | ●      | ●    | ●      |      | 인라인(변종마다 제각각)              |
| `StatCard` (통계 2칸)           | ●   |        |      | ●      |      |        |      | 인라인 ×2 (home/report 중복)         |
| `Modal` (다이얼로그)            | ●   |        |      |        | ●    | ●      | ●    | 없음(`consent-bottom-sheet`만 유사)  |
| `BottomSheet`                   |     |        |      |        | ●    | ●      | ●?   | date/time/consent-bottom-sheet (3종) |
| `FeelingPicker` (감정 캐릭터)   | ●   |        |      | ●      |      |        | ●    | 인라인(mood/reaction 따로)           |
| `ProgressGauge` (게이지 바)     |     |        |      | ●      |      |        | ●?   | 인라인                               |
| `MascotImage` (캐릭터)          | ●   |        | ●    | ●      |      |        | ●    | sprite crop (chat만)                 |

> ● = 사용, ●? = 유사 패턴 추정. "현재 코드"가 **인라인/중복**인 항목이 1차 통합 대상.

---

## 1. 우선순위 — 합칠 가치 순

### 🥇 P1 — 중복이 명확하고 즉시 통합 이득

#### 1.1 `AppHeader` (Sub LNB) — 전 7화면

전 화면이 같은 헤더(56px, back/타이틀/우측액션)를 **각자 인라인**으로 구현. 로드맵·리포트는 타이틀 텍스트까지 더미("주간 리포트")로 들어간 상태.

- **신설**: `components/app/app-header.tsx`
- props: `variant?: "back" | "dashboard"`, `title?`, `onBack?`, `right?: ReactNode`, `left?`(dashboard 자녀셀렉터)
- 스펙: h56, bg white, back 변형 `px-16`·중앙 타이틀(Pretendard SemiBold 16 `#191f28`)·우측 44×44 액션 슬롯 / dashboard 변형 `px-20`·좌측 자녀 드롭다운·우측 설정+알림
- 흡수 대상: `onboarding-header.tsx` → 이 컴포넌트의 한 케이스
- 상단 `safe-area-inset-top` 가드 함께 처리

#### 1.2 `Card` — 정보 카드 컨테이너 (홈·로드맵·리포트 등)

홈·로드맵·리포트의 모든 카드가 **흰 배경 + radius 20~24 + padding 24 + shadow1 + 내부 gap**으로 동일한데, 현재 코드는 화면마다 `#f6f6f6`/radius 16/무그림자 등 제각각.

- **신설**: `components/ui/card.tsx`
- props: `padding?`(기본 24), `radius?`(기본 20 — 토큰 `xl`), `className`
- 스펙: bg `#ffffff`, radius **20px(리포트)~24px(홈/로드맵)** — Figma는 카드 종류별로 20/24 혼재 → 기본 20, 큰 카드 24 옵션. shadow1(`0 1px 2px rgba(0,0,0,0.05)` + `0 0 2px …`)
- ⚠️ **현재 공통 문제**: 코드 카드들이 `rounded-xl(12)` + 무그림자 → radius/shadow 정합이 전 화면 공통 갭(00-common P1 #2)

#### 1.3 `SectionInfoCard` ("현재 상황 [ 단계 ]") — 홈·로드맵 **완전 동일**

홈(`2395:10789`)·로드맵(`2516:5380`) 모두 `kid_star` 20px + "현재 상황 [ 자아 형성기 ]" Bold 12 + 본문 Medium 14 `#555`. 두 곳에 따로 구현돼 있음.

- **신설**: `components/home/section-info-card.tsx` (또는 공용 위치)
- props: `icon?`(기본 kid_star), `label`, `body`, `extra?`(로드맵의 "4개월 차" 제목 행)
- `Card` 위에 얹는 조합 컴포넌트

#### 1.4 `Chip` — 거의 전 화면, **변종 통합이 핵심**

칩이 화면마다 다른 모양으로 흩어져 있으나, 크게 **3 variant**로 수렴한다.

| variant    | 모양                                                  | 쓰이는 곳                                                 | Figma 스펙                                                                   |
| ---------- | ----------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `label`    | `rounded-full`, gray bg, 텍스트만                     | 홈(오늘의 놀이 라벨), 채팅 퀵리플라이, 설정/온보딩 관심사 | bg `#f6f6f6`, `px-10 py-5`, Medium 12 `#262626`                              |
| `category` | **사각 radius 12**, 색 15% 알파 + inset glow + 아이콘 | **로드맵 카테고리 = 리포트 키워드**                       | `radius 12`, bg `rgba(색,0.15)`, `inset 0 0 10px rgba(색,0.1)`, 아이콘 14~20 |
| `tab`      | 사각 radius 12 pill, 활성/비활성                      | 로드맵 월령 탭                                            | 비활성 흰bg+border `#e9e9e9` / 활성 솔리드 `#9572ff` 또는 파스텔 `#efe7ff`   |

- **신설**: `components/ui/chip.tsx` — `variant`, `color?`(category용), `icon?`, `active?`(tab용)
- ⚠️ **로드맵 카테고리 ↔ 리포트 키워드는 거의 같은 컴포넌트**(둘 다 15% 알파 + inset + 아이콘) — 반드시 하나로. 단 현재 코드는 둘 다 솔리드/불투명이라 갭.

#### 1.5 `StatCard` — 통계 2칸 (홈 ↔ 리포트 거의 동일)

홈("지난주 놀이 수행시간 1시간17분" / "긍정률 92%")과 리포트("누적 미션 수행시간" / "긍정률")가 **같은 레이아웃**: 흰 카드 + 라벨(Medium 12 tertiary) + 큰 숫자(**SUIT ExtraBold** 22~32) + 단위/%. 긍정률은 보라 불꽃 아이콘까지 동일.

- **신설**: `components/ui/stat-card.tsx`
- props: `label`, `value`, `unit?`, `icon?`(긍정률 불꽃)
- ⚠️ 숫자가 **SUIT** 폰트 — 00-common P1 #3(SUIT 미로드)와 묶어서 처리

### 🥈 P2 — 통합 이득 있으나 변종/상태 설계 필요

#### 2.1 `Modal` (다이얼로그) — 홈·설정·온보딩·미션

설정 탈퇴 모달, 온보딩 자녀 삭제 모달, 미션 닫기 확인 팝업(현재 코드에 **없음** → draft 유실), 홈 등에서 반복.

- **신설**: `components/ui/modal.tsx` — overlay + 중앙 카드(radius **20**), `title`, `body`, `actions`(주/보조 버튼)
- 미션 닫기 확인 모달은 이 컴포넌트로 신설(mission.md P1)

#### 2.2 `BottomSheet` — 온보딩·설정 (이미 3종 존재)

`date-bottom-sheet`·`time-bottom-sheet`·`consent-bottom-sheet`가 따로 있음 → **공통 base 추출**.

- **신설**: `components/ui/bottom-sheet.tsx` (overlay + 하단 시트 + 핸들 + radius-top 20)
- 기존 3종을 이 base 위에 재구성

#### 2.3 `SectionHeading` — 아이콘 + 제목 (홈·로드맵·리포트·미션·설정)

"발달 지표"·"나는 잘하고 있는가?"·"이번주 요약" 등 섹션 제목 패턴. (아이콘 동반/미동반 혼재)

- **신설**: `components/ui/section-heading.tsx` — `icon?`, `title`, `trailing?`(info 버튼 등), size(18 Bold 기본)

#### 2.4 `FeelingPicker` / 감정 캐릭터 — 홈·미션·리포트

홈 기분 뱃지, 미션 반응 5종(나빠요~좋아요), 리포트 표정 — 같은 **감정 캐릭터 세트**(`public/icons/figma/mission-feedback/*.svg`)를 공유.

- **신설**: `components/ui/feeling-picker.tsx`(선택형) + `feeling-face.tsx`(표시형)
- assets-characters.md의 감정 캐릭터 5종 매핑 사용

### 🥉 P3 — 이미 컴포넌트 존재, 정합만

- `Button` — 존재. lg 높이 56→52, 폰트 SemiBold→Medium, 패딩 정합(00-common §2.3)
- `TextField` — 존재. 에러 메시지 슬롯·disabled·error 색 토큰화(00-common §2.4)
- `BottomNav` — 존재. 아이콘 24px 통일, 라벨 워딩("놀이"/"로드맵") 정합(00-common §2.2)
- `ProgressGauge` (게이지 바) — 리포트 심리 에너지. 미션 에너지 입력과 공유 가능성 → 구현 시 확인
- `MascotImage` — assets-characters.md 참조. sprite → 개별 PNG/컴포넌트화

---

## 2. 화면 전용 (공통화 대상 아님)

중복이 없어 각 화면에 두는 게 맞는 것: 홈 **요일 캘린더 스트립**(`WeekStrip`), 로드맵 **tooltip**, 채팅 **말풍선/타자기**(이미 `hooks/use-chat-typewriter`), 리포트 **미션 현황 요일 트래커**·**베스트 모먼트 캐러셀**, 미션 **타이머**. (단 tooltip·게이지는 후속 재사용 가능성 있어 위치만 메모.)

---

## 3. Phase 2 구현 순서 (이 카탈로그 기준)

1. **토큰 확정** (00-common P1) — primary 팔레트(`#9572ff` 기준), radius.full/spacing/shadow/타이포 `@theme` 등록, SUIT 폰트 로드, error 색 일원화. → 모든 공통 컴포넌트의 전제.
2. **원자 컴포넌트**: `Card` → `Chip` → `SectionHeading` → `StatCard` → `AppHeader` 정비/신설.
3. **조합·오버레이**: `SectionInfoCard`, `Modal`, `BottomSheet`(기존 3종 재구성), `FeelingPicker`.
4. **기존 정합**: `Button`/`TextField`/`BottomNav` 치수·워딩 수정.
5. 각 화면을 공통 컴포넌트로 치환(화면별 워크트리 병렬).

> 1번(토큰)은 **디자이너 확인 필요 항목**(primary 기본색 = `#9572ff`인지) 포함 — 확정 전엔 컴포넌트 hex가 흔들리므로 먼저 합의.
