import { GamePointTarget } from "@prisma/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasArbitrationSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!hasArbitrationSession(cookieStore)) {
      return NextResponse.json({ error: "Acesso de arbitragem necessario." }, { status: 403 });
    }

    const body = (await request.json()) as {
      gameSheetId?: string;
      targetType?: GamePointTarget;
      memberId?: string;
      squadId?: string;
      points?: number | string;
      note?: string;
    };

    const points = Number(body.points);
    const gameSheetId = body.gameSheetId?.trim();

    if (!gameSheetId) {
      return NextResponse.json({ error: "Selecione uma sumula ativa." }, { status: 400 });
    }

    if (!Number.isFinite(points) || points === 0) {
      return NextResponse.json({ error: "Informe uma pontuacao positiva ou negativa." }, { status: 400 });
    }

    const targetType = body.targetType === GamePointTarget.SQUAD ? GamePointTarget.SQUAD : GamePointTarget.OPERATOR;
    const memberId = body.memberId?.trim() || null;
    const squadId = body.squadId?.trim() || null;

    if (targetType === GamePointTarget.OPERATOR && !memberId) {
      return NextResponse.json({ error: "Selecione o operador." }, { status: 400 });
    }

    if (targetType === GamePointTarget.SQUAD && !squadId) {
      return NextResponse.json({ error: "Selecione o squad." }, { status: 400 });
    }

    const item = await prisma.$transaction(async (transaction) => {
      const score = await transaction.gameScore.create({
        data: {
          gameSheetId,
          targetType,
          memberId: targetType === GamePointTarget.OPERATOR ? memberId : null,
          squadId: targetType === GamePointTarget.SQUAD ? squadId : null,
          points: Math.round(points),
          note: body.note?.trim() || null,
        },
        select: {
          id: true,
          points: true,
        },
      });

      if (targetType === GamePointTarget.OPERATOR && memberId) {
        await transaction.member.update({
          where: { id: memberId },
          data: {
            points: {
              increment: Math.round(points),
            },
          },
        });
      }

      if (targetType === GamePointTarget.SQUAD && squadId) {
        await transaction.squad.update({
          where: { id: squadId },
          data: {
            rankingPoints: {
              increment: Math.round(points),
            },
          },
        });

        await transaction.gameSheetSquad.updateMany({
          where: {
            gameSheetId,
            squadId,
          },
          data: {
            score: {
              increment: Math.round(points),
            },
          },
        });
      }

      return score;
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Nao foi possivel registrar a pontuacao.", error);
    return NextResponse.json({ error: "Nao foi possivel registrar a pontuacao." }, { status: 500 });
  }
}
