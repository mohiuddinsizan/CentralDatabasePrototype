import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  text = "Are you sure?",
  onClose,
  onConfirm,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-slate-300">{text}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}