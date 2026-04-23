import { GameSheetStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const validStatuses = new Set<GameSheetStatus>([
  GameSheetStatus.planejado,
  GameSheetStatus.iniciado,
  GameSheetStatus.finalizado,
  GameSheetStatus.cancelado,
]);

export async function PATCH(request: Request, { params }: Params) {
  try {
    const cookieStore = await cookies();
    if (!hasAdministrativeSession(cookieStore)) {
      return NextResponse.json({ error: "Acesso administrativo necessario." }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as {
      status?: GameSheetStatus;
    };

    if (!body.status || !validStatuses.has(body.status)) {
      return NextResponse.json({ error: "Status da sumula invalido." }, { status: 400 });
    }

    const item = await prisma.gameSheet.update({
      where: { id },
      data: {
        status: body.status,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Nao foi possivel atualizar a sumula.", error);
    return NextResponse.json({ error: "Nao foi possivel atualizar a sumula." }, { status: 500 });
  }
}
