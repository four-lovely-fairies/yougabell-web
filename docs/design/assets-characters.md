# 캐릭터/마스코트 에셋 갭 — Figma ↔ 현재

> Figma: 2591:5261 / 5267 / 5268 / 5269 / 5270 / 5271 / 5272 / 5273 (mp\_ (2) 2~9, 각 275×275 rounded-rectangle 이미지) — fileKey `sKdG5GEBZPdMjFY9nYj5g0`
>
> Figma MCP 연결 **정상 동작 확인** (get_metadata · get_screenshot 모두 응답). 본 문서는 에셋 식별·매핑·계획만 다루며, 실제 export(다운로드)는 후속 단계에서 진행한다.

---

## 결론 요약

- **mp\_(2)2~9 = 홈 캐릭터 8종.** 동일한 "보라색 솜뭉치/문어형 마스코트" 캐릭터 세트로, 홈 섹션의 `home-character`(`2539:5255`) 안 8개 심볼과 외형이 1:1로 일치한다.
- **"Feeling Character Reference"(`2539:5279`)는 별개 세트.** 파랑/노랑/초록/분홍 둥근 얼굴 이모지 5종(기분 5단계)으로, mp\_(2) 캐릭터와 **무관**하다. 이 5종은 이미 코드에 `public/icons/figma/mission-feedback/*.svg`(very-bad/bad/neutral/good/very-good)로 구현되어 있다.
- 따라서 mp\_(2)2~9는 **감정 캐릭터가 아니라 홈/마스코트 캐릭터**로 분류한다. 용도는 빈 상태 일러스트, 미션/리포트 일러스트, (확장 시) 캐릭터 컬렉션 등.

---

## 1. 에셋 목록 (8종)

각 노드는 275×275 둥근 사각형 이미지. 설명은 get_screenshot(maxDimension 256) 결과를 시각 확인한 내용. 모두 동일한 **연보라(#B8A6F5 계열) 솜뭉치/문어형 마스코트**이며 굵은 진보라 외곽선, 단순한 점눈/미소가 공통이다.

| node        | 이름       | 설명(외형)                                                                              | 추정 용도                            | export URL / curl                                                                              |
| ----------- | ---------- | --------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `2591:5261` | mp\_ (2) 2 | 안경 쓰고 책을 펼쳐 읽으며 앉아 있는 포즈. 차분/집중 표정                               | 학습·정보 읽기 일러스트 (콘텐츠/팁)  | `curl -o mp-02.png "https://www.figma.com/api/mcp/asset/4a4543ed-f0b0-4a26-8678-9e7cfbf02c27"` |
| `2591:5267` | mp\_ (2) 3 | 눈 감고 작은 흰색 친구를 두 팔로 끌어안는 포옹 포즈. 따뜻/애정 표정                     | 정서·위로·마음케어(공감) 일러스트    | `curl -o mp-03.png "https://www.figma.com/api/mcp/asset/e1940f3e-8b76-41e2-b69c-1f3c26cd041b"` |
| `2591:5268` | mp\_ (2) 4 | 큰 두 눈, 턱을 괴고 갸웃하는 포즈에 머리 위 물음표(?) 2개. 궁금/고민 표정               | Q&A·검색·"궁금한 점" 빈 상태(챗봇)   | `curl -o mp-04.png "https://www.figma.com/api/mcp/asset/89a92340-942d-4f26-8f53-9ef59befc9a9"` |
| `2591:5269` | mp\_ (2) 5 | 가시/뾰족한 실루엣으로 팔다리 휘저으며 달리는 듯한 역동 포즈. 활발/분주 표정            | 미션 진행·활동·놀이 일러스트         | `curl -o mp-05.png "https://www.figma.com/api/mcp/asset/bf266c7f-9520-4ebf-a4ce-9a93c9ac7aae"` |
| `2591:5270` | mp\_ (2) 6 | 머리 위 연필을 얹고 두 팔 벌린 채 클립보드를 든 정면 포즈. 진지/준비 표정               | 기록·작성·리포트 입력 일러스트       | `curl -o mp-06.png "https://www.figma.com/api/mcp/asset/106e4c11-6f32-41ff-827c-48f1a6901ad0"` |
| `2591:5271` | mp\_ (2) 7 | 윙크하며 머리 위로 클립보드를 들어 올리고 한 발 든 경쾌한 포즈(김 모락). 신남/완료 표정 | 기록 완료·제출 성공 피드백 일러스트  | `curl -o mp-07.png "https://www.figma.com/api/mcp/asset/aeec336f-6d16-424b-86cf-bc40fe4c7764"` |
| `2591:5272` | mp\_ (2) 8 | 두 장의 큰 클립보드 뒤로 한쪽 눈만 빼꼼 내미는 포즈(김 모락). 수줍/바쁨 표정            | 리포트/문서 더미·로딩·"준비 중" 표시 | `curl -o mp-08.png "https://www.figma.com/api/mcp/asset/ae1836da-6f51-4791-aae7-9629acf51b07"` |
| `2591:5273` | mp\_ (2) 9 | 윙크하며 양손으로 브이(V) 두 개, 머리 위 별. 축하/성취 표정                             | 성취·달성·축하(보상) 일러스트        | `curl -o mp-09.png "https://www.figma.com/api/mcp/asset/384c902f-08a4-44a1-98fb-ece2c7cf44ab"` |

> 위 `image_url`은 get_screenshot이 반환한 **단명(short-lived) URL**이다. 후속 export 단계에서 만료 시 동일 nodeId로 get_screenshot을 다시 호출해 새 URL을 받아야 한다. 정식 export는 스크린샷이 아니라 원본 PNG(275×275, 투명 배경)를 받는 것이 바람직하므로, 가능하면 Figma `use_figma`의 `exportAsync`(scale 1~2, format PNG) 또는 디자인 패널 export를 사용한다.

### 참조 컨테이너

| node        | 이름                        | 구성                                                                 | 비고                                                |
| ----------- | --------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `2539:5255` | home-character (section)    | `character` 프레임 안 심볼 8개 (`2576:5814`~`5822`)                  | **mp\_(2)2~9와 동일 캐릭터 세트** (홈 마스코트 8종) |
| `2539:5279` | Feeling Character Reference | `Feeling Character01`~`05` 심볼 5개 (`2539:5273`은 여기선 별개 노드) | **기분 5단계 얼굴 이모지** — mp\_(2)와 무관, mood용 |

> 주의: 노드 ID `2539:5273`은 "Feeling Character01" 심볼(감정)이고, `2591:5273`은 "mp\_ (2) 9"(마스코트)다. 끝 4자리가 같아 혼동 주의 — 앞자리(`2539` vs `2591`)로 구분한다.

---

## 2. 현재 public/ 에셋 현황 & 사용처

### 마스코트(mp\_(2) 계열)

- `public/chat/empty-mascot.png` (537KB) — **이미 존재**. 1024×837 짜리 **9등분 sprite** 한 장으로, mp\_(2) 계열 마스코트들이 격자로 배치된 시트다.
  - 사용처: `app/chat/page.tsx`의 `EmptyState`(L316~336). 컨테이너 `size-30 overflow-hidden`에서 `left-[-125.02%] top-[-220.04%] h-[320.45%] w-[339.56%]`로 sprite의 **한 칸만** 잘라 보여준다(Figma 절대값을 그대로 옮긴 형태, eslint `no-img-element` disable 주석 동반).
  - 한계: 개별 캐릭터를 골라 쓰려면 매번 sprite offset을 계산해야 하고, 8종 중 1종만 노출 중이라 나머지 7종은 활용되지 못한다. 개별 PNG로 분리하는 것이 본 작업의 핵심 갭이다.

### 감정(Feeling) 캐릭터 — 이미 구현됨 (mp\_(2)와 별개)

- `public/icons/figma/mission-feedback/{very-bad,bad,neutral,good,very-good}.svg` (각 40×40 SVG, 라디얼 그라데이션 얼굴)
  - 사용처:
    - `components/home/home-dashboard.tsx` — `HOME_ICON_PATHS.mood*`(L35~40) → `MoodBadge`(주간 캘린더 기분 표시), `MoodCheckModal`(L605~)의 5단계 선택 버튼, `moodIconPath()`(L746~759).
    - `components/mission/mission-screens.tsx` — 미션 피드백 화면에서 동일 SVG 사용 추정(`mission-feedback` 경로).
  - 결론: **"Feeling Character Reference 5종"은 이미 코드에 SVG로 들어와 있으므로 추가 export 불필요.**

### 기타 일러스트/아이콘 (참고)

- `public/images/figma/home/mission-illustration.svg` — 홈 `TodayMissionCard`/미션 화면 일러스트(마스코트와 별개 라인 일러스트).
- `public/icons/figma/home/*`, `public/icons/figma/roadmap/*` — 시스템/내비 아이콘.
- `public/onboarding/intro.png` — 온보딩 인트로 이미지.

---

## 3. 통합 계획 (저장 경로 · 파일명 · 사용 컴포넌트) — P1/P2/P3

### 저장 경로 규칙

기존 컨벤션(`public/images/figma/<섹션>/`)을 따라 **`public/images/figma/characters/`** 신설을 제안한다. 파일명은 의미 기반 kebab-case(노드명 `mp_(2)N`은 디자인 내부 식별자라 코드에 노출하지 않음 — DESIGN.md "노드 ID 주석 금지" 원칙과 동일 취지).

| node        | 제안 파일명 (`public/images/figma/characters/`) | 의미 키 (코드 상수) |
| ----------- | ----------------------------------------------- | ------------------- |
| `2591:5261` | `reading.png`                                   | `reading`           |
| `2591:5267` | `hug.png`                                       | `hug`               |
| `2591:5268` | `curious.png`                                   | `curious`           |
| `2591:5269` | `active.png`                                    | `active`            |
| `2591:5270` | `writing.png`                                   | `writing`           |
| `2591:5271` | `done.png`                                      | `done`              |
| `2591:5272` | `busy.png`                                      | `busy`              |
| `2591:5273` | `celebrate.png`                                 | `celebrate`         |

> export 포맷: **PNG, 투명 배경, 275×275(@1x) + 550×550(@2x) 권장.** 모바일 WebView 레티나 대응. 용량 최적화(pngquant/oxipng) 후 커밋. 8종 단순 정적 일러스트라 SVG 변환은 불필요(원본이 래스터 추정).

### P1 — 챗봇 빈 상태 sprite 분리 (가장 직접적인 갭)

- `app/chat/page.tsx` `EmptyState`의 `empty-mascot.png` sprite-offset 방식을 **개별 PNG(`curious.png`)** 로 교체.
  - 효과: `overflow-hidden` + 절대값 offset(`left-[-125.02%]` 등) 제거 → 단순 `<Image src=".../curious.png">`. eslint-disable 주석 제거 가능, 유지보수성 향상.
  - "궁금한 점을 모두 물어보세요" 카피와 `curious`(물음표 캐릭터)가 의미상 정확히 일치.
- 가능하면 `next/image`(`<Image>`) 사용 — 현재 raw `<img>`라 `no-img-element` disable 중. 단, sprite 제거가 우선이며 컴포넌트 교체는 P1에 포함.

### P2 — 마스코트 상수화 + 재사용 컴포넌트

- `lib/characters.ts`(신규)에 의미 키 → 경로 매핑 상수 정의:
  ```ts
  export const CHARACTER_IMAGES = {
    reading: "/images/figma/characters/reading.png",
    hug: "/images/figma/characters/hug.png",
    curious: "/images/figma/characters/curious.png",
    active: "/images/figma/characters/active.png",
    writing: "/images/figma/characters/writing.png",
    done: "/images/figma/characters/done.png",
    busy: "/images/figma/characters/busy.png",
    celebrate: "/images/figma/characters/celebrate.png",
  } as const;
  ```
- 적용처 후보:
  - 미션 시작/진행 → `active`, 미션 완료 화면 → `done`/`celebrate` (`components/mission/mission-screens.tsx`).
  - 리포트 빈/로딩 상태 → `busy`/`writing` (`components/home/home-dashboard.tsx` `ReportSummaryCard` 또는 리포트 페이지).
  - 정서/마음케어 섹션 → `hug`.
  - 학습/정보 콘텐츠 빈 상태 → `reading`.

### P3 — 홈 캐릭터 섹션 / 컬렉션 (선택)

- Figma `home-character`(`2539:5255`)가 8종을 한 화면에 모아 보여주는 "캐릭터 도감/컬렉션" 의도라면, 8종 전부를 그리드로 노출하는 홈 위젯 또는 별도 컬렉션 화면을 검토.
- 현재 `home-dashboard.tsx`에는 해당 섹션이 미구현 — 기획 확정 시 P3로 추가.

### 비고 — 감정(Feeling) 캐릭터

- 별도 export/통합 **불필요**. 이미 `mission-feedback/*.svg` 5종으로 구현·사용 중. 본 8종 마스코트와 혼동하지 말 것.
