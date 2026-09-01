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

export const updateRoadmapMilestoneCompletion = (
  roadmap: RoadmapResponse,
  milestoneId: string,
  completed: boolean,
): RoadmapResponse => ({
  ...roadmap,
  milestonesByCategory: roadmap.milestonesByCategory.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.id === milestoneId
        ? {
            ...item,
            completed,
            completedAt: completed ? new Date().toISOString() : null,
          }
        : item,
    ),
  })),
});

type DemoMilestones = Record<RoadmapCategoryId, string[]>;

const DEMO_MILESTONES_BY_MONTH: Record<number, DemoMilestones> = {
  2: {
    social: [
      "말을 걸거나 들어 올리면 차분해진다.",
      "상대의 얼굴을 바라본다.",
      "아이에게 다가가면 좋아한다.",
      "아이에게 말하거나 미소를 지을 때 미소를 짓는다.",
    ],
    language: ["울음 소리 이외의 소리를 낸다.", "시끄러운 소리에 반응한다."],
    cognitive: ["움직임에 따라 상대를 주시한다.", "수 초 동안 장난감을 본다."],
    physical: [
      "배를 대고 엎드렸을 때 머리를 치켜든다.",
      "양쪽 팔과 양쪽 다리를 움직인다.",
      "손을 살짝 편다.",
    ],
  },
  4: {
    social: [
      "관심을 끌기 위해 스스로 미소를 짓는다.",
      "아기를 웃게 하려고 할 때 싱긋 웃는다.",
      "상대의 관심을 끌기 위해 바라보거나 움직이거나 소리를 낸다.",
    ],
    language: [
      '"우우", "아아"와 같은 옹알이 소리를 낸다.',
      "말을 걸면 대답하듯 소리를 낸다.",
      "사람의 목소리가 나는 쪽으로 고개를 돌린다.",
    ],
    cognitive: [
      "배가 고프면 젖이나 우유병을 보고 입을 벌린다.",
      "자신의 손을 관심 있게 바라본다.",
    ],
    physical: [
      "안고 있을 때 머리를 받쳐주지 않아도 머리를 유지한다.",
      "손에 장난감을 놓으면 쥔다.",
      "팔을 사용해 장난감을 흔든다.",
    ],
  },
  6: {
    social: [
      "친숙한 사람을 안다.",
      "거울에 비친 모습을 보는 것을 좋아한다.",
      "웃는다.",
    ],
    language: [
      "상대와 번갈아 가며 소리를 낸다.",
      "혀를 내밀거나 투레질을 한다.",
      "꽥꽥 소리를 낸다.",
    ],
    cognitive: [
      "물건을 탐색하기 위해 입에 넣는다.",
      "원하는 장난감을 잡으려고 손을 뻗는다.",
      "더 먹고 싶지 않으면 입을 다문다.",
    ],
    physical: [
      "뒤집기를 한다.",
      "엎드렸을 때 팔을 펴고 몸을 밀어 올린다.",
      "앉아 있을 때 손으로 기대어 몸을 지탱한다.",
    ],
  },
  9: {
    social: [
      "낯선 사람 앞에서 수줍어하거나 보호자에게 달라붙는다.",
      "여러 얼굴 표정을 보인다.",
      "이름을 부르면 쳐다본다.",
    ],
    language: [
      '"마마마마", "바바바바" 같은 다양한 소리를 낸다.',
      "안아 올려 달라는 뜻으로 팔을 든다.",
    ],
    cognitive: [
      "시야에서 물체가 사라지면 찾는다.",
      "두 개의 물건을 맞부딪친다.",
    ],
    physical: [
      "스스로 앉은 자세를 취한다.",
      "한 손에서 다른 손으로 물건을 옮긴다.",
      "손가락으로 음식을 자신 쪽으로 모은다.",
    ],
  },
  12: {
    social: [
      "짝짜꿍과 같은 게임을 함께 한다.",
      "친숙한 사람에게 애정을 표현한다.",
    ],
    language: [
      '"안녕" 하며 손을 흔든다.',
      "보호자를 특별한 이름으로 부른다.",
      '"안돼"라는 말을 이해한다.',
    ],
    cognitive: ["용기 안에 물건을 넣는다.", "숨긴 장난감을 찾는다."],
    physical: [
      "물건을 잡고 일어선다.",
      "가구를 잡고 걷는다.",
      "도와주면 컵으로 물을 마신다.",
    ],
  },
  15: {
    social: [
      "다른 아이의 놀이를 따라 한다.",
      "좋아하는 물건을 보여준다.",
      "신날 때 손뼉을 친다.",
    ],
    language: [
      "한두 단어를 말하려고 시도한다.",
      "익숙한 사물의 이름을 들으면 바라본다.",
      "몸짓과 단어로 한 지시를 따른다.",
    ],
    cognitive: [
      "전화나 컵 같은 물건을 올바른 방식으로 사용하려 한다.",
      "작은 물체를 두 개 이상 쌓는다.",
    ],
    physical: [
      "스스로 몇 걸음을 걷는다.",
      "손가락을 사용해 스스로 음식을 먹는다.",
    ],
  },
  18: {
    social: [
      "보호자에게서 떨어져도 가까이 있는지 확인한다.",
      "흥미로운 것을 가리켜 알려준다.",
      "손을 씻을 수 있도록 손을 내민다.",
    ],
    language: [
      "보호자를 부르는 말 외에 세 단어 이상 말하려 한다.",
      "몸짓 없이 간단한 한 단계 지시를 따른다.",
    ],
    cognitive: [
      "빗자루질 같은 집안일을 따라 한다.",
      "간단한 방식으로 장난감을 가지고 논다.",
    ],
    physical: [
      "다른 것을 잡지 않고 혼자 걷는다.",
      "낙서를 한다.",
      "뚜껑 없는 컵으로 물을 마신다.",
    ],
  },
  24: {
    social: [
      "다른 사람이 다치거나 화가 난 것을 알아차린다.",
      "새로운 상황에서 보호자의 얼굴을 살핀다.",
    ],
    language: [
      "질문하면 책 속 사물을 가리킨다.",
      "두 단어 이상을 함께 말한다.",
      "신체 부위를 두 개 이상 가리킨다.",
    ],
    cognitive: [
      "한 손으로 물건을 잡고 다른 손을 사용한다.",
      "스위치나 버튼을 사용하려 한다.",
      "장난감 두 개 이상을 함께 가지고 논다.",
    ],
    physical: ["공을 찬다.", "뛴다.", "도움을 받아 계단을 걸어 올라간다."],
  },
  30: {
    social: [
      "다른 아이 옆에서 놀며 때때로 함께 논다.",
      "자신이 할 수 있는 것을 보여준다.",
      "간단한 일상을 따른다.",
    ],
    language: [
      "약 50개의 단어를 말한다.",
      "동작 단어와 함께 두 단어 이상을 말한다.",
      "책 속 사물의 이름을 말한다.",
    ],
    cognitive: [
      "물건을 사용해 시늉 놀이를 한다.",
      "간단한 문제 해결 능력을 보인다.",
      "두 단계 지시를 따른다.",
    ],
    physical: [
      "손을 사용해 물건을 돌린다.",
      "일부 옷을 스스로 벗는다.",
      "두 발로 땅에서 뛴다.",
    ],
  },
  36: {
    social: [
      "보호자와 헤어진 후 10분 이내에 진정된다.",
      "다른 아이를 의식하며 함께 논다.",
    ],
    language: [
      "두 번 이상 주고받는 대화를 한다.",
      "누가·무엇·어디·왜가 포함된 질문을 한다.",
      "그림 속 행동을 말한다.",
    ],
    cognitive: [
      "동그라미 그리는 모습을 보고 따라 그린다.",
      "주의를 주면 뜨거운 물체를 만지지 않는다.",
    ],
    physical: [
      "큰 구슬 같은 물건을 끈에 꿴다.",
      "일부 옷을 혼자 입는다.",
      "포크를 사용한다.",
    ],
  },
  48: {
    social: [
      "놀이 중 다른 사람이나 대상의 흉내를 낸다.",
      "다른 아이에게 함께 놀자고 묻는다.",
      "아프거나 슬픈 사람을 위로한다.",
    ],
    language: [
      "네 단어 이상의 문장을 말한다.",
      "노래나 이야기의 일부를 말한다.",
      "하루 중 있었던 일을 이야기한다.",
    ],
    cognitive: [
      "몇 가지 색깔을 말한다.",
      "이야기에서 다음 일을 예측한다.",
      "신체 부위가 세 개 이상인 사람을 그린다.",
    ],
    physical: [
      "대부분 큰 공을 잡는다.",
      "감독 아래 음식을 담거나 물을 따른다.",
      "일부 단추를 푼다.",
    ],
  },
  60: {
    social: [
      "게임 규칙을 따르고 차례를 지킨다.",
      "노래하거나 춤추거나 연기한다.",
      "간단한 집안일을 한다.",
    ],
    language: [
      "두 가지 사건이 포함된 이야기를 한다.",
      "이야기에 대한 간단한 질문에 답한다.",
      "세 번 이상 대화를 주고받는다.",
    ],
    cognitive: [
      "열까지 센다.",
      "1에서 5 사이의 숫자를 말한다.",
      "시간에 관한 단어를 사용한다.",
    ],
    physical: ["일부 단추를 채운다.", "한 발로 깡충깡충 뛴다."],
  },
};

const DEMO_CATEGORY_ORDER: RoadmapCategoryId[] = [
  "social",
  "language",
  "cognitive",
  "physical",
];

/** api 미연결·세션 없음 fallback. 실제 API와 동일하게 지표 한 건을 체크 한 건으로 만든다. */
export const getDemoRoadmap = (requestedMonth = 4): RoadmapResponse => {
  const targetMonth = resolveDemoMonth(requestedMonth);
  const milestoneDescriptions = DEMO_MILESTONES_BY_MONTH[targetMonth];
  const targetIndex = CDC_CHECKPOINTS.indexOf(
    targetMonth as (typeof CDC_CHECKPOINTS)[number],
  );
  const tabStart = Math.min(
    Math.max(targetIndex - 2, 0),
    CDC_CHECKPOINTS.length - 5,
  );
  const monthTabs = CDC_CHECKPOINTS.slice(tabStart, tabStart + 5);

  return {
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
    targetMonth,
    monthTabs: [...monthTabs],
    monthTabRange: {
      prev: tabStart > 0 ? CDC_CHECKPOINTS[Math.max(0, tabStart - 5)] : null,
      next:
        tabStart + 5 < CDC_CHECKPOINTS.length
          ? CDC_CHECKPOINTS[tabStart + 5]
          : null,
    },
    milestonesByCategory: DEMO_CATEGORY_ORDER.map((categoryId) => ({
      categoryId,
      categoryLabel: ROADMAP_CATEGORY_DISPLAY[categoryId].label,
      iconKey: ROADMAP_CATEGORY_DISPLAY[categoryId].iconKey,
      items: milestoneDescriptions[categoryId].map((description, index) => ({
        id: `demo-${categoryId}-${targetMonth}-${index + 1}`,
        description,
        completed: false,
        completedAt: null,
        sources: [{ citation: "CDC", url: null }],
      })),
    })),
    sourceTooltip: {
      text: "CDC, AAP, 국민건강보험, 보건복지부 등 세계 소아과 전문의들이 가장 많이 참고하는 데이터를 바탕으로 설계된 발달 지표입니다.",
    },
  };
};

const resolveDemoMonth = (requestedMonth: number): number => {
  let resolved: number = CDC_CHECKPOINTS[0];
  for (const checkpoint of CDC_CHECKPOINTS) {
    if (checkpoint > requestedMonth) break;
    resolved = checkpoint;
  }
  return resolved;
};
