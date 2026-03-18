export default function Button({
  children,
  type = "button",
  className = "",
  variant = "primary",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}