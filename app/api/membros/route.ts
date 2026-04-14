import { NextResponse } from "next/server";
import { BloodType, MemberClass, MemberLevel, MemberStatus, RoleType } from "@prisma/client";
import { verifyCriticalOperatorAccess } from "@/lib/critical-auth";
import { formatDdd, formatDdi, formatPhoneInternational, isValidRg } from "@/lib/field-validation";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const VALID_ROLE_TYPES = [
  "admin",
  "fundador",
  "operador",
  "comando",
  "ranger",
  "arbitro",
  "gestor",
  "promoter",
  "reporter",
  "presidente",
  "professor",
  "instrutor",
  "outros",
] as const;
const VALID_MEMBER_LEVELS = ["ALPHA_0", "N1", "N2", "N3", "N4", "N5"] as const;
const VALID_MEMBER_CLASSES = ["STANDARD", "PREMIUM", "TOP_TEAM", "MASTER", "ALMIGHTY"] as const;
const VALID_MEMBER_STATUSES = ["ativo", "suspenso", "inativo", "excluido", "rip"] as const;
const VALID_BLOOD_TYPES = [
  "A_POSITIVO",
  "A_NEGATIVO",
  "B_POSITIVO",
  "B_NEGATIVO",
  "AB_POSITIVO",
  "AB_NEGATIVO",
  "O_POSITIVO",
  "O_NEGATIVO",
] as const;

export async function GET() {
  const items = await prisma.member.findMany({
    include: {
      field: {
        select: {
          codeNumber: true,
          state: true,
          name: true,
        },
      },
      squad: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      codiname?: string;
      fullName?: string;
      birthDate?: string;
      enrollmentDate?: string;
      photoDataUrl?: string;
      photoScale?: number;
      photoPositionX?: number;
      photoPositionY?: number;
      crestLeftDataUrl?: string;
      crestRightDataUrl?: string;
      email?: string;
      ddi?: string;
      ddd?: string;
      phoneNumber?: string;
      rg?: string;
      status?: string;
      fieldId?: string;
      addressStreet?: string;
      addressNumber?: string;
      neighborhood?: string;
      postalCode?: string;
      addressComplement?: string;
      bloodType?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      memberClass?: string;
      role?: string;
      otherRole?: string;
      level?: string;
      observations?: string;
      accessLogin?: string;
      accessPassword?: string;
      adminAuthorizationLogin?: string;
      adminAuthorizationPassword?: string;
    };

    if (!body.codiname?.trim()) {
      return NextResponse.json({ error: "Codinome é obrigatório." }, { status: 400 });
    }

    if (!body.fullName?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const ddi = formatDdi(body.ddi ?? "");
    const ddd = formatDdd(body.ddd ?? "");
    const phoneNumber = formatPhoneInternational(body.phoneNumber ?? "");

    if (ddi.length !== 2 || ddd.length !== 2 || phoneNumber.length < 8) {
      return NextResponse.json(
        { error: "Telefone inválido. Informe DDI, DDD e número no padrão esperado." },
        { status: 400 },
      );
    }

    const normalizedRg = body.rg?.trim() ?? "";

    if (normalizedRg && !isValidRg(normalizedRg)) {
      return NextResponse.json({ error: "RG inválido. Informe um RG em formato válido." }, { status: 400 });
    }

    const duplicateMember = await prisma.member.findFirst({
      where: {
        OR: [
          ...(normalizedRg ? [{ rg: normalizedRg }] : []),
          {
            ddi,
            ddd,
            phoneNumber,
          },
        ],
      },
      select: {
        rg: true,
        croaNumber: true,
        ddi: true,
        ddd: true,
        phoneNumber: true,
      },
    });

    if (duplicateMember) {
      if (normalizedRg && duplicateMember.rg === normalizedRg) {
        return NextResponse.json(
          { error: "Este RG já está vinculado a outro registro do CROA." },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Este telefone já está vinculado a outro registro do CROA." },
        { status: 409 },
      );
    }

    if (!VALID_ROLE_TYPES.includes(body.role as RoleType)) {
      return NextResponse.json({ error: "Função esportiva inválida." }, { status: 400 });
    }

    if (body.role === "outros" && !body.otherRole?.trim()) {
      return NextResponse.json(
        { error: "Ao escolher Outros, informe a função personalizada." },
        { status: 400 },
      );
    }

    if (!VALID_MEMBER_LEVELS.includes(body.level as MemberLevel)) {
      return NextResponse.json({ error: "Nível inválido." }, { status: 400 });
    }

    if (!VALID_MEMBER_CLASSES.includes(body.memberClass as MemberClass)) {
      return NextResponse.json({ error: "Classe inválida." }, { status: 400 });
    }

    if (body.status && !VALID_MEMBER_STATUSES.includes(body.status as MemberStatus)) {
      return NextResponse.json({ error: "Situação inválida." }, { status: 400 });
    }

    if (body.bloodType && !VALID_BLOOD_TYPES.includes(body.bloodType as BloodType)) {
      return NextResponse.json({ error: "Tipo sanguíneo inválido." }, { status: 400 });
    }

    if (body.observations && body.observations.length > 500) {
      return NextResponse.json(
        { error: "Observações devem ter no máximo 500 caracteres." },
        { status: 400 },
      );
    }

    const isPrivilegedClass = body.memberClass === "MASTER" || body.memberClass === "ALMIGHTY";

    if (isPrivilegedClass) {
      if (!body.accessLogin?.trim() || !body.accessPassword?.trim()) {
        return NextResponse.json(
          { error: "MASTER e ALMIGHTY exigem login e senha próprios do operador." },
          { status: 400 },
        );
      }

      const adminLogin = body.adminAuthorizationLogin?.trim() ?? "";
      const adminPassword = body.adminAuthorizationPassword?.trim() ?? "";

      if (!adminLogin || !adminPassword) {
        return NextResponse.json(
          { error: "Informe a autorização administrativa para cadastro privilegiado." },
          { status: 400 },
        );
      }

      const authorized = await verifyCriticalOperatorAccess({
        login: adminLogin,
        password: adminPassword,
      });

      if (!authorized) {
        return NextResponse.json(
          { error: "Autorização administrativa inválida para cadastro privilegiado." },
          { status: 403 },
        );
      }
    }

    const createData = {
        codiname: body.codiname.trim(),
        fullName: body.fullName.trim(),
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        enrollmentDate: body.enrollmentDate ? new Date(body.enrollmentDate) : null,
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
        crestLeftDataUrl: body.crestLeftDataUrl?.trim() || null,
        crestRightDataUrl: body.crestRightDataUrl?.trim() || null,
        accessLogin: body.accessLogin?.trim() || null,
        accessPasswordHash: body.accessPassword?.trim()
          ? hashPassword(body.accessPassword.trim())
          : null,
        email: body.email?.trim() || null,
        ddi,
        ddd,
        phoneNumber,
        rg: normalizedRg || null,
        status: (body.status as MemberStatus | undefined) ?? "ativo",
        role: body.role as RoleType,
        otherRole: body.otherRole?.trim() || null,
        level: body.level as MemberLevel,
        memberClass: body.memberClass as MemberClass,
        fieldId: body.fieldId?.trim() || null,
        addressStreet: body.addressStreet?.trim() || null,
        addressNumber: body.addressNumber?.trim() || null,
        neighborhood: body.neighborhood?.trim() || null,
        postalCode: body.postalCode?.trim() || null,
        addressComplement: body.addressComplement?.trim() || null,
        bloodType: (body.bloodType as BloodType | undefined) || null,
        emergencyContactName: body.emergencyContactName?.trim() || null,
        emergencyContactPhone: body.emergencyContactPhone?.trim() || null,
        observations: body.observations?.trim() || null,
      } as Record<string, unknown>;

    const item = await prisma.member.create({
      data: createData as never,
      include: {
        field: {
          select: {
            codeNumber: true,
            state: true,
            name: true,
          },
        },
        squad: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar membro do CROA:", error);
    return NextResponse.json(
      { error: "O cadastro não pôde ser concluído. Verifique o banco e as configurações do servidor." },
      { status: 500 },
    );
  }
}
