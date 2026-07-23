import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background p-5 lg:p-8">
      <Skeleton className="mb-8 h-12 w-56 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-32 rounded-2xl" />)}
      </div>
      <Skeleton className="mt-6 h-80 rounded-2xl" />
    </main>
  );
}