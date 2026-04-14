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
      return NextResponse.json({ error: "Informe a data de início do evento." }, { status: 400 });
    }

    const item = await prisma.eventRecord.update({
      where: { id },
      data: {
        title: String(body.title ?? "").trim() || "Evento sem título",
        type: (String(body.type ?? "aberto") as "aberto" | "fechado" | "chancelado" | "homologado") ?? "aberto",
        category: String(body.category ?? "").trim() || null,
        summary: String(body.summary ?? "").trim() || null,
        description: String(body.description ?? "").trim() || null,
        organizerName: String(body.organizerName ?? "").trim() || null,
        city: String(body.city ?? "").trim() || null,
        state: String(body.state ?? "").trim() || null,
        startAt,
        endAt: parseDate(body.endAt),
        registrationDeadline: parseDate(body.registrationDeadline),
        recurringEnabled: Boolean(body.recurringEnabled),
        recurrenceFrequency: Boolean(body.recurringEnabled) ? String(body.recurrenceFrequency ?? "").trim() || "semanal" : null,
        maxParticipants: Math.max(0, Number(body.maxParticipants ?? 0) || 0),
        reservedSlots: Math.max(0, Number(body.reservedSlots ?? 0) || 0),
        priceLabel: String(body.priceLabel ?? "").trim() || null,
        equipmentRentalLabel: String(body.equipmentRentalLabel ?? "").trim() || null,
        discountPercent: Math.max(0, Math.min(50, Number(body.discountPercent ?? 0) || 0)),
        reservationLabel: String(body.reservationLabel ?? "").trim() || "Reservar vaga",
        whatsappMessage: String(body.whatsappMessage ?? "").trim() || null,
        photoDataUrl: String(body.photoDataUrl ?? "").trim() || null,
        photoScale: Math.max(60, Math.min(140, Number(body.photoScale ?? 100) || 100)),
        photoPositionX: Math.max(0, Math.min(100, Number(body.photoPositionX ?? 50) || 50)),
        photoPositionY: Math.max(0, Math.min(100, Number(body.photoPositionY ?? 50) || 50)),
        status: String(body.status ?? "").trim() || "Planejado",
        fieldId: String(body.fieldId ?? "").trim() || null,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Falha ao atualizar evento:", error);
    return NextResponse.json({ error: "Não foi possível salvar as alterações do evento." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.eventRecord.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Falha ao excluir evento:", error);
    return NextResponse.json({ error: "Não foi possível excluir o evento." }, { status: 500 });
  }
}
