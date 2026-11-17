import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-dvh flex-col gap-4 px-5 pt-safe" role="status" aria-label="불러오는 중">
      <Skeleton className="mt-2 h-12 rounded-2xl" />
      <Skeleton className="h-16 w-3/4 rounded-2xl" />
      <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
    </div>
  );
}
