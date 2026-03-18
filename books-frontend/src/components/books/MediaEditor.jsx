import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Card from "../ui/Card";

export default function MediaEditor({ title, value = [], onChange }) {
  const addItem = () => {
    onChange([...value, { title: "", url: "", description: "" }]);
  };

  const updateItem = (index, field, fieldValue) => {
    const next = [...value];
    next[index][field] = fieldValue;
    onChange(next);
  };

  return (
    <Card>
      <div className="row-between">
        <h3>{title}</h3>
        <Button onClick={addItem}>Add {title.slice(0, -1)}</Button>
      </div>

      <div className="stack mt-16">
        {value.map((item, i) => (
          <Card key={i}>
            <Input
              label="Title"
              value={item.title}
              onChange={(e) => updateItem(i, "title", e.target.value)}
            />
            <Input
              label="URL"
              value={item.url}
              onChange={(e) => updateItem(i, "url", e.target.value)}
            />
            <Textarea
              label="Description"
              value={item.description}
              onChange={(e) => updateItem(i, "description", e.target.value)}
            />
          </Card>
        ))}
      </div>
    </Card>
  );
}