import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 outline-none shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition placeholder:text-slate-500 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/15",
        className
      )}
      {...props}
    />
  );
}
