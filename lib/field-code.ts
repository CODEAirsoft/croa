export function formatFieldCode(codeNumber: number, state: string, countryCode = "BR") {
  const normalizedNumber = Number.isFinite(codeNumber) && codeNumber > 0 ? Math.trunc(codeNumber) : 1;
  const normalizedState = state.trim().toUpperCase() || "SP";
  const normalizedCountry = countryCode.trim().toUpperCase() || "BR";

  return `${normalizedNumber}\u00BA${normalizedCountry}${normalizedState}`;
}
