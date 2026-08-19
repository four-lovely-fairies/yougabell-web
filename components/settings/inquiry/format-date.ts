/** 문의 목록·상세 공통 날짜 표기. 서버가 준 ISO 문자열을 로컬 날짜로 보여준다. */
export function formatInquiryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
