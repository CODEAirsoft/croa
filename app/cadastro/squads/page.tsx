import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { SquadRegistrationForm } from "@/components/squad-registration-form";
import { formatCroaCode } from "@/lib/croa";
import { formatFieldCode } from "@/lib/field-code";
import { formatMemberClass, formatMemberLevel } from "@/lib/member-display";
import { prisma } from "@/lib/prisma";

export default async function SquadRegistrationPage() {
  const [fields, members] = await Promise.all([
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
  ]);

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
        title="Cadastro de squads"
        description="Formulário administrativo para montar o squad, o ranking oficial e sua composição operacional."
      >
        <SectionCard eyebrow="Cadastro" title="Novo registro de squad">
          <SquadRegistrationForm fieldOptions={fieldOptions} memberOptions={memberOptions} />
        </SectionCard>
      </AppShell>
    </main>
  );
}
