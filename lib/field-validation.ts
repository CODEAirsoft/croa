export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function isValidCnpj(value: string) {
  return onlyDigits(value).length === 14;
}

export function formatDdi(value: string) {
  return onlyDigits(value).slice(0, 2);
}

export function formatDdd(value: string) {
  return onlyDigits(value).slice(0, 2);
}

export function formatPhoneInternational(value: string) {
  return onlyDigits(value).slice(0, 12);
}

export function isValidStructuredPhone(ddi: string, ddd: string, number: string) {
  return onlyDigits(ddi).length === 2 && onlyDigits(ddd).length === 2 && onlyDigits(number).length >= 8;
}

export function formatRg(value: string) {
  const cleaned = value.toUpperCase().replace(/[^0-9X]/g, "").slice(0, 9);

  if (cleaned.length <= 2) {
    return cleaned;
  }

  if (cleaned.length <= 5) {
    return cleaned.replace(/^(\d{2})([0-9X]+)/, "$1.$2");
  }

  if (cleaned.length <= 8) {
    return cleaned.replace(/^(\d{2})(\d{3})([0-9X]+)/, "$1.$2.$3");
  }

  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})([0-9X])/, "$1.$2.$3-$4");
}

export function isValidRg(value: string) {
  const cleaned = value.toUpperCase().replace(/[^0-9X]/g, "");
  return cleaned.length >= 7 && cleaned.length <= 9;
}
