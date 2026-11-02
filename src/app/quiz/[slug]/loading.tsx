import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 pt-8" aria-busy="true" aria-label="Loading quiz">
      <Skeleton className="size-[104px] rounded-full" />
      <Skeleton className="mt-4 h-4 w-48" />
      <Skeleton className="mt-3 h-9 w-72" />
      <Skeleton className="mt-3 h-4 w-40" />
      <Skeleton className="mt-16 h-16 w-full rounded-2xl" />
    </div>
  );
}
