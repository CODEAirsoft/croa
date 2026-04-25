import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { RangerScorePanel } from "@/components/ranger-score-panel";
import { SectionCard } from "@/components/section-card";
import { hasArbitrationSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RangerPage() {
  const cookieStore = await cookies();
  const hasAccess = hasArbitrationSession(cookieStore);

  if (!hasAccess) {
    return (
      <AppShell title="Controle Remoto">
        <SectionCard eyebrow="Acesso restrito" title="Painel de pontuacao">
          <p className="muted-copy">
            Entre pela area de <Link href="/arbitragem">/arbitragem</Link> para abrir o Controle Remoto.
          </p>
        </SectionCard>
      </AppShell>
    );
  }

  const [sheets, members, squads] = await Promise.all([
    prisma.gameSheet.findMany({
      where: {
        status: {
          in: ["planejado", "iniciado"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
      take: 25,
    }),
    prisma.member.findMany({
      where: {
        status: {
          not: "excluido",
        },
      },
      orderBy: {
        codiname: "asc",
      },
      select: {
        id: true,
        codiname: true,
        croaNumber: true,
        points: true,
      },
    }),
    prisma.squad.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        rankingPoints: true,
      },
    }),
  ]);

  return (
    <AppShell title="Controle Remoto">
      <div className="ops-device-warning desktop-only">
        O Controle Remoto foi desenhado para smartphone ou tablet. Para operar em PC, use a Sumula.
      </div>

      <div className="ranger-mobile-frame">
        <RangerScorePanel
          members={members.map((member) => ({
            id: member.id,
            label: `${member.codiname} - ${String(member.croaNumber).padStart(6, "0")} (${member.points} pts)`,
          }))}
          sheets={sheets.map((sheet) => ({
            id: sheet.id,
            label: `${sheet.title} - ${sheet.status}`,
          }))}
          squads={squads.map((squad) => ({
            id: squad.id,
            label: `${squad.name} (${squad.rankingPoints} pts)`,
          }))}
        />
      </div>
    </AppShell>
  );
}
