import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function uniqueIds(value: unknown, limit: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  ).slice(0, limit);
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!hasAdministrativeSession(cookieStore)) {
      return NextResponse.json({ error: "Acesso administrativo necessario." }, { status: 403 });
    }

    const body = (await request.json()) as {
      title?: string;
      eventId?: string;
      scheduledAt?: string;
      gameDurationMinutes?: number | string;
      operationType?: string;
      missionType?: string;
      interventionType?: string;
      squadIds?: string[];
      rangerIds?: string[];
    };

    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ error: "Informe o nome da sumula." }, { status: 400 });
    }

    const squadIds = uniqueIds(body.squadIds, 8);
    const rangerIds = uniqueIds(body.rangerIds, 12);

    if (squadIds.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um squad para a sumula." }, { status: 400 });
    }

    const duration = Number(body.gameDurationMinutes);
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

    const item = await prisma.gameSheet.create({
      data: {
        title,
        eventId: body.eventId?.trim() || null,
        scheduledAt: scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt : null,
        gameDurationMinutes: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : null,
        operationType: body.operationType?.trim() || null,
        missionType: body.missionType?.trim() || null,
        interventionType: body.interventionType?.trim() || null,
        squads: {
          create: squadIds.map((squadId, sortOrder) => ({
            squadId,
            sortOrder,
          })),
        },
        rangers: {
          create: rangerIds.map((memberId) => ({
            memberId,
          })),
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Nao foi possivel criar a sumula.", error);
    return NextResponse.json({ error: "Nao foi possivel criar a sumula." }, { status: 500 });
  }
}
