import { cn } from "../../utils/cn";

export default function Card({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}