import { INQUIRY_STATUS_LABELS, type InquiryStatus } from "@/lib/api/inquiry";
import { cn } from "@/lib/utils";

// 색만으로 상태를 구분하지 않도록 라벨 텍스트를 항상 함께 노출한다 (접근성).
const STATUS_STYLES: Record<InquiryStatus, string> = {
  received: "bg-info-50 text-info-700",
  in_progress: "bg-warning-50 text-warning-800",
  answered: "bg-success-50 text-success-500",
};

type Props = {
  status: InquiryStatus;
};

export function InquiryStatusBadge({ status }: Props) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {INQUIRY_STATUS_LABELS[status]}
    </span>
  );
}
