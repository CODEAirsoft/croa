import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function parseDate(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const startAt = parseDate(body.startAt);

    if (!startAt) {
      return NextResponse.json({ error: "Informe a data de início do curso." }, { status: 400 });
    }

    const item = await prisma.courseRecord.update({
      where: { id },
      data: {
        title: String(body.title ?? "").trim() || "Curso sem título",
        category: String(body.category ?? "").trim() || "Outros",
        summary: String(body.summary ?? "").trim() || null,
        description: String(body.description ?? "").trim() || null,
        instructorName: String(body.instructorName ?? "").trim() || null,
        workloadLabel: String(body.workloadLabel ?? "").trim() || null,
        targetLevel: String(body.targetLevel ?? "").trim() || null,
        targetClass: String(body.targetClass ?? "").trim() || null,
        city: String(body.city ?? "").trim() || null,
        state: String(body.state ?? "").trim() || null,
        startAt,
        endAt: parseDate(body.endAt),
        registrationDeadline: parseDate(body.registrationDeadline),
        totalSeats: Math.max(0, Number(body.totalSeats ?? 0) || 0),
        reservedSlots: Math.max(0, Number(body.reservedSlots ?? 0) || 0),
        priceLabel: String(body.priceLabel ?? "").trim() || null,
        reservationLabel: String(body.reservationLabel ?? "").trim() || "Reservar vaga",
        whatsappMessage: String(body.whatsappMessage ?? "").trim() || null,
        photoDataUrl: String(body.photoDataUrl ?? "").trim() || null,
        photoScale: Math.max(60, Math.min(140, Number(body.photoScale ?? 100) || 100)),
        photoPositionX: Math.max(0, Math.min(100, Number(body.photoPositionX ?? 50) || 50)),
        photoPositionY: Math.max(0, Math.min(100, Number(body.photoPositionY ?? 50) || 50)),
        active: Boolean(body.active ?? true),
        fieldId: String(body.fieldId ?? "").trim() || null,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Falha ao atualizar curso:", error);
    return NextResponse.json({ error: "Não foi possível salvar as alterações do curso." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.courseRecord.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Falha ao excluir curso:", error);
    return NextResponse.json({ error: "Não foi possível excluir o curso." }, { status: 500 });
  }
}
