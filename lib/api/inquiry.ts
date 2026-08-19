import type { components } from "../generated/api-types";
import { request } from "./client";

export type Inquiry = components["schemas"]["InquiryResponseDto"];
export type InquiryListItem = components["schemas"]["InquiryListItemDto"];
export type InquiryListResponse =
  components["schemas"]["InquiryListResponseDto"];
export type CreateInquiryBody = components["schemas"]["CreateInquiryDto"];

export type InquiryCategory = NonNullable<Inquiry["category"]>;
export type InquiryStatus = Inquiry["status"];

/** 작성 화면 유형 선택지. enum 순서를 그대로 노출한다. */
export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  service_error: "오류·장애",
  account: "계정·로그인",
  content: "콘텐츠·미션·로드맵",
  suggestion: "개선 제안",
  etc: "기타",
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  received: "접수됨",
  in_progress: "확인 중",
  answered: "답변 완료",
};

export const listInquiries = (params?: {
  page?: number;
  limit?: number;
}): Promise<InquiryListResponse> => {
  const search = new URLSearchParams();
  if (params?.page !== undefined) search.set("page", String(params.page));
  if (params?.limit !== undefined) search.set("limit", String(params.limit));
  const query = search.toString();
  return request<InquiryListResponse>(
    query ? `/inquiries?${query}` : "/inquiries",
  );
};

export const getInquiry = (id: string): Promise<Inquiry> =>
  request<Inquiry>(`/inquiries/${id}`);

export const createInquiry = (body: CreateInquiryBody): Promise<Inquiry> =>
  request<Inquiry>("/inquiries", { method: "POST", json: body });
