export default function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}