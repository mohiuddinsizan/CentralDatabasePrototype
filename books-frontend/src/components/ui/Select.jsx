export default function Select({ label, children, ...props }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <select className="field-control" {...props}>
        {children}
      </select>
    </label>
  );
}