import { cn } from "../../lib/utils";

const variants = {
  primary:
    "border border-blue-600 bg-blue-600 !text-white shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 hover:brightness-110",
  secondary:
    "border border-black/10 bg-white/70 text-slate-900 shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 hover:brightness-105",
  outline:
    "border border-slate-300/80 bg-white/65 text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:bg-white/90",
  ghost: "text-slate-800 hover:bg-black/5",
};

export function Button({ className, variant = "primary", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-[0.01em] transition duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 [&>*]:!text-inherit",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
