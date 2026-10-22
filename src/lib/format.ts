// List numbering: 1 → "01".
export function pad2(n: number) {
  return String(n).padStart(2, "0");
}
