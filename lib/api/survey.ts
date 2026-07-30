import { request } from "./client";
import type { components } from "../generated/api-types";

export type SatisfactionSurveyStatus =
  components["schemas"]["SatisfactionSurveyStatusDto"];
export type SatisfactionSurveyPromptState =
  components["schemas"]["SatisfactionSurveyPromptStateDto"];
export type SubmitSatisfactionSurveyPayload =
  components["schemas"]["SubmitSatisfactionSurveyDto"];
export type SatisfactionSurveyResponse =
  components["schemas"]["SatisfactionSurveyResponseDto"];

export const getSatisfactionSurveyStatus =
  (): Promise<SatisfactionSurveyStatus> =>
    request<SatisfactionSurveyStatus>("/surveys/satisfaction/status");

export const recordSatisfactionSurveyPromptShown =
  (): Promise<SatisfactionSurveyPromptState> =>
    request<SatisfactionSurveyPromptState>("/surveys/satisfaction/prompt-shown", {
      method: "POST",
    });

export const recordSatisfactionSurveyPromptDismissed =
  (): Promise<SatisfactionSurveyPromptState> =>
    request<SatisfactionSurveyPromptState>(
      "/surveys/satisfaction/prompt-dismissed",
      { method: "POST" },
    );

export const submitSatisfactionSurvey = (
  payload: SubmitSatisfactionSurveyPayload,
): Promise<SatisfactionSurveyResponse> =>
  request<SatisfactionSurveyResponse>("/surveys/satisfaction/responses", {
    method: "POST",
    json: payload,
  });
