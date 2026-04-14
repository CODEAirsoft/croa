import { AppShell } from "@/components/app-shell";
import { FieldRegistrationForm } from "@/components/field-registration-form";
import { SectionCard } from "@/components/section-card";
import { prisma } from "@/lib/prisma";

function formatMemberLabel(_croaNumber: number, _codiname: string, fullName: string) {
  return fullName;
}

export default async function FieldRegistrationPage() {
  const [fields, managers, referees, rangers] = await Promise.all([
    prisma.field.findMany({
      select: {
        codeNumber: true,
      },
    }),
    prisma.member.findMany({
      where: {
        role: {
          in: ["admin", "fundador", "presidente", "professor", "instrutor", "gestor"],
        },
        status: {
          not: "excluido",
        },
      },
      select: {
        id: true,
        croaNumber: true,
        codiname: true,
        fullName: true,
      },
      orderBy: {
        croaNumber: "asc",
      },
    }),
    prisma.member.findMany({
      where: {
        role: "arbitro",
        status: {
          not: "excluido",
        },
      },
      select: {
        id: true,
        croaNumber: true,
        codiname: true,
        fullName: true,
      },
      orderBy: {
        croaNumber: "asc",
      },
    }),
    prisma.member.findMany({
      where: {
        role: "ranger",
        status: {
          not: "excluido",
        },
      },
      select: {
        id: true,
        croaNumber: true,
        codiname: true,
        fullName: true,
      },
      orderBy: {
        croaNumber: "asc",
      },
    }),
  ]);

  const nextFieldCodeNumber =
    fields.reduce((maxValue, field) => Math.max(maxValue, field.codeNumber ?? 0), 0) + 1;

  return (
    <main className="page-shell">
      <AppShell
        title="Cadastro de campos"
        description="Formulário administrativo para preparar novos campos oficiais do CROA."
      >
        <SectionCard eyebrow="Cadastro" title="Novo registro de campo">
          <FieldRegistrationForm
            managers={managers.map((manager) => ({
              id: manager.id,
              label: formatMemberLabel(manager.croaNumber, manager.codiname, manager.fullName),
            }))}
            nextFieldCodeNumber={nextFieldCodeNumber}
            referees={referees.map((referee) => ({
              id: referee.id,
              label: formatMemberLabel(referee.croaNumber, referee.codiname, referee.fullName),
            }))}
            rangers={rangers.map((ranger) => ({
              id: ranger.id,
              label: formatMemberLabel(ranger.croaNumber, ranger.codiname, ranger.fullName),
            }))}
          />
        </SectionCard>
      </AppShell>
    </main>
  );
}
