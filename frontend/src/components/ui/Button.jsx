import { cn } from "../../utils/cn";

export default function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}) {
  const styles = {
    primary:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    secondary:
      "bg-white/8 text-white hover:bg-white/12 border border-white/10",
    danger:
      "bg-red-500 text-white hover:bg-red-400",
    ghost:
      "bg-transparent text-slate-300 hover:bg-white/8",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}