import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { FieldRegistrationForm } from "@/components/field-registration-form";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function memberLabel(member: { fullName: string; croaNumber: number }) {
  return member.fullName;
}

export default async function EditFieldPage({ params }: Props) {
  const cookieStore = await cookies();
  if (!hasAdministrativeSession(cookieStore)) {
    redirect("/campos");
  }

  const { id } = await params;
  const [field, members] = await Promise.all([
    prisma.field.findUnique({ where: { id } }),
    prisma.member.findMany({
      where: {
        status: {
          not: "excluido",
        },
      },
      select: {
        id: true,
        fullName: true,
        croaNumber: true,
        role: true,
      },
      orderBy: [{ croaNumber: "asc" }, { fullName: "asc" }],
    }),
  ]);

  if (!field) {
    notFound();
  }

  const managers = members
    .filter((member) => ["admin", "fundador", "presidente", "professor", "instrutor", "gestor"].includes(member.role))
    .map((member) => ({ id: member.id, label: memberLabel(member) }));

  const referees = members
    .filter((member) => member.role === "arbitro")
    .map((member) => ({ id: member.id, label: memberLabel(member) }));

  const rangers = members
    .filter((member) => member.role === "ranger")
    .map((member) => ({ id: member.id, label: memberLabel(member) }));

  return (
    <main className="page-shell">
      <AppShell
        title={`Editar ${field.name || "Campo"}`}
        description="Atualize o cadastro oficial do campo no mesmo padrão visual do formulário de criação."
      >
        <section className="card section-card">
          <FieldRegistrationForm
            allowDelete
            endpoint={`/api/campos/${field.id}`}
            initialData={{
              id: field.id,
              codeNumber: field.codeNumber,
              name: field.name ?? "",
              cnpj: field.cnpj ?? "",
              fullAddress: field.fullAddress ?? "",
              ownerName: field.ownerName ?? "",
              contactPhone: field.contactPhone ?? "",
              website: field.website ?? "",
              instagram: field.instagram ?? "",
              facebook: field.facebook ?? "",
              operatorId: field.operatorId ?? "",
              registrationDate: field.registrationDate ? field.registrationDate.toISOString().slice(0, 10) : "",
              contractValidUntil: field.contractValidUntil ? field.contractValidUntil.toISOString().slice(0, 10) : "",
              refereeId: field.refereeId ?? "",
              firstRangerId: field.firstRangerId ?? "",
              secondRangerId: field.secondRangerId ?? "",
              countryCode: field.countryCode ?? "BR",
              state: field.state ?? "SP",
              photoDataUrl: field.photoDataUrl ?? "",
              photoScale: field.photoScale ?? 100,
              photoPositionX: field.photoPositionX ?? 50,
              photoPositionY: field.photoPositionY ?? 50,
            }}
            managers={managers}
            nextFieldCodeNumber={field.codeNumber}
            rangers={rangers}
            referees={referees}
            returnHref="/campos"
            submitLabel="Salvar alterações"
            successMessage="Campo atualizado com sucesso."
          />
        </section>
      </AppShell>
    </main>
  );
}
