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

export const ROADMAP_CATEGORY_DISPLAY: Record<
  RoadmapCategoryId,
  { label: string; iconKey: string }
> = {
  social: { label: "사회성", iconKey: "groups" },
  language: { label: "언어", iconKey: "dictionary" },
  cognitive: { label: "인지", iconKey: "psychology_alt" },
  physical: { label: "신체", iconKey: "barefoot" },
};
