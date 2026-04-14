import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSquadPayload, validateSquadPayload } from "@/lib/squad-payload";

export async function GET() {
  const items = await prisma.squad.findMany({
    include: {
      field: {
        select: {
          id: true,
          codeNumber: true,
          countryCode: true,
          state: true,
          name: true,
        },
      },
      leader: {
        select: {
          id: true,
          croaNumber: true,
          codiname: true,
          fullName: true,
        },
      },
      assignments: {
        include: {
          member: {
            select: {
              id: true,
              croaNumber: true,
              codiname: true,
              memberClass: true,
              level: true,
              photoDataUrl: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ rankingPoints: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseSquadPayload(body);
    const validationError = validateSquadPayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const existingSquad = await prisma.squad.findUnique({
      where: { name: payload.name },
      select: { id: true },
    });

    if (existingSquad) {
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

    const item = await prisma.$transaction(async (tx) => {
      await tx.squadMemberAssignment.deleteMany({
        where: { memberId: { in: memberIds } },
      });

      await tx.member.updateMany({
        where: { id: { in: memberIds } },
        data: { squadId: null },
      });

      const squad = await tx.squad.create({
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

      await tx.member.updateMany({
        where: { id: { in: memberIds } },
        data: { squadId: squad.id },
      });

      return squad;
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar squad:", error);
    return NextResponse.json({ error: "Não foi possível salvar o squad." }, { status: 500 });
  }
}
