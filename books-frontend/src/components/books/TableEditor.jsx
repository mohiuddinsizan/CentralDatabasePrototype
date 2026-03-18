import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";

function makeEmptyRow(columnCount) {
  return {
    cells: Array.from({ length: columnCount }, () => ({ value: "" })),
  };
}

export default function TableEditor({ value = [], onChange }) {
  const addTable = () => {
    onChange([
      ...value,
      {
        title: "",
        columns: ["Column 1", "Column 2"],
        rows: [makeEmptyRow(2)],
      },
    ]);
  };

  const updateAll = (next) => onChange(next);

  const updateTableTitle = (tableIndex, nextTitle) => {
    const next = [...value];
    next[tableIndex].title = nextTitle;
    updateAll(next);
  };

  const updateColumnName = (tableIndex, colIndex, nextValue) => {
    const next = [...value];
    next[tableIndex].columns[colIndex] = nextValue;
    updateAll(next);
  };

  const addColumn = (tableIndex) => {
    const next = [...value];
    next[tableIndex].columns.push(`Column ${next[tableIndex].columns.length + 1}`);
    next[tableIndex].rows = next[tableIndex].rows.map((row) => ({
      ...row,
      cells: [...row.cells, { value: "" }],
    }));
    updateAll(next);
  };

  const removeColumn = (tableIndex, colIndex) => {
    const next = [...value];
    if (next[tableIndex].columns.length <= 1) return;

    next[tableIndex].columns.splice(colIndex, 1);
    next[tableIndex].rows = next[tableIndex].rows.map((row) => ({
      ...row,
      cells: row.cells.filter((_, idx) => idx !== colIndex),
    }));
    updateAll(next);
  };

  const addRow = (tableIndex) => {
    const next = [...value];
    next[tableIndex].rows.push(makeEmptyRow(next[tableIndex].columns.length));
    updateAll(next);
  };

  const removeRow = (tableIndex, rowIndex) => {
    const next = [...value];
    if (next[tableIndex].rows.length <= 1) return;
    next[tableIndex].rows.splice(rowIndex, 1);
    updateAll(next);
  };

  const updateCell = (tableIndex, rowIndex, cellIndex, nextValue) => {
    const next = [...value];
    next[tableIndex].rows[rowIndex].cells[cellIndex].value = nextValue;
    updateAll(next);
  };

  const removeTable = (tableIndex) => {
    updateAll(value.filter((_, idx) => idx !== tableIndex));
  };

  return (
    <Card>
      <div className="row-between">
        <h3>Tables</h3>
        <Button onClick={addTable}>Add Table</Button>
      </div>

      <div className="stack mt-16">
        {value.length === 0 ? (
          <div className="muted">No tables added yet.</div>
        ) : (
          value.map((table, tableIndex) => (
            <Card key={tableIndex}>
              <div className="row-between">
                <div style={{ flex: 1 }}>
                  <Input
                    label="Table Title"
                    value={table.title}
                    onChange={(e) => updateTableTitle(tableIndex, e.target.value)}
                    placeholder="Enter table title"
                  />
                </div>

                <div className="table-top-actions">
                  <Button variant="secondary" onClick={() => addColumn(tableIndex)}>
                    Add Column
                  </Button>
                  <Button variant="secondary" onClick={() => addRow(tableIndex)}>
                    Add Row
                  </Button>
                  <Button variant="secondary" onClick={() => removeTable(tableIndex)}>
                    Remove Table
                  </Button>
                </div>
              </div>

              <div className="real-table-wrap mt-16">
                <table className="real-table">
                  <thead>
                    <tr>
                      {table.columns.map((col, colIndex) => (
                        <th key={colIndex}>
                          <div className="table-head-cell">
                            <input
                              className="table-inline-input"
                              value={col}
                              onChange={(e) =>
                                updateColumnName(tableIndex, colIndex, e.target.value)
                              }
                            />
                            <button
                              type="button"
                              className="table-mini-btn"
                              onClick={() => removeColumn(tableIndex, colIndex)}
                            >
                              ×
                            </button>
                          </div>
                        </th>
                      ))}
                      <th className="table-action-col">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.cells.map((cell, cellIndex) => (
                          <td key={cellIndex}>
                            <input
                              className="table-inline-input"
                              value={cell.value}
                              onChange={(e) =>
                                updateCell(
                                  tableIndex,
                                  rowIndex,
                                  cellIndex,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        ))}
                        <td className="table-action-cell">
                          <button
                            type="button"
                            className="table-mini-btn"
                            onClick={() => removeRow(tableIndex, rowIndex)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}