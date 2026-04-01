import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("glass rounded-2xl border border-white/30 shadow-lg shadow-slate-200/18", className)} {...props} />;
}
