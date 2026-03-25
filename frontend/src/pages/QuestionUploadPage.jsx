import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import QuestionForm from "../components/question/QuestionForm";

export default function QuestionUploadPage() {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-white">Upload Question</h2>
      </div>

      <QuestionForm
        mode="create"
        onSuccess={() => toast.success("Question saved successfully")}
      />
    </Card>
  );
}