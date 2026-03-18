import { cn } from "../../utils/cn";

export default function Badge({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-300",
        className
      )}
    >
      {children}
    </span>
  );
}