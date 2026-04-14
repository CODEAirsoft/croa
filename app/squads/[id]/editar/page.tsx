import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { SquadRegistrationForm } from "@/components/squad-registration-form";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatCroaCode } from "@/lib/croa";
import { formatFieldCode } from "@/lib/field-code";
import { formatMemberClass, formatMemberLevel } from "@/lib/member-display";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSquadPage({ params }: Props) {
  const cookieStore = await cookies();
  if (!hasAdministrativeSession(cookieStore)) {
    redirect("/squads");
  }

  const { id } = await params;
  const [fields, members, squad] = await Promise.all([
    prisma.field.findMany({
      orderBy: { codeNumber: "asc" },
      select: {
        id: true,
        codeNumber: true,
        countryCode: true,
        state: true,
        name: true,
      },
    }),
    prisma.member.findMany({
      orderBy: [{ codiname: "asc" }, { fullName: "asc" }],
      select: {
        id: true,
        croaNumber: true,
        codiname: true,
        memberClass: true,
        level: true,
        photoDataUrl: true,
      },
    }),
    prisma.squad.findUnique({
      where: { id },
      include: {
        assignments: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  ]);

  if (!squad) {
    notFound();
  }

  const fieldOptions = fields.map((field) => ({
    id: field.id,
    code: formatFieldCode(field.codeNumber, field.state, field.countryCode),
    name: field.name,
  }));

  const memberOptions = members.map((member) => ({
    id: member.id,
    croaCode: formatCroaCode(member.croaNumber),
    codiname: member.codiname,
    memberClassLabel: formatMemberClass(member.memberClass),
    levelLabel: formatMemberLevel(member.level),
    photoDataUrl: member.photoDataUrl ?? "",
  }));

  return (
    <main className="page-shell">
      <AppShell
        title={`Editar ${squad.name}`}
        description="Manutenção completa do squad com composição operacional, ranking e imagem oficial."
      >
        <SectionCard eyebrow="Administração" title={`Editar ${squad.name}`}>
          <SquadRegistrationForm
            allowDelete
            endpoint={`/api/squads/${squad.id}`}
            fieldOptions={fieldOptions}
            initialData={{
              id: squad.id,
              name: squad.name,
              fieldId: squad.fieldId ?? "",
              operationalClass: squad.operationalClass,
              rankingPoints: squad.rankingPoints,
              active: squad.active,
              enrollmentDate: squad.enrollmentDate ? squad.enrollmentDate.toISOString().slice(0, 10) : "",
              status: squad.status,
              photoDataUrl: squad.photoDataUrl ?? "",
              photoScale: squad.photoScale,
              photoPositionX: squad.photoPositionX,
              photoPositionY: squad.photoPositionY,
              assignments: squad.assignments.map((assignment) => ({
                memberId: assignment.memberId,
                slotType: assignment.slotType,
                position: assignment.position,
                specializations: assignment.specializations,
              })),
            }}
            memberOptions={memberOptions}
            returnHref="/squads"
            submitLabel="Salvar alterações"
            successMessage="Squad atualizado com sucesso."
          />
        </SectionCard>
      </AppShell>
    </main>
  );
}
