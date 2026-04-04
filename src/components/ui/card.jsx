import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "glass rounded-xl border border-black/5 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.15)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.2)]",
        className
      )}
      {...props}
    />
  );
}
