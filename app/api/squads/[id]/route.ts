import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { parseSquadPayload, validateSquadPayload } from "@/lib/squad-payload";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const cookieStore = await cookies();
    if (!hasAdministrativeSession(cookieStore)) {
      return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseSquadPayload(body);
    const validationError = validateSquadPayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const existingSquad = await prisma.squad.findUnique({
      where: { id },
      include: { assignments: true },
    });

    if (!existingSquad) {
      return NextResponse.json({ error: "Squad não encontrado." }, { status: 404 });
    }

    const duplicateName = await prisma.squad.findFirst({
      where: {
        name: payload.name,
        NOT: { id },
      },
      select: { id: true },
    });

    if (duplicateName) {
      return NextResponse.json({ error: "Já existe um squad com esse nome." }, { status: 409 });
    }

    if (payload.fieldId) {
      const field = await prisma.field.findUnique({ where: { id: payload.fieldId }, select: { id: true } });
      if (!field) {
        return NextResponse.json({ error: "O campo selecionado não foi encontrado." }, { status: 400 });
      }
    }

    const memberIds = payload.assignments.map((assignment) => assignment.memberId);
    const members = await prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true },
    });

    if (members.length !== memberIds.length) {
      return NextResponse.json({ error: "Existe integrante selecionado que não foi encontrado." }, { status: 400 });
    }

    const leaderId = payload.assignments.find((assignment) => assignment.position === "LIDER")?.memberId ?? null;
    const previousMemberIds = existingSquad.assignments.map((assignment) => assignment.memberId);

    const item = await prisma.$transaction(async (tx) => {
      await tx.squadMemberAssignment.deleteMany({
        where: {
          memberId: { in: memberIds },
          NOT: { squadId: id },
        },
      });

      if (previousMemberIds.length > 0) {
        await tx.member.updateMany({
          where: { id: { in: previousMemberIds } },
          data: { squadId: null },
        });
      }

      await tx.squadMemberAssignment.deleteMany({
        where: { squadId: id },
      });

      const squad = await tx.squad.update({
        where: { id },
        data: {
          name: payload.name,
          fieldId: payload.fieldId,
          operationalClass: payload.operationalClass,
          rankingPoints: payload.rankingPoints,
          active: payload.active,
          enrollmentDate: payload.enrollmentDate ? new Date(payload.enrollmentDate) : null,
          status: payload.status,
          leaderId,
          photoDataUrl: payload.photoDataUrl || null,
          photoScale: payload.photoScale,
          photoPositionX: payload.photoPositionX,
          photoPositionY: payload.photoPositionY,
          assignments: {
            create: payload.assignments,
          },
        },
        include: {
          assignments: true,
        },
      });

      if (memberIds.length > 0) {
        await tx.member.updateMany({
          where: { id: { in: memberIds } },
          data: { squadId: id },
        });
      }

      return squad;
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Falha ao atualizar squad:", error);
    return NextResponse.json({ error: "Não foi possível salvar as alterações do squad." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const cookieStore = await cookies();
    if (!hasAdministrativeSession(cookieStore)) {
      return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 403 });
    }

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      await tx.member.updateMany({
        where: { squadId: id },
        data: { squadId: null },
      });

      await tx.squadMemberAssignment.deleteMany({
        where: { squadId: id },
      });

      await tx.squad.delete({
        where: { id },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Falha ao excluir o squad:", error);
    return NextResponse.json({ error: "Não foi possível excluir o squad." }, { status: 500 });
  }
}
