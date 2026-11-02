import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 pt-8" aria-busy="true" aria-label="Loading result">
      <Skeleton className="h-6 w-56" />
      <Skeleton className="mt-6 h-24 w-40" />
      <Skeleton className="mt-4 h-8 w-52" />
      <Skeleton className="mt-3 h-5 w-64" />
      <Skeleton className="mt-10 h-20 w-full rounded-3xl" />
      <Skeleton className="mt-4 h-16 w-full" />
    </div>
  );
}
