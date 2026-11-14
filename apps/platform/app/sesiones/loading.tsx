import { Skeleton } from "@/components/ui/Skeleton";

export default function SesionesLoading() {
  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-screen">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <Skeleton className="h-7 w-52 rounded-lg" />
        </div>

        <div className="flex gap-6 border-b border-slate-200/80 pb-3">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-5 w-28 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
