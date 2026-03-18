import Card from "./Card";

export default function TableShell({ children }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}