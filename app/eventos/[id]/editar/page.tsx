import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { SectionCard } from "@/components/section-card";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatFieldCode } from "@/lib/field-code";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const cookieStore = await cookies();
  if (!hasAdministrativeSession(cookieStore)) {
    redirect("/eventos");
  }

  const { id } = await params;
  const [event, fields] = await Promise.all([
    prisma.eventRecord.findUnique({ where: { id } }),
    prisma.field.findMany({
      orderBy: { codeNumber: "asc" },
      select: { id: true, codeNumber: true, countryCode: true, state: true, name: true, fullAddress: true },
    }),
  ]);

  if (!event) notFound();

  const fieldOptions = fields.map((field) => ({
    id: field.id,
    label: `${formatFieldCode(field.codeNumber, field.state, field.countryCode)} | ${field.name}`,
    name: field.name,
    fullAddress: field.fullAddress ?? "",
  }));

  return (
    <main className="page-shell">
      <AppShell title={`Editar ${event.title}`} description="Atualize a agenda e as informações oficiais do evento.">
        <SectionCard eyebrow="Administração" title={`Editar ${event.title}`}>
          <EventRegistrationForm
            allowDelete
            endpoint={`/api/eventos/${event.id}`}
            fieldOptions={fieldOptions}
            initialData={{
              id: event.id,
              title: event.title,
              type: event.type,
              category: event.category ?? "",
              summary: event.summary ?? "",
              description: event.description ?? "",
              organizerName: event.organizerName ?? "",
              city: event.city ?? "",
              state: event.state ?? "",
              startAt: event.startAt.toISOString().slice(0, 16),
              endAt: event.endAt ? event.endAt.toISOString().slice(0, 16) : "",
              registrationDeadline: event.registrationDeadline ? event.registrationDeadline.toISOString().slice(0, 16) : "",
              recurringEnabled: event.recurringEnabled,
              recurrenceFrequency: event.recurrenceFrequency ?? "semanal",
              maxParticipants: event.maxParticipants,
              reservedSlots: event.reservedSlots,
              priceLabel: event.priceLabel ?? "",
              equipmentRentalLabel: event.equipmentRentalLabel ?? "",
              discountPercent: event.discountPercent,
              reservationLabel: event.reservationLabel ?? "Reservar vaga",
              whatsappMessage: event.whatsappMessage ?? "",
              fieldId: event.fieldId ?? "",
              photoDataUrl: event.photoDataUrl ?? "",
              photoScale: event.photoScale,
              photoPositionX: event.photoPositionX,
              photoPositionY: event.photoPositionY,
              status: event.status,
            }}
            returnHref="/eventos"
            submitLabel="Salvar alterações"
            successMessage="Evento atualizado com sucesso."
          />
        </SectionCard>
      </AppShell>
    </main>
  );
}
