import { AppShell } from "@/components/app-shell";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { SectionCard } from "@/components/section-card";
import { formatFieldCode } from "@/lib/field-code";
import { prisma } from "@/lib/prisma";

export default async function EventRegistrationPage() {
  const fields = await prisma.field.findMany({
    orderBy: { codeNumber: "asc" },
    select: {
      id: true,
      codeNumber: true,
      countryCode: true,
      state: true,
      name: true,
      fullAddress: true,
    },
  });

  const fieldOptions = fields.map((field) => ({
    id: field.id,
    label: `${formatFieldCode(field.codeNumber, field.state, field.countryCode)} | ${field.name}`,
    name: field.name,
    fullAddress: field.fullAddress ?? "",
  }));

  return (
    <main className="page-shell">
      <AppShell title="Cadastro de eventos" description="Cadastro administrativo de operações, jogos, torneios e ações esportivas do CROA.">
        <SectionCard eyebrow="Cadastro" title="Novo registro de evento">
          <EventRegistrationForm fieldOptions={fieldOptions} />
        </SectionCard>
      </AppShell>
    </main>
  );
}
