export function formatCroaCode(croaNumber: number) {
  return `CROA - ${String(croaNumber).padStart(6, "0")}`;
}
