import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-white/56 bg-[rgba(255,255,255,0.18)] px-4 py-3 text-sm font-semibold text-[#352b21] outline-none shadow-[0_10px_24px_rgba(60,52,42,0.06),inset_0_1px_0_rgba(255,255,255,0.64)] backdrop-blur-2xl transition placeholder:text-[#8f7d69] focus:border-white/76 focus:ring-4 focus:ring-[rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-[rgba(255,255,255,0.06)] dark:text-[#f6f0e8] dark:placeholder:text-[#af9f8c] dark:focus:ring-[rgba(255,255,255,0.06)]",
        className
      )}
      {...props}
    />
  );
}
