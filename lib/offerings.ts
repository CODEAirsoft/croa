const WHATSAPP_PHONE = "5511937636380";

export const eventCategoryOptions = [
  "Operação",
  "Jogo IN",
  "Jogo OUT",
  "Torneio",
  "Competição",
  "Campeonato",
  "BIG Game",
  "Operação SCA",
  "Jogo Solidário",
  "Treino",
  "Avaliação",
  "Outro",
] as const;

export const courseCategoryOptions = [
  "Avaliação N1",
  "Avaliação N2",
  "Avaliação N3",
  "Avaliação N4",
  "Avaliação N5",
  "Exame Classe Standard",
  "Exame Classe Premium",
  "Exame Classe Top Team",
  "Exame Classe Master",
  "Exame Classe Almighty",
  "Workshop",
  "Palestra",
  "Treino",
  "Outro",
] as const;

export const recurrenceFrequencyOptions = [
  { value: "diaria", label: "Diária" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
] as const;

export function formatDateTimeLabel(value?: Date | string | null) {
  if (!value) return "A definir";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "A definir";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateLabel(value?: Date | string | null) {
  if (!value) return "A definir";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "A definir";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function buildReservationLink({
  kindLabel,
  title,
  startAt,
  placeLabel,
  customMessage,
}: {
  kindLabel: string;
  title: string;
  startAt?: Date | string | null;
  placeLabel?: string | null;
  customMessage?: string | null;
}) {
  const message =
    customMessage?.trim() ||
    `Olá! Tenho interesse em reservar vaga para ${kindLabel.toLowerCase()} "${title}"${startAt ? ` em ${formatDateTimeLabel(startAt)}` : ""}${placeLabel ? ` no local ${placeLabel}` : ""}.`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function sanitizeInteger(value: unknown, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(/[^\d-]/g, ""));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.round(parsed));
}

export function parseCurrencyInput(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatCurrencyValue(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getNextRecurringDate(startAt: Date | string | null | undefined, frequency?: string | null) {
  if (!startAt || !frequency) return null;
  const base = typeof startAt === "string" ? new Date(startAt) : new Date(startAt);
  if (Number.isNaN(base.getTime())) return null;

  const now = new Date();
  const next = new Date(base);

  while (next < now) {
    if (frequency === "diaria") next.setDate(next.getDate() + 1);
    else if (frequency === "semanal") next.setDate(next.getDate() + 7);
    else if (frequency === "mensal") next.setMonth(next.getMonth() + 1);
    else return new Date(base);
  }

  return next;
}

export function formatRecurrenceLabel(frequency?: string | null) {
  const option = recurrenceFrequencyOptions.find((item) => item.value === frequency);
  return option?.label ?? "Recorrente";
}
