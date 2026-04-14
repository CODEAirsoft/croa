import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { FieldsDirectory } from "@/components/fields-directory";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatFieldCode } from "@/lib/field-code";
import { prisma } from "@/lib/prisma";

export default async function FieldsPage() {
  const cookieStore = await cookies();
  const hasAdministrativeAccess = hasAdministrativeSession(cookieStore);

  const fields = await prisma.field.findMany({
    include: {
      operator: {
        select: {
          croaNumber: true,
          codiname: true,
          fullName: true,
        },
      },
      referee: {
        select: {
          croaNumber: true,
          codiname: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      codeNumber: "asc",
    },
  });

  const directoryRows = fields.map((field) => {
    const managerLabel = field.ownerName?.trim() ? field.ownerName : "Não informado";
    const refereeLabel = field.referee ? field.referee.fullName : "Não vinculado";
    const codeLabel = formatFieldCode(field.codeNumber, field.state, field.countryCode);
    const contactPhone = field.contactPhone?.trim() ? field.contactPhone : "-";
    const searchText = [
      field.name,
      codeLabel,
      field.cnpj ?? "",
      managerLabel,
      refereeLabel,
      contactPhone,
      field.countryCode ?? "",
      field.state ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return {
      id: field.id,
      photoDataUrl: field.photoDataUrl,
      codeLabel,
      name: field.name,
      cnpj: field.cnpj,
      managerLabel,
      refereeLabel,
      contactPhone,
      searchText,
    };
  });

  return (
    <main className="page-shell">
      <AppShell
        title="Campos e operadores"
        description={
          hasAdministrativeAccess
            ? "Lista oficial completa dos campos cadastrados, com gestão responsável e leitura administrativa."
            : "Lista oficial resumida dos campos cadastrados no CROA."
        }
      >
        <FieldsDirectory authorized={hasAdministrativeAccess} rows={directoryRows} />
      </AppShell>
    </main>
  );
}
