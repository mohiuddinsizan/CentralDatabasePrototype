const LABELS = {
  boardAnalysis: "Board Analysis",
  tables: "Tables",
  formulas: "Formulas",
  videos: "Videos",
  figures: "Figures",
  selectedQuestions: "Question Answer",
};

export default function SectionBadge({ value }) {
  return <span className="badge">{LABELS[value] || value}</span>;
}