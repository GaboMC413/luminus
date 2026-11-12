import { Skeleton } from "@/components/ui/Skeleton";

export default function EspaciosLoading() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col items-center justify-center">
      <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center shadow-xs">
        <Skeleton className="w-16 h-16 rounded-2xl mb-5" />
        <Skeleton className="w-28 h-3.5 rounded-full mb-3" />
        <Skeleton className="w-64 h-8 rounded-lg mb-4" />
        <Skeleton className="w-full max-w-md h-4 rounded mb-2" />
        <Skeleton className="w-full max-w-sm h-4 rounded mb-8" />
        <Skeleton className="w-52 h-11 rounded-xl mb-8" />
        <div className="w-full pt-6 border-t border-slate-100 flex flex-col items-center gap-2.5">
          <Skeleton className="w-48 h-3.5 rounded" />
          <Skeleton className="w-56 h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
