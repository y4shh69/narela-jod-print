import { cn } from "../../lib/utils";

const variants = {
  primary:
    "border border-white/70 bg-[linear-gradient(180deg,rgba(255,154,20,0.88),rgba(255,154,20,0.72))] text-white shadow-xl shadow-orange-500/20 backdrop-blur-xl hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(255,154,20,0.94),rgba(255,154,20,0.8))]",
  secondary:
    "border border-white/56 bg-white/24 text-slate-950 shadow-lg shadow-slate-200/18 backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white/34",
  outline:
    "border border-white/42 bg-white/14 text-slate-800 backdrop-blur-xl hover:bg-white/22 hover:text-slate-950",
  ghost: "text-slate-800 hover:bg-white/10 hover:text-slate-950",
};

export function Button({ className, variant = "primary", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold tracking-[0.01em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
