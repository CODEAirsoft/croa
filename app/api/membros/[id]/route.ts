import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatDdd, formatDdi, formatPhoneInternational, isValidRg } from "@/lib/field-validation";
import { CROA_GHOST_NUMBER } from "@/lib/master-password";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

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

    const existing = await prisma.member.findUnique({
      where: { id },
      select: { croaNumber: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
    }

    if (existing.croaNumber === CROA_GHOST_NUMBER) {
      return NextResponse.json({ error: "O registro fantasma não pode ser alterado por esta rota." }, { status: 403 });
    }

    const nextRg =
      typeof body.rg === "string"
        ? body.rg.trim() || null
        : body.rg === null
          ? null
          : undefined;
    const nextDdi =
      typeof body.ddi === "string" ? formatDdi(body.ddi) : body.ddi === null ? null : undefined;
    const nextDdd =
      typeof body.ddd === "string" ? formatDdd(body.ddd) : body.ddd === null ? null : undefined;
    const nextPhoneNumber =
      typeof body.phoneNumber === "string"
        ? formatPhoneInternational(body.phoneNumber)
        : body.phoneNumber === null
          ? null
          : undefined;

    if (nextRg !== undefined && nextRg !== null && !isValidRg(nextRg)) {
      return NextResponse.json({ error: "RG inválido. Informe um RG em formato válido." }, { status: 400 });
    }

    if (
      nextDdi !== undefined &&
      nextDdd !== undefined &&
      nextPhoneNumber !== undefined &&
      nextDdi !== null &&
      nextDdd !== null &&
      nextPhoneNumber !== null &&
      (nextDdi.length !== 2 || nextDdd.length !== 2 || nextPhoneNumber.length < 8)
    ) {
      return NextResponse.json(
        { error: "Telefone inválido. Informe DDI, DDD e número no padrão esperado." },
        { status: 400 },
      );
    }

    if (nextRg !== undefined && nextRg !== null) {
      const duplicateRg = await prisma.member.findFirst({
        where: {
          id: { not: id },
          rg: nextRg,
        },
        select: { id: true },
      });

      if (duplicateRg) {
        return NextResponse.json(
          { error: "Este RG já está vinculado a outro registro do CROA." },
          { status: 409 },
        );
      }
    }

    if (
      nextDdi !== undefined &&
      nextDdd !== undefined &&
      nextPhoneNumber !== undefined &&
      nextDdi !== null &&
      nextDdd !== null &&
      nextPhoneNumber !== null
    ) {
      const duplicatePhone = await prisma.member.findFirst({
        where: {
          id: { not: id },
          ddi: nextDdi,
          ddd: nextDdd,
          phoneNumber: nextPhoneNumber,
        },
        select: { id: true },
      });

      if (duplicatePhone) {
        return NextResponse.json(
          { error: "Este telefone já está vinculado a outro registro do CROA." },
          { status: 409 },
        );
      }
    }

    const data = {
      codiname: body.codiname ?? undefined,
      fullName: body.fullName ?? undefined,
      birthDate: body.birthDate ? new Date(String(body.birthDate)) : body.birthDate === null ? null : undefined,
      enrollmentDate: body.enrollmentDate
        ? new Date(String(body.enrollmentDate))
        : body.enrollmentDate === null
          ? null
          : undefined,
      photoDataUrl: body.photoDataUrl ?? undefined,
      photoScale: body.photoScale ?? undefined,
      photoPositionX: body.photoPositionX ?? undefined,
      photoPositionY: body.photoPositionY ?? undefined,
      crestLeftDataUrl: body.crestLeftDataUrl ?? undefined,
      crestRightDataUrl: body.crestRightDataUrl ?? undefined,
      accessLogin: body.accessLogin ?? undefined,
      accessPasswordHash:
        typeof body.accessPassword === "string" && body.accessPassword.trim()
          ? hashPassword(body.accessPassword.trim())
          : undefined,
      email: body.email ?? undefined,
      ddi: nextDdi ?? undefined,
      ddd: nextDdd ?? undefined,
      phoneNumber: nextPhoneNumber ?? undefined,
      rg: nextRg ?? undefined,
      role: body.role ?? undefined,
      otherRole: body.otherRole ?? undefined,
      level: body.level ?? undefined,
      memberClass: body.memberClass ?? undefined,
      status: body.status ?? undefined,
      fieldId: body.fieldId ?? undefined,
      squadId: body.squadId ?? undefined,
      addressStreet: body.addressStreet ?? undefined,
      addressNumber: body.addressNumber ?? undefined,
      neighborhood: body.neighborhood ?? undefined,
      postalCode: body.postalCode ?? undefined,
      addressComplement: body.addressComplement ?? undefined,
      bloodType: body.bloodType ?? undefined,
      emergencyContactName: body.emergencyContactName ?? undefined,
      emergencyContactPhone: body.emergencyContactPhone ?? undefined,
      observations: body.observations ?? undefined,
      history: body.history ?? undefined,
    };

    const item = await prisma.member.update({
      where: { id },
      data,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Falha ao atualizar membro:", error);
    return NextResponse.json({ error: "Não foi possível salvar as alterações do membro." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const cookieStore = await cookies();
    if (!hasAdministrativeSession(cookieStore)) {
      return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.member.findUnique({
      where: { id },
      select: { croaNumber: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
    }

    if (existing.croaNumber === CROA_GHOST_NUMBER) {
      return NextResponse.json({ error: "O registro fantasma não pode ser excluído." }, { status: 403 });
    }

    await prisma.member.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Falha ao excluir membro:", error);
    return NextResponse.json({ error: "Não foi possível excluir o membro." }, { status: 500 });
  }
}
