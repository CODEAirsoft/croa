import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { OfferingsDirectory } from "@/components/offerings-directory";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatFieldCode } from "@/lib/field-code";
import { buildReservationLink, formatDateLabel, formatDateTimeLabel, formatRecurrenceLabel, getNextRecurringDate } from "@/lib/offerings";
import { prisma } from "@/lib/prisma";

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const hasAdministrativeAccess = hasAdministrativeSession(cookieStore);

  const items = await prisma.courseRecord.findMany({
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
    const nextOccurrence = item.recurringEnabled ? getNextRecurringDate(item.startAt, item.recurrenceFrequency) : null;

    return {
      id: item.id,
      title: item.title,
      category: item.category || "Curso",
      summary: item.summary || item.description || "Sem resumo cadastrado.",
      placeLabel,
      dateLabel: item.recurringEnabled
        ? `Curso recorrente · ${formatRecurrenceLabel(item.recurrenceFrequency)} · Próxima: ${formatDateTimeLabel(nextOccurrence ?? item.startAt)}`
        : item.endAt
          ? `${formatDateTimeLabel(item.startAt)} até ${formatDateTimeLabel(item.endAt)}`
          : formatDateTimeLabel(item.startAt),
      deadlineLabel: formatDateLabel(item.registrationDeadline),
      priceLabel: item.priceLabel || "Consulte a organização",
      seatsLabel: item.totalSeats > 0
        ? `${Math.max(item.totalSeats - item.reservedSlots, 0)} disponíveis / ${item.totalSeats}`
        : "Vagas livres",
      reserveHref: buildReservationLink({
        kindLabel: "Curso",
        title: item.title,
        startAt: nextOccurrence ?? item.startAt,
        placeLabel,
        customMessage: item.whatsappMessage,
      }),
      reserveLabel: item.reservationLabel || "Reservar vaga",
      imageSrc: item.photoDataUrl || "/cadastro-campos.png",
      searchText: [item.title, item.category || "", item.summary || "", placeLabel, item.priceLabel || "", item.instructorName || ""]
        .join(" ")
        .toLowerCase(),
    };
  });

  return (
    <main className="page-shell">
      <AppShell title="Cursos e formação" description="Agenda oficial de avaliações, certificações, workshops e formações do CROA.">
        <OfferingsDirectory authorized={hasAdministrativeAccess} editHrefBase="/cursos" kindLabel="Cursos" rows={rows} />
      </AppShell>
    </main>
  );
}
