import { NextResponse } from "next/server";
import {
  isValidCnpj,
  isValidStructuredPhone,
  onlyDigits,
} from "@/lib/field-validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.field.findMany({
    include: {
      operator: {
        select: {
          croaNumber: true,
          codiname: true,
          fullName: true,
        },
      },
      referee: {
        select: {
          croaNumber: true,
          codiname: true,
          fullName: true,
        },
      },
      firstRanger: {
        select: {
          croaNumber: true,
          codiname: true,
          fullName: true,
        },
      },
      secondRanger: {
        select: {
          croaNumber: true,
          codiname: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      codeNumber: "asc",
    },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      cnpj?: string;
      fullAddress?: string;
      ownerName?: string;
      contactPhone?: string;
      website?: string;
      instagram?: string;
      facebook?: string;
      operatorId?: string;
      registrationDate?: string;
      contractValidUntil?: string;
      refereeId?: string;
      firstRangerId?: string;
      secondRangerId?: string;
      countryCode?: string;
      state?: string;
      photoDataUrl?: string;
      photoScale?: number;
      photoPositionX?: number;
      photoPositionY?: number;
    };

    const normalizedName = body.name?.trim() ?? "";
    const normalizedCnpj = onlyDigits(body.cnpj ?? "");
    const normalizedAddress = body.fullAddress?.trim() ?? "";
    const normalizedOwnerName = body.ownerName?.trim() ?? "";
    const countryCode = body.countryCode?.trim().toUpperCase() || "BR";
    const state = body.state?.trim().toUpperCase() || "SP";

    if (normalizedCnpj && !isValidCnpj(body.cnpj ?? "")) {
      return NextResponse.json({ error: "CNPJ inválido. Use o padrão oficial com 14 dígitos." }, { status: 400 });
    }

    const phoneDigits = onlyDigits(body.contactPhone ?? "");
    const ddi = phoneDigits.slice(0, 2);
    const ddd = phoneDigits.slice(2, 4);
    const phoneNumber = phoneDigits.slice(4);

    const hasStructuredPhone = Boolean(phoneDigits);

    if (hasStructuredPhone && !isValidStructuredPhone(ddi, ddd, phoneNumber)) {
      return NextResponse.json(
        { error: "Telefone inválido. Informe DDI, DDD e número completos no padrão internacional." },
        { status: 400 },
      );
    }

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return NextResponse.json({ error: "País do campo inválido." }, { status: 400 });
    }

    if (!/^[A-Z]{2,3}$/.test(state)) {
      return NextResponse.json({ error: "Estado do campo inválido." }, { status: 400 });
    }

    let operatorId: string | null = null;
    let refereeId: string | null = null;

    let firstRangerId: string | null = null;
    let secondRangerId: string | null = null;

    if (body.operatorId?.trim()) {
      const operator = await prisma.member.findUnique({
        where: {
          id: body.operatorId.trim(),
        },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      const validResponsibleRoles = ["admin", "fundador", "presidente", "professor", "instrutor", "gestor"];

      if (!operator || !validResponsibleRoles.includes(operator.role) || operator.status === "excluido") {
        return NextResponse.json(
          { error: "O responsável precisa estar cadastrado e ativo como admin, fundador, presidente, professor, instrutor ou gestor." },
          { status: 400 },
        );
      }

      operatorId = body.operatorId.trim();
    }

    if (body.refereeId?.trim()) {
      const referee = await prisma.member.findUnique({
        where: {
          id: body.refereeId.trim(),
        },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      if (!referee || referee.role !== "arbitro" || referee.status === "excluido") {
        return NextResponse.json(
          { error: "O árbitro informado precisa estar cadastrado como árbitro ativo." },
          { status: 400 },
        );
      }

      refereeId = body.refereeId.trim();
    }

    if (body.firstRangerId?.trim()) {
      const firstRanger = await prisma.member.findUnique({
        where: {
          id: body.firstRangerId.trim(),
        },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      if (!firstRanger || firstRanger.role !== "ranger" || firstRanger.status === "excluido") {
        return NextResponse.json(
          { error: "O 1º ranger precisa estar cadastrado como ranger ativo." },
          { status: 400 },
        );
      }

      firstRangerId = body.firstRangerId.trim();
    }

    if (body.secondRangerId?.trim()) {
      const secondRanger = await prisma.member.findUnique({
        where: {
          id: body.secondRangerId.trim(),
        },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      if (!secondRanger || secondRanger.role !== "ranger" || secondRanger.status === "excluido") {
        return NextResponse.json(
          { error: "O 2º ranger precisa estar cadastrado como ranger ativo." },
          { status: 400 },
        );
      }

      secondRangerId = body.secondRangerId.trim();
    }

    if (firstRangerId && secondRangerId && firstRangerId === secondRangerId) {
      return NextResponse.json(
        { error: "O 1º e o 2º ranger precisam ser pessoas diferentes." },
        { status: 400 },
      );
    }

    if (normalizedCnpj) {
      const existingField = await prisma.field.findFirst({
        where: {
          cnpj: normalizedCnpj,
        },
        select: {
          id: true,
        },
      });

      if (existingField) {
        return NextResponse.json({ error: "Já existe um campo cadastrado com este CNPJ." }, { status: 409 });
      }
    }

    const item = await prisma.field.create({
      data: {
        name: normalizedName,
        cnpj: normalizedCnpj || null,
        fullAddress: normalizedAddress || null,
        ownerName: normalizedOwnerName || null,
        contactPhone: hasStructuredPhone ? `+${ddi} ${ddd} ${phoneNumber}` : null,
        website: body.website?.trim() || null,
        instagram: body.instagram?.trim() || null,
        facebook: body.facebook?.trim() || null,
        countryCode,
        state,
        photoDataUrl: body.photoDataUrl?.trim() || null,
        photoScale:
          typeof body.photoScale === "number" && Number.isFinite(body.photoScale)
            ? Math.max(60, Math.min(140, Math.round(body.photoScale)))
            : 100,
        photoPositionX:
          typeof body.photoPositionX === "number" && Number.isFinite(body.photoPositionX)
            ? Math.max(0, Math.min(100, Math.round(body.photoPositionX)))
            : 50,
        photoPositionY:
          typeof body.photoPositionY === "number" && Number.isFinite(body.photoPositionY)
            ? Math.max(0, Math.min(100, Math.round(body.photoPositionY)))
            : 50,
        operatorId,
        refereeId,
        firstRangerId,
        secondRangerId,
        registrationDate: body.registrationDate?.trim()
          ? new Date(body.registrationDate.trim())
          : null,
        contractValidUntil: body.contractValidUntil?.trim()
          ? new Date(body.contractValidUntil.trim())
          : null,
      },
      include: {
        operator: {
          select: {
            croaNumber: true,
            codiname: true,
            fullName: true,
          },
        },
        referee: {
          select: {
            croaNumber: true,
            codiname: true,
            fullName: true,
          },
        },
        firstRanger: {
          select: {
            croaNumber: true,
            codiname: true,
            fullName: true,
          },
        },
        secondRanger: {
          select: {
            croaNumber: true,
            codiname: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar campo do CROA:", error);
    return NextResponse.json(
      { error: "O cadastro não pôde ser concluído. Verifique o banco e as configurações do servidor." },
      { status: 500 },
    );
  }
}
