import { AppShell } from "@/components/app-shell";
import { MemberRegistrationForm } from "@/components/member-registration-form";
import { SectionCard } from "@/components/section-card";
import { prisma } from "@/lib/prisma";

export default async function MemberRegistrationPage() {
  const [members, fields] = await Promise.all([
    prisma.member.findMany({
      select: {
        croaNumber: true,
      },
    }),
    prisma.field.findMany({
      select: {
        id: true,
        name: true,
        codeNumber: true,
        state: true,
      },
      orderBy: {
        codeNumber: "asc",
      },
    }),
  ]);

  const nextCroaNumber = members.reduce((maxValue, member) => {
    const croaNumber = member.croaNumber ?? 0;
    return Math.max(maxValue, croaNumber);
  }, 0) + 1;

  return (
    <main className="page-shell">
      <AppShell
        title="Cadastro de membros"
        description="Formulário administrativo para criar registros oficiais de operadores no CROA."
      >
        <SectionCard eyebrow="Cadastro" title="Novo registro de membro">
          <MemberRegistrationForm
            fields={fields.map((field) => ({
              id: field.id,
              label: `${field.codeNumber}º CODE ${field.state}`,
            }))}
            nextCroaNumber={nextCroaNumber}
          />
        </SectionCard>
      </AppShell>
    </main>
  );
}
