import { AppShell } from "@/components/app-shell";
import { CourseRegistrationForm } from "@/components/course-registration-form";
import { SectionCard } from "@/components/section-card";
import { formatFieldCode } from "@/lib/field-code";
import { prisma } from "@/lib/prisma";

export default async function CourseRegistrationPage() {
  const fields = await prisma.field.findMany({
    orderBy: { codeNumber: "asc" },
    select: {
      id: true,
      codeNumber: true,
      countryCode: true,
      state: true,
      name: true,
    },
  });

  const fieldOptions = fields.map((field) => ({
    id: field.id,
    label: `${formatFieldCode(field.codeNumber, field.state, field.countryCode)} | ${field.name}`,
  }));

  return (
    <main className="page-shell">
      <AppShell title="Cadastro de cursos" description="Cadastro administrativo de avaliações, exames, workshops, palestras e trilhas do CROA.">
        <SectionCard eyebrow="Cadastro" title="Novo registro de curso">
          <CourseRegistrationForm fieldOptions={fieldOptions} />
        </SectionCard>
      </AppShell>
    </main>
  );
}
