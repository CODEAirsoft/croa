import Link from "next/link";
import { cookies } from "next/headers";
import { OfficialSubclass } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { GameSheetControl } from "@/components/game-sheet-control";
import { SectionCard } from "@/components/section-card";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export default async function SumulaPage() {
  const cookieStore = await cookies();
  const hasAccess = hasAdministrativeSession(cookieStore);

  if (!hasAccess) {
    return (
      <AppShell title="Sumula">
        <SectionCard eyebrow="Acesso restrito" title="Area do arbitro">
          <p className="muted-copy">
            Entre pelo modo administrativo em <Link href="/manager">/manager</Link> para abrir a sumula dos jogos.
          </p>
        </SectionCard>
      </AppShell>
    );
  }

  const [events, squads, rangers, sheets] = await Promise.all([
    prisma.eventRecord.findMany({
      orderBy: {
        startAt: "desc",
      },
      select: {
        id: true,
        title: true,
        startAt: true,
      },
      take: 50,
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
    prisma.member.findMany({
      where: {
        status: {
          not: "excluido",
        },
        OR: [
          {
            officialSubclass: {
              in: [OfficialSubclass.RANGER, OfficialSubclass.ARBITRO, OfficialSubclass.GERENTE],
            },
          },
          {
            memberClass: {
              in: ["MASTER", "ALMIGHTY"],
            },
          },
          {
            role: {
              in: ["ranger", "arbitro", "gestor", "admin"],
            },
          },
        ],
      },
      orderBy: {
        codiname: "asc",
      },
      select: {
        id: true,
        codiname: true,
        croaNumber: true,
        role: true,
      },
    }),
    prisma.gameSheet.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        event: {
          select: {
            title: true,
          },
        },
        squads: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            score: true,
            squad: {
              select: {
                name: true,
              },
            },
          },
        },
        rangers: {
          select: {
            member: {
              select: {
                codiname: true,
              },
            },
          },
        },
      },
      take: 30,
    }),
  ]);

  return (
    <AppShell title="Sumula">
      <div className="ops-device-warning phone-only">
        A sumula do arbitro foi preparada para PC ou tablet. Em celular, use o painel Ranger.
      </div>

      <GameSheetControl
        events={events.map((event) => ({
          id: event.id,
          label: `${event.title} - ${formatDate(event.startAt)}`,
        }))}
        rangers={rangers.map((ranger) => ({
          id: ranger.id,
          label: `${ranger.codiname} - ${String(ranger.croaNumber).padStart(6, "0")}`,
        }))}
        sheets={sheets.map((sheet) => ({
          id: sheet.id,
          title: sheet.title,
          status: sheet.status,
          scheduledAt: formatDate(sheet.scheduledAt),
          eventTitle: sheet.event?.title ?? "Sem evento",
          squads: sheet.squads.map((item) => item.squad.name).join(", ") || "Sem squads",
          rangers: sheet.rangers.map((item) => item.member.codiname).join(", ") || "Sem rangers",
          score: sheet.squads.map((item) => `${item.squad.name}: ${item.score}`).join(" | ") || "0",
        }))}
        squads={squads.map((squad) => ({
          id: squad.id,
          label: `${squad.name} (${squad.rankingPoints} pts)`,
        }))}
      />
    </AppShell>
  );
}
