# 디자인 갭 문서 — Figma ↔ 현재 구현

> Figma 파일: [Yougabell OS](https://www.figma.com/design/sKdG5GEBZPdMjFY9nYj5g0) (fileKey `sKdG5GEBZPdMjFY9nYj5g0`)
> 작성 기준일: 2026-05-29. 각 문서는 Figma MCP(`get_design_context`/`get_variable_defs`/`get_screenshot`) 실측값 기반.
> 목적: Phase 1(현황·갭 파악). Phase 2(화면별 워크트리 구현)의 입력 문서.

## 문서 인덱스

| 문서                                  | Figma node   | 현재 라우트                                        |
| ------------------------------------- | ------------ | -------------------------------------------------- |
| [공통](./00-common.md)                | 2046:3807 외 | `components/app/*`, `components/ui/*`, `DESIGN.md` |
| [홈](./home.md)                       | 2395:10623   | `app/(main)/page.tsx`                              |
| [로드맵](./roadmap.md)                | 2395:12600   | `app/(main)/roadmap`                               |
| [채팅](./chat.md)                     | 2395:12599   | `app/chat`                                         |
| [리포트](./report.md)                 | 2385:4957    | `app/(main)/weekly-report`                         |
| [설정](./settings.md)                 | 2395:8862    | `app/settings/*`                                   |
| [온보딩](./onboarding.md)             | 2388:4424    | `app/onboarding/*`                                 |
| [미션·피드백](./mission.md)           | 2395:9758    | `app/mission/*`                                    |
| [캐릭터 에셋](./assets-characters.md) | 2591:5261 외 | `public/` (mp\_ 2~9, 8종)                          |

## 교차 발견 — 전 화면 공통 이슈 (Phase 2에서 먼저 해결)

여러 화면에서 반복되는 시스템적 갭. 개별 화면보다 **공통 토큰·컴포넌트부터 정리**해야 중복 작업을 막는다.

1. **Primary 색 진실의 소스 충돌 (P1)** — `DESIGN.md`는 `primary.500 = #754AF6`, Figma Foundation은 `500 = #5A31F4`, 실제 버튼 fill은 `#9572FF`(≈primary.300). 홈·온보딩·미션·설정 전반에서 버튼 색이 화면마다 제각각. → 토큰 1개로 확정 후 전파.
2. **카드 radius 불일치 (P1)** — Figma 카드 다수가 **20px(xl)/24px**인데 코드는 `rounded-xl`=12px. 리포트·로드맵·설정·홈 공통.
3. **SUIT 폰트 미로드 (P1)** — 홈 월 헤딩·통계 숫자 등은 SUIT인데 코드는 Pretendard만. 폰트 자체가 안 들어와 있음.
4. **에러/필수표시 색 불일치 (P2)** — 코드 `#FF5050`(Figma 실측값) vs `DESIGN.md` `error.600 #EC003F`. 온보딩·설정 필수 `*` 색이 한 플로우 안에서도 갈림.
5. **공통 `<AppHeader>`(Sub LNB) 부재 (P2)** — 화면마다 헤더를 따로 구현. Figma는 back+가운데 타이틀+우측 액션 단일 패턴 → 공통 컴포넌트 신설 필요.
6. **하드코딩 hex 만연 (P2)** — `@theme`/globals에 타이포·spacing·shadow·`radius.full` 토큰이 없어 hex가 코드에 흩어짐.

## Figma 측 수정 요청 후보 (디자인 파일 오류로 의심)

- **로드맵 헤더 더미 텍스트** — 헤더 타이틀이 "주간 리포트"로 입력됨(의미상 발달/성장 로드맵). `roadmap.md` 참조.
- **Bottom Nav 라벨 표기 혼재** — 시안 내 "10분 놀이"/"성장 로드맵" vs 디자이너 스티키 "놀이"/"오늘 놀이". 라벨 확정 필요.

## 코드에만 있고 Figma엔 없는 것 (정리 대상)

- 설정 개발자 도구 섹션 + `ResetOnboardingModal` (프로덕션 전 제거).
- 온보딩 알림 권한 화면(허용/나중에) — Figma 대응 없음.
- 미션 피드백 **닫기 확인 모달은 반대로 코드에 없음**(Figma엔 있음) → draft 유실 위험. `mission.md` P1.

## Phase 2 권장 순서

1. 공통 토큰·`<AppHeader>`·Button/Input 정리 (`00-common.md`) — 선행 필수
2. 캐릭터 에셋 export + `lib/characters.ts` (`assets-characters.md`)
3. 화면별 워크트리 병렬 구현: 홈 → 로드맵 → 리포트 → 설정 → 온보딩 → 미션 → 채팅(이미 일부 반영)
