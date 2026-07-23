import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="p-5 lg:p-8">
      <Skeleton className="mb-8 h-12 w-64 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="h-52 rounded-2xl" />)}
      </div>
    </main>
  );
}