# 로드맵 디자인 갭 — Figma ↔ 현재 구현

> Figma: node `2395:12600` "로드맵" (fileKey `sKdG5GEBZPdMjFY9nYj5g0`)
> 하위 프레임: `2516:5324`(로드맵 - 01), `2516:5453`(tooltip 노출 변형)
> 현재 코드: `app/(main)/roadmap/page.tsx`, `components/roadmap/roadmap-screen.tsx`, `components/app/bottom-nav.tsx`, `lib/roadmap-data.ts`
> 디자인 토큰 출처: `DESIGN.md`
>
> 작성일: 2026-05-29 · Figma MCP `get_design_context` + `get_metadata` + `get_variable_defs`로 실측한 값 기준.

---

## 1. Figma 디자인 요약 (레이아웃 + 토큰 hex/px)

### 1.1 레이아웃 골격 (프레임 폭 390px)

```
Status Bar (47px)                  ← WebView에선 OS가 그림 (구현 제외)
Sub LNB (헤더, 56px)               ← back(44) · "주간 리포트"(중앙) · info(44)
─────────────────────────────────
현재 상황 카드 (px20 py20)         ← 흰 카드, shadow1, radius 24px
발달 지표 섹션 (px20 py16)         ← 타이틀(18px Bold) + 월령 탭 행
category card 리스트 (px20 py12)  ← 사회성/언어/인지/신체 4장, gap 16px
─────────────────────────────────
Bottom Nav (btn, p20)             ← 5탭 pill 컨테이너
Home Indicator (21px)             ← WebView에선 OS가 그림 (구현 제외)
```

> 주의: 메타데이터·디자인 컨텍스트상 **헤더 타이틀 텍스트가 "주간 리포트"**로 들어가 있다(node `2516:5340` / `2516:5469`, 스크린샷에도 "주간 리포트"로 렌더). 로드맵 화면인데 잘못된 더미 텍스트가 남아있는 것으로 보임 → 디자인 측 수정 필요 항목. 본 화면의 의미상 올바른 타이틀은 "발달 로드맵" 계열.

### 1.2 헤더 (Sub LNB, 높이 56px / 상단 status 47px)

- 좌: `arrow_back` 24px, 44×44 터치영역 (p8)
- 중앙: 타이틀 — Pretendard SemiBold 16px, `text-primary #262626`, leading 1.4 (**텍스트는 "주간 리포트"로 잘못 들어감**)
- 우: `Warning / Info` 아이콘 24px, 44×44

### 1.3 현재 상황 카드 (`2516:5380` "Success Rate Graph Placeholder")

- 컨테이너: `background-primary #ffffff`, radius **24px** (`color/number/10`), padding **24px**, gap 15px
- 그림자: `shadow1` = drop-shadow `0 1px 2px rgba(0,0,0,0.05)` + `0 0 2px rgba(0,0,0,0.05)` (`color/alpha/shadow1 #0000000d`)
- 1행: `kid_star` 아이콘 **20px** + "현재 상황 [ 자아 형성기 ]" — Pretendard **Bold 12px**, `text-primary #262626`, gap 4px
- 2행(제목): "4개월 차" — Pretendard **Bold 20px**, leading 1.5, `text-primary #262626`
- 3행(본문): 안내문 — Pretendard **Medium 14px**, leading 1.4, `text-secondary #555555`

### 1.4 발달 지표 + 월령 탭 (`2516:5438`)

- 타이틀 "발달 지표" — Pretendard **Bold 18px** (`Title/Small-b`), `text-primary #262626`
- 탭 행: chevron(24px) · 칩 5개(`flex-1` 균등) · chevron(24px), gap 8px
- 칩 = **사각 pill, radius 12px**(`radius-system/m`), padding `10px / 8px`, 텍스트 Pretendard Medium 12px
  - 비활성: `background-primary #fff` + border `border/primary #e9e9e9`, 텍스트 `text-secondary #555`
  - 활성(파스텔 변형, "4개월"): `button-secondary #efe7ff` bg + border `border/secondary #b69cfe`, 텍스트 `text-brand #9572ff`
  - 활성(솔리드 변형, "8개월"): `button-primary #9572ff` bg, 텍스트 white — **두 활성 스타일이 같은 행에 공존(디자인 내부 불일치)**
- 탭 라벨: 2 / 4 / 6 / 8 / 6 개월 (마지막 "6개월"은 더미 오타로 보임)

### 1.5 카테고리 카드 4종 (`2516:5394`/`5405`/`5416`/`5427`)

- 카드: `bg-white` + **border `color/gray/50 #f6f6f6`**, radius **24px**, padding **20px**, gap 16px (chip ↔ 본문)
- Chip: **28×28, radius 12px(사각)**, 내부 아이콘 20px, p4, `overflow-clip`
  - 배경 = 카테고리 색 **15% 알파** + inset glow `shadow-[inset_0_0_10px_…10%]`
  - 사회성(`groups`): `rgba(255,166,33,0.15)` (오렌지)
  - 언어(`dictionary`): `rgba(73,122,244,0.15)` (블루)
  - 인지(`psychology_alt`): `rgba(147,73,244,0.15)` (퍼플)
  - 신체(`barefoot`): `rgba(0,170,255,0.15)` (시안)
- 제목(Heading 3): Pretendard **Bold 14px**(`Body/medium-b`), `text-primary #262626`
- 본문: Pretendard Regular 14px(`Body/Medium-r`), `text-secondary #555` — **disc 불릿 리스트(`list-disc`, 항목당 한 줄)**

### 1.6 tooltip (`2516:5522`, info 클릭 시)

- 위치: 헤더 info 아래, 폭 **271px**, padding 16/8, 흰 배경
- **아래 화살표(polygon, 위쪽을 가리킴)** — info에서 내려온 말풍선
- 텍스트: "CDC, AAP, 국민건강보험, 보건복지부 등 세계 소아과 전문의들이 가장 많이 참고하는 데이터를 바탕으로 설계된 발달 지표입니다." (12px)

### 1.7 Bottom Nav (`2516:5345` btn)

- pill 컨테이너: `background-secondary #fdfdfe`, radius 999px, p6, drop-shadow `0 4px 12px rgba(0,0,0,0.04)`
- 5탭(`flex-1`): 홈(`home`) · 10분 놀이(`List`) · **로드맵(활성)** · AI 상담(`maps_ugc`) · 리포트(`bar_chart`)
- 활성 탭: `bg-[#e9e9e9]` pill, 라벨 `text-primary #262626`
- 비활성 라벨: `text-placeholder #9d9d9d`, Pretendard Regular 12px

### 1.8 사용 토큰 요약

| 토큰                      | 값          | 쓰임                   |
| ------------------------- | ----------- | ---------------------- |
| `background/primary`      | `#ffffff`   | 카드 배경              |
| `background/secondary`    | `#fdfdfe`   | 화면/nav 배경          |
| `color/gray/50`           | `#f6f6f6`   | 카드 border            |
| `border/primary`          | `#e9e9e9`   | 비활성 탭 border       |
| `border/secondary`        | `#b69cfe`   | 활성 탭 border(파스텔) |
| `button/button-primary`   | `#9572ff`   | 활성 탭(솔리드)        |
| `button/button-secondary` | `#efe7ff`   | 활성 탭 bg(파스텔)     |
| `text/text-brand`         | `#9572ff`   | 활성 탭 텍스트         |
| `text/text-primary`       | `#262626`   | 본문 강조              |
| `text/text-secondary`     | `#555555`   | 보조 텍스트            |
| `text/text-placeholder`   | `#9d9d9d`   | 비활성 nav 라벨        |
| `color/number/10`         | `24`(px)    | 카드 radius            |
| `radius-system/m`         | `12`(px)    | 탭/chip radius         |
| `color/alpha/shadow1`     | `#0000000d` | shadow1 색             |

---

## 2. 현재 구현 요약

`roadmap-screen.tsx` (`"use client"`) 한 파일에 헤더·툴팁·현재상황·월령탭·카테고리카드가 모두 들어있다. `loadRoadmap()`로 데이터 패치, fallback은 `lib/roadmap-data.ts`의 `getDemoRoadmap()`.

- **헤더**: 높이 103px(47 status + 56), 타이틀 **"발달 로드맵"** (text-base SemiBold), back(ArrowLeft)·info(Info) lucide 아이콘, 각 size-11(44px). → 헤더에 back/info 모두 구현됨.
- **현재 상황 카드**: `bg-[#f6f6f6]`, **radius 16px(`rounded-2xl`)**, padding `px6 py6`(24px), **그림자 없음**. 별 = lucide `Star` size-5(20px) **퍼플 `#9572ff`** fill. 제목 "현재 상황 [ {stage.name} ]" 12px Bold. 나이 텍스트 **22px extrabold leading-30**. 본문 14px Medium leading-1.7 `#555`.
- **월령 탭**: 섹션 타이틀 "발달 지표" **text-base(16px) Bold**. 탭 = **`rounded-full` pill**, px3.5, 12px Medium. 활성 = `bg-[#9572ff]` 솔리드 + white, 비활성 = 투명 bg + `#555`. chevron 24px, prev/next는 `range`로 disable.
- **카테고리 카드**: `bg-white`, radius 16px(`rounded-2xl`), padding 20px(p5), **그림자 `shadow-[0_4px_10px_rgba(0,0,0,0.04)]`, border 없음**. Chip = **size-7(28px) `rounded-full` 원형**, 내부 아이콘 size-5(20px). Chip 색은 솔리드 hex(아래 표). 제목 **text-base(16px) Bold**. 본문 = `ul.space-y-1` (불릿 없음, 텍스트만 줄바꿈).
- **tooltip**: info 클릭 시 `absolute right-5 top-2`, 폭 271px, 흰 배경 `rounded-2xl`, shadow `0_4px_20px_…0.12`, **위쪽 화살표(border-b-white triangle)**. 텍스트는 `sourceTooltip.text`.
- **Bottom Nav** (`bottom-nav.tsx`, 별도 컴포넌트): `fixed bottom-0`, pill 컨테이너 `bg-[#fdfdfe]` radius 999px shadow `0_4px_12px_…0.04`. 5탭: 홈 / 10분 놀이 / **성장 로드맵(활성 `bg-[#e9e9e9]`)** / AI 상담 / 리포트. 아이콘은 `/icons/figma/home/nav-*.svg` 사용.
  - ⚠️ `roadmap/page.tsx` → `RoadmapScreen`은 **`BottomNav`를 렌더하지 않음.** 레이아웃 레벨(`app/(main)/layout`)에서 그려지는지 별도 확인 필요.

현재 chip 색 (`CATEGORY_CARD_STYLES`):

| 카테고리        | chipBg(현재) | chipFg(현재) |
| --------------- | ------------ | ------------ |
| social(사회성)  | `#FFF1D6`    | `#D08C0B`    |
| language(언어)  | `#E5ECFF`    | `#3A66E2`    |
| cognitive(인지) | `#EFE4FF`    | `#7B4FE0`    |
| physical(신체)  | `#D6F5EC`    | `#159A6F`    |

---

## 3. 갭 표

| 요소                     | Figma                                                                 | 현재                                          | 차이 / 액션                                                                                          |
| ------------------------ | --------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **헤더 타이틀**          | 텍스트 "주간 리포트"(더미 오류). 의미상 "발달 로드맵"                 | "발달 로드맵"                                 | 코드가 의미상 맞음. **Figma 측 더미 텍스트 수정 필요**(P3). 정식 카피 확정 후 양쪽 동기화            |
| **헤더 아이콘**          | back 24 + info 24                                                     | back + info (lucide, 44px 터치)               | 일치. lucide vs Figma SVG 차이만 검토(P3)                                                            |
| **현재상황 카드 bg**     | `#ffffff` + `shadow1`(0 1px 2px / 0 0 2px, 5%)                        | `bg-[#f6f6f6]`, 그림자 없음                   | **불일치**. 흰 배경 + shadow1로 변경(P1)                                                             |
| **현재상황 카드 radius** | 24px                                                                  | 16px(`rounded-2xl`)                           | **불일치**. `rounded-[24px]`로(P2)                                                                   |
| **현재상황 별 아이콘**   | `kid_star` 20px (옐로우/골드 톤)                                      | lucide `Star` 퍼플 `#9572ff`                  | **불일치**. Figma `kid_star` SVG export 사용, 색상 맞추기(P2)                                        |
| **현재상황 stage 명**    | "자아 형성기"                                                         | `stage.name`(데모 "신뢰·애착기")              | 데이터 차이. 4개월차 stage 명 카피 확정 필요(P3, 데이터)                                             |
| **나이 텍스트 크기**     | 20px Bold, leading 1.5                                                | 22px extrabold, leading 30                    | **불일치**. 20px Bold로(P2)                                                                          |
| **월령 탭 형태**         | 사각 pill radius **12px**, 5개 `flex-1` 균등                          | `rounded-full` pill, px3.5                    | **불일치**. radius 12px 사각형으로(P1)                                                               |
| **월령 탭 활성 스타일**  | 파스텔(`#efe7ff` bg + `#b69cfe` border + `#9572ff` txt) ↔ 솔리드 혼재 | 솔리드 `#9572ff` + white only                 | **불일치 + Figma 내부 불일치**. 활성 스타일 단일안 확정(파스텔 권장) 후 코드 반영(P1)                |
| **월령 탭 비활성**       | 흰 bg + border `#e9e9e9`, 텍스트 `#555`                               | 투명 bg, border 없음, 텍스트 `#555`           | **불일치**. 흰 배경 + border 추가(P1)                                                                |
| **발달지표 타이틀**      | 18px Bold (`Title/Small-b`)                                           | 16px Bold (`text-base`)                       | **불일치**. `text-lg`(18px)로(P2)                                                                    |
| **카드 chip 형태**       | 28px **사각 radius 12px** + 15% 알파 bg + inset glow                  | 28px **원형(`rounded-full`)** + 솔리드 hex bg | **불일치**. 사각 12px + 알파 배경 + inset shadow로(P1)                                               |
| **chip 색(사회성)**      | bg `rgba(255,166,33,0.15)` 오렌지                                     | bg `#FFF1D6` / fg `#D08C0B`                   | 톤 다름. Figma 알파값 채택(P1)                                                                       |
| **chip 색(언어)**        | bg `rgba(73,122,244,0.15)` 블루                                       | bg `#E5ECFF` / fg `#3A66E2`                   | 톤 다름. Figma 알파값 채택(P1)                                                                       |
| **chip 색(인지)**        | bg `rgba(147,73,244,0.15)` 퍼플                                       | bg `#EFE4FF` / fg `#7B4FE0`                   | 톤 다름. Figma 알파값 채택(P1)                                                                       |
| **chip 색(신체)**        | bg `rgba(0,170,255,0.15)` 시안                                        | bg `#D6F5EC` / fg `#159A6F` (그린)            | **색 계열 자체 다름(시안 vs 그린)**. Figma 시안으로 통일(P1)                                         |
| **카드 border**          | border `color/gray/50 #f6f6f6`                                        | border 없음, shadow `0_4px_10px_…0.04`        | **불일치**. border `#f6f6f6` 추가(그림자는 Figma에 없음 → 제거 검토)(P2)                             |
| **카드 radius**          | 24px                                                                  | 16px(`rounded-2xl`)                           | **불일치**. `rounded-[24px]`로(P2)                                                                   |
| **카드 제목 크기**       | 14px Bold                                                             | 16px Bold(`text-base`)                        | **불일치**. `text-sm`(14px) Bold로(P2)                                                               |
| **카드 본문 리스트**     | `list-disc` 불릿, 항목당 한 줄                                        | `ul.space-y-1` 불릿 없음, description 통문장  | **불일치**. disc 불릿 적용 + 항목 분리(P2). 단, API description이 통문장이라 데이터 분할 검토 필요   |
| **tooltip 화살표**       | 아래 방향(말풍선이 info 아래, 위를 가리킴)                            | 위 방향 화살표(`border-b-white`)              | 방향 검토. 위치·화살표 방향 Figma와 일치화(P3)                                                       |
| **tooltip 폭/텍스트**    | 271px, CDC/AAP 출처 문구                                              | 271px, `sourceTooltip.text` 동일              | 일치                                                                                                 |
| **Bottom Nav**           | 5탭, 로드맵 활성 `#e9e9e9`, 리포트=`bar_chart` / AI상담=`maps_ugc`    | 5탭, 성장 로드맵 활성 `#e9e9e9`, nav SVG 사용 | 거의 일치. 라벨 "로드맵"(Figma) vs "성장 로드맵"(코드) 차이(P3). **page에서 nav 렌더 여부 확인**(P1) |
| **토큰 하드코딩**        | 변수 바인딩(`text/*`, `button/*`, `radius-system/*`)                  | 전부 인라인 hex `bg-[#…]`                     | DESIGN.md "하드코딩 hex 금지" 위반. Tailwind theme/CSS 변수 토큰화(P3, 전 화면 공통 과제)            |

---

## 4. 액션 아이템

### P1 (시각적으로 가장 두드러진 갭 — 우선)

1. **월령 탭 재작업**: `rounded-full` → 사각 `rounded-[12px]`, 비활성에 흰 배경 + `border-[#e9e9e9]` 추가, 활성 스타일 단일안(파스텔 `#efe7ff`/`#b69cfe`/`#9572ff` 권장) 확정 후 적용.
2. **카테고리 chip 재작업**: 원형 → 사각 `rounded-[12px]`, 배경을 카테고리 색 15% 알파 + `shadow-[inset_0_0_10px_…10%]` glow로. 4색을 Figma 알파값(오렌지/블루/퍼플/**시안**)으로 통일 — 특히 신체는 현재 그린이라 색 계열부터 교체.
3. **현재 상황 카드 배경**: `#f6f6f6` → 흰색 + `shadow1`.
4. **Bottom Nav 렌더 확인**: `RoadmapScreen`이 nav를 안 그리므로 `app/(main)` 레이아웃에서 실제 노출되는지 검증. 누락 시 추가.

### P2 (치수·타이포 정렬)

5. 현재상황 카드 / 카테고리 카드 radius 16px → **24px**.
6. 카테고리 카드: border `#f6f6f6` 추가, Figma에 없는 그림자는 제거 검토.
7. 타이포 정렬: "발달 지표" 16→18px, 카드 제목 16→14px, 나이 텍스트 22→20px(extrabold→Bold).
8. 별 아이콘: lucide 퍼플 → Figma `kid_star`(골드) SVG.
9. 카테고리 본문 `list-disc` 불릿 적용 (API description 문장 분할 데이터 작업 동반).

### P3 (카피·데이터·토큰화)

10. **헤더 타이틀**: Figma 더미 "주간 리포트" 수정 + 정식 카피("발달 로드맵") 양쪽 동기화. (월령 탭 마지막 "6개월" 더미 오타도 Figma 정리)
11. stage 명("자아 형성기" vs "신뢰·애착기") 등 4개월차 콘텐츠 카피를 기획/API와 확정.
12. 인라인 hex → DESIGN.md 토큰(CSS 변수/Tailwind theme) 매핑 (전 화면 공통 리팩터링).
13. tooltip 화살표 방향, nav 라벨("로드맵" vs "성장 로드맵") 미세 정렬.
