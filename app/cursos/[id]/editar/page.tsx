import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CourseRegistrationForm } from "@/components/course-registration-form";
import { SectionCard } from "@/components/section-card";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatFieldCode } from "@/lib/field-code";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditCoursePage({ params }: Props) {
  const cookieStore = await cookies();
  if (!hasAdministrativeSession(cookieStore)) {
    redirect("/cursos");
  }

  const { id } = await params;
  const [course, fields] = await Promise.all([
    prisma.courseRecord.findUnique({ where: { id } }),
    prisma.field.findMany({
      orderBy: { codeNumber: "asc" },
      select: { id: true, codeNumber: true, countryCode: true, state: true, name: true },
    }),
  ]);

  if (!course) notFound();

  const fieldOptions = fields.map((field) => ({
    id: field.id,
    label: `${formatFieldCode(field.codeNumber, field.state, field.countryCode)} | ${field.name}`,
  }));

  return (
    <main className="page-shell">
      <AppShell title={`Editar ${course.title}`} description="Atualize a agenda e os dados oficiais do curso.">
        <SectionCard eyebrow="Administração" title={`Editar ${course.title}`}>
          <CourseRegistrationForm
            allowDelete
            endpoint={`/api/cursos/${course.id}`}
            fieldOptions={fieldOptions}
            initialData={{
              id: course.id,
              title: course.title,
              category: course.category,
              summary: course.summary ?? "",
              description: course.description ?? "",
              instructorName: course.instructorName ?? "",
              workloadLabel: course.workloadLabel ?? "",
              targetLevel: course.targetLevel ?? "",
              targetClass: course.targetClass ?? "",
              city: course.city ?? "",
              state: course.state ?? "",
              startAt: course.startAt.toISOString().slice(0, 16),
              endAt: course.endAt ? course.endAt.toISOString().slice(0, 16) : "",
              registrationDeadline: course.registrationDeadline ? course.registrationDeadline.toISOString().slice(0, 16) : "",
              recurringEnabled: course.recurringEnabled,
              recurrenceFrequency: course.recurrenceFrequency ?? "semanal",
              totalSeats: course.totalSeats,
              reservedSlots: course.reservedSlots,
              priceLabel: course.priceLabel ?? "",
              reservationLabel: course.reservationLabel ?? "Reservar vaga",
              whatsappMessage: course.whatsappMessage ?? "",
              fieldId: course.fieldId ?? "",
              photoDataUrl: course.photoDataUrl ?? "",
              photoScale: course.photoScale,
              photoPositionX: course.photoPositionX,
              photoPositionY: course.photoPositionY,
              active: course.active,
            }}
            returnHref="/cursos"
            submitLabel="Salvar alterações"
            successMessage="Curso atualizado com sucesso."
          />
        </SectionCard>
      </AppShell>
    </main>
  );
}
