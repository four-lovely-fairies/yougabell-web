import type { components } from "./generated/api-types";

export type RoadmapResponse = components["schemas"]["RoadmapResponseDto"];
export type RoadmapCategoryGroup =
  components["schemas"]["RoadmapCategoryGroupDto"];
export type RoadmapMilestoneItem =
  components["schemas"]["RoadmapMilestoneItemDto"];
export type RoadmapMonthTabRange =
  components["schemas"]["RoadmapMonthTabRangeDto"];
export type RoadmapStage = components["schemas"]["RoadmapStageDto"];
export type RoadmapChild = components["schemas"]["RoadmapChildDto"];

export type RoadmapCategoryId = RoadmapCategoryGroup["categoryId"];

/**
 * api `roadmap.types.ts` CDC_CHECKPOINTS와 동일. 데모 응답 생성 시 윈도우 슬라이스에 사용.
 * 실서버 응답은 `monthTabs` / `monthTabRange` 필드로 직접 받으므로 본 상수는 fallback 전용.
 */
export const CDC_CHECKPOINTS = [
  2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60,
] as const;

export const ROADMAP_CATEGORY_DISPLAY: Record<
  RoadmapCategoryId,
  { label: string; iconKey: string }
> = {
  social: { label: "사회성", iconKey: "groups" },
  language: { label: "언어", iconKey: "dictionary" },
  cognitive: { label: "인지", iconKey: "psychology_alt" },
  physical: { label: "신체", iconKey: "barefoot" },
};

/**
 * api 미연결·세션 없음 fallback. Figma `2516:5324` 4개월차 본문 그대로 + 기획 문서 §1 출처.
 */
export const getDemoRoadmap = (): RoadmapResponse => ({
  child: {
    id: "demo-child-youse",
    name: "김유스",
    ageMonths: 4,
    ageLabel: "4개월 차",
  },
  stage: {
    id: "trust-attachment",
    name: "신뢰·애착기",
    summary:
      '아이의 독립심이 싹트고 있어요. "내가 할래!"라는 말은 성장의 아주 건강한 신호입니다. 따뜻한 인내심이 아이의 자존감을 만듭니다.',
  },
  targetMonth: 4,
  monthTabs: [2, 4, 6, 9, 12],
  monthTabRange: { prev: null, next: 15 },
  milestonesByCategory: [
    {
      categoryId: "social",
      categoryLabel: "사회성",
      iconKey: "groups",
      items: [
        {
          id: "demo-social-4",
          description:
            "말을 걸거나 들어 올리면 차분해진다. 상대의 얼굴을 바라본다. 아이에게 다가가면 좋아한다. 아이에게 말하거나 미소를 지을 때 미소를 짓는다.",
          sources: [{ citation: "CDC", url: null }],
        },
      ],
    },
    {
      categoryId: "language",
      categoryLabel: "언어",
      iconKey: "dictionary",
      items: [
        {
          id: "demo-language-4",
          description:
            "울음 소리 이외의 소리를 낸다. 시끄러운 소리에 반응한다.",
          sources: [{ citation: "CDC", url: null }],
        },
      ],
    },
    {
      categoryId: "cognitive",
      categoryLabel: "인지",
      iconKey: "psychology_alt",
      items: [
        {
          id: "demo-cognitive-4",
          description: "움직임에 따라 상대를 주시한다. 수 초 동안 장난감을 본다.",
          sources: [{ citation: "CDC", url: null }],
        },
      ],
    },
    {
      categoryId: "physical",
      categoryLabel: "신체",
      iconKey: "barefoot",
      items: [
        {
          id: "demo-physical-4",
          description:
            "머리를 가눌 수 있다. 엎드린 자세에서 팔에 의지해 머리를 든다.",
          sources: [{ citation: "CDC", url: null }],
        },
      ],
    },
  ],
  sourceTooltip: {
    text: "CDC, AAP, 국민건강보험, 보건복지부 등 세계 소아과 전문의들이 가장 많이 참고하는 데이터를 바탕으로 설계된 발달 지표입니다.",
  },
});
