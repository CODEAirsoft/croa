import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { SquadsDirectory } from "@/components/squads-directory";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatFieldCode } from "@/lib/field-code";
import { formatMemberStatus } from "@/lib/member-display";
import { prisma } from "@/lib/prisma";
import { formatRankingCode, squadOperationalClassLabel } from "@/lib/squad";

export default async function SquadsPage() {
  const cookieStore = await cookies();
  const hasAdministrativeAccess = hasAdministrativeSession(cookieStore);

  const squads = await prisma.squad.findMany({
    include: {
      field: {
        select: {
          codeNumber: true,
          countryCode: true,
          state: true,
          name: true,
        },
      },
      leader: {
        select: {
          croaNumber: true,
          codiname: true,
          fullName: true,
        },
      },
      assignments: {
        select: {
          id: true,
          slotType: true,
        },
      },
    },
    orderBy: [{ rankingPoints: "desc" }, { name: "asc" }],
  });

  const squadRows = squads.map((squad) => ({
    id: squad.id,
    name: squad.name,
    photoDataUrl: squad.photoDataUrl ?? "",
    fieldLabel: squad.field
      ? `${formatFieldCode(squad.field.codeNumber, squad.field.state, squad.field.countryCode)} | ${squad.field.name}`
      : "Sem campo-base",
    operationalClassLabel: squadOperationalClassLabel(squad.operationalClass),
    leaderLabel: squad.leader
      ? squad.leader.codiname || squad.leader.fullName
      : "Líder não definido",
    memberCountLabel: String(squad.assignments.length),
    rankingLabel: formatRankingCode(squad.rankingPoints),
    statusLabel: formatMemberStatus(squad.status),
    status: squad.status,
    searchText: [
      squad.name,
      squad.field?.name ?? "",
      squad.field ? formatFieldCode(squad.field.codeNumber, squad.field.state, squad.field.countryCode) : "",
      squad.leader?.codiname ?? "",
      squad.leader?.fullName ?? "",
      squadOperationalClassLabel(squad.operationalClass),
      formatRankingCode(squad.rankingPoints),
      formatMemberStatus(squad.status),
      String(squad.assignments.length),
    ]
      .join(" ")
      .toLowerCase(),
  }));

  return (
    <main className="page-shell">
      <AppShell
        title="Squads e ranking"
        description={
          hasAdministrativeAccess
            ? "Lista oficial completa dos squads cadastrados, com leitura administrativa e edição ativa."
            : "Lista oficial resumida dos squads cadastrados no CROA."
        }
      >
        <SquadsDirectory authorized={hasAdministrativeAccess} rows={squadRows} />
      </AppShell>
    </main>
  );
}
