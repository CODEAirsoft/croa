import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { MembersDirectory } from "@/components/members-directory";
import {
  CROA_GHOST_NUMBER,
  MASTER_SESSION_COOKIE,
  MEMBER_VIEW_SESSION_COOKIE,
} from "@/lib/master-password";
import { prisma } from "@/lib/prisma";

export default async function MembersPage() {
  const cookieStore = await cookies();
  const hasAdministrativeAccess =
    cookieStore.get(MASTER_SESSION_COOKIE)?.value === "authorized" ||
    cookieStore.get(MEMBER_VIEW_SESSION_COOKIE)?.value === "authorized";
  const showGhostRecord = hasAdministrativeAccess;

  const members = await prisma.member.findMany({
    include: {
      field: {
        select: {
          name: true,
          codeNumber: true,
          state: true,
          countryCode: true,
        },
      },
      squad: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const visibleMembers = members.filter(
    (member) => showGhostRecord || member.croaNumber !== CROA_GHOST_NUMBER,
  );

  const directoryRows = visibleMembers.map((member) => {
    const phoneLabel =
      member.phoneNumber && member.ddi && member.ddd
        ? `+${member.ddi} (${member.ddd}) ${member.phoneNumber}`
        : member.phoneNumber ?? "-";

    const fieldLabel = member.field?.codeNumber && member.field?.state
      ? `${member.field.codeNumber}º${(member.field.countryCode ?? "").trim().toUpperCase()}${member.field.state.trim().toUpperCase()}`
      : "-";

    const searchText = [
      member.codiname,
      member.fullName,
      String(member.croaNumber).padStart(6, "0"),
      phoneLabel,
      member.rg ?? "",
      member.email ?? "",
      member.role,
      member.otherRole ?? "",
      member.memberClass,
      member.level,
      member.status,
      fieldLabel,
      member.field?.name ?? "",
      member.squad?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return {
      id: member.id,
      photoDataUrl: member.photoDataUrl,
      photoScale: member.photoScale,
      photoPositionX: member.photoPositionX,
      photoPositionY: member.photoPositionY,
      codiname: member.codiname,
      croaNumber: member.croaNumber,
      fullName: member.fullName,
      birthDateLabel: member.birthDate ? new Date(member.birthDate).toLocaleDateString("pt-BR") : "-",
      enrollmentDateLabel: member.enrollmentDate
        ? new Date(member.enrollmentDate).toLocaleDateString("pt-BR")
        : "-",
      role: member.role,
      otherRole: member.otherRole,
      memberClass: member.memberClass,
      level: member.level,
      fieldLabel,
      phoneLabel,
      rg: member.rg,
      cardHref: `/croa/${String(member.croaNumber).padStart(6, "0")}`,
      status: member.status,
      searchText,
    };
  });

  return (
    <main className="page-shell">
      <AppShell
        title="Membros e níveis"
        description={
          hasAdministrativeAccess
            ? "Lista oficial completa de operadores, comandos, árbitros, rangers e gestores cadastrados no CROA."
            : "Lista oficial resumida de membros cadastrados no CROA."
        }
      >
        <MembersDirectory authorized={hasAdministrativeAccess} rows={directoryRows} />
      </AppShell>
    </main>
  );
}
