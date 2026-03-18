import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Card from "../ui/Card";

export default function FormulaEditor({ value = [], onChange }) {
  const addFormula = () => {
    onChange([...value, { title: "", formula: "", details: "" }]);
  };

  const updateItem = (index, field, fieldValue) => {
    const next = [...value];
    next[index][field] = fieldValue;
    onChange(next);
  };

  return (
    <Card>
      <div className="row-between">
        <h3>Formulas</h3>
        <Button onClick={addFormula}>Add Formula</Button>
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
              label="Formula"
              value={item.formula}
              onChange={(e) => updateItem(i, "formula", e.target.value)}
            />
            <Textarea
              label="Details"
              value={item.details}
              onChange={(e) => updateItem(i, "details", e.target.value)}
            />
          </Card>
        ))}
      </div>
    </Card>
  );
}