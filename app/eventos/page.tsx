import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { OfferingsDirectory } from "@/components/offerings-directory";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatFieldCode } from "@/lib/field-code";
import {
  buildReservationLink,
  formatCurrencyValue,
  formatDateLabel,
  formatDateTimeLabel,
  formatRecurrenceLabel,
  getNextRecurringDate,
  parseCurrencyInput,
} from "@/lib/offerings";
import { prisma } from "@/lib/prisma";

export default async function EventsPage() {
  const cookieStore = await cookies();
  const hasAdministrativeAccess = hasAdministrativeSession(cookieStore);

  const items = await prisma.eventRecord.findMany({
    include: {
      field: {
        select: {
          codeNumber: true,
          countryCode: true,
          state: true,
          name: true,
        },
      },
    },
    orderBy: [{ startAt: "asc" }, { title: "asc" }],
  });

  const rows = items.map((item) => {
    const placeLabel = item.field
      ? `${formatFieldCode(item.field.codeNumber, item.field.state, item.field.countryCode)} | ${item.field.name}`
      : [item.city, item.state].filter(Boolean).join(" / ") || "Local a definir";

    const parsedValue = parseCurrencyInput(item.priceLabel ?? "");
    const discountedValue =
      parsedValue !== null && item.discountPercent > 0
        ? formatCurrencyValue(parsedValue * (1 - item.discountPercent / 100))
        : null;

    const nextOccurrence = item.recurringEnabled ? getNextRecurringDate(item.startAt, item.recurrenceFrequency) : null;
    const dateLabel = item.recurringEnabled
      ? `Evento recorrente · ${formatRecurrenceLabel(item.recurrenceFrequency)} · Próxima: ${formatDateTimeLabel(nextOccurrence ?? item.startAt)}`
      : item.endAt
        ? `${formatDateTimeLabel(item.startAt)} até ${formatDateTimeLabel(item.endAt)}`
        : formatDateTimeLabel(item.startAt);

    return {
      id: item.id,
      title: item.title,
      category: item.category || "Evento",
      summary: item.summary || item.description || "Sem resumo cadastrado.",
      placeLabel,
      dateLabel,
      deadlineLabel: formatDateLabel(item.registrationDeadline),
      priceLabel: discountedValue
        ? `${discountedValue} (${item.discountPercent}% off)`
        : item.priceLabel || "Consulte a organização",
      seatsLabel: item.maxParticipants > 0
        ? `${Math.max(item.maxParticipants - item.reservedSlots, 0)} disponíveis / ${item.maxParticipants}`
        : "Vagas livres",
      reserveHref: buildReservationLink({
        kindLabel: "Evento",
        title: item.title,
        startAt: nextOccurrence ?? item.startAt,
        placeLabel,
        customMessage: item.whatsappMessage,
      }),
      reserveLabel: item.reservationLabel || "Reservar vaga",
      imageSrc: item.photoDataUrl || "/cadastro-campos.png",
      searchText: [item.title, item.category || "", item.summary || "", placeLabel, item.priceLabel || "", item.organizerName || ""]
        .join(" ")
        .toLowerCase(),
    };
  });

  return (
    <main className="page-shell">
      <AppShell title="Eventos e operações" description="Programação oficial de eventos, jogos e ações esportivas do CROA.">
        <OfferingsDirectory authorized={hasAdministrativeAccess} editHrefBase="/eventos" kindLabel="Eventos" rows={rows} />
      </AppShell>
    </main>
  );
}
