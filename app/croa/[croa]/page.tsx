import type { Metadata } from "next";
import { BloodType, MemberClass, MemberLevel, MemberStatus, OfficialSubclass, RoleType } from "@prisma/client";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { MemberCroaRecord, type MemberCroaRecordData } from "@/components/member-croa-record";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { formatCroaCode } from "@/lib/croa";
import { prisma } from "@/lib/prisma";

type MemberCardPageProps = {
  params: Promise<{
    croa: string;
  }>;
  searchParams?: Promise<{
    editar?: string;
  }>;
};

function normalizeEmergencyNotes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

const validRoles = new Set<RoleType>([
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
]);

const validMemberLevels = new Set<MemberLevel>(["ALPHA_0", "N1", "N2", "N3", "N4", "N5"]);
const validMemberClasses = new Set<MemberClass>(["STANDARD", "PREMIUM", "TOP_TEAM", "MASTER", "OFICIAL", "ALMIGHTY"]);
const validOfficialSubclasses = new Set<OfficialSubclass>(["AUXILIAR", "RANGER", "ARBITRO", "REPORTER", "GERENTE"]);
const validStatuses = new Set<MemberStatus>(["ativo", "suspenso", "inativo", "excluido", "rip"]);
const validBloodTypes = new Set<BloodType>([
  "A_POSITIVO",
  "A_NEGATIVO",
  "B_POSITIVO",
  "B_NEGATIVO",
  "AB_POSITIVO",
  "AB_NEGATIVO",
  "O_POSITIVO",
  "O_NEGATIVO",
]);

function getPublicBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_CROA_URL ?? "https://croa-beta.vercel.app";
  return configuredUrl.replace(/\/$/, "");
}

function buildFieldLabel(field: {
  codeNumber: number | null;
  countryCode: string | null;
  state: string | null;
  name: string | null;
}) {
  const code = typeof field.codeNumber === "number" ? `${field.codeNumber}º` : "";
  const countryCode = (field.countryCode ?? "").trim().toUpperCase();
  const state = (field.state ?? "").trim().toUpperCase();
  const name = (field.name ?? "").trim() || "Campo sem nome";
  const region = `${countryCode}${state}`;

  if (code && region) {
    return `${code}${region} - ${name}`;
  }

  if (code) {
    return `${code} - ${name}`;
  }

  if (region) {
    return `${region} - ${name}`;
  }

  return name;
}

export async function generateMetadata({ params }: MemberCardPageProps): Promise<Metadata> {
  const { croa } = await params;

  if (!/^\d{6}$/.test(croa)) {
    return {
      title: "Carteirinha não encontrada | CROA",
      description: "Esta carteirinha não está disponível no CROA.",
    };
  }

  const croaNumber = Number.parseInt(croa, 10);
  const member = await prisma.member.findFirst({
    where: { croaNumber },
    select: {
      codiname: true,
      croaNumber: true,
      photoDataUrl: true,
      updatedAt: true,
    },
  });

  if (!member) {
    return {
      title: "Carteirinha não encontrada | CROA",
      description: "Esta carteirinha não está disponível no CROA.",
    };
  }

  const baseUrl = getPublicBaseUrl();
  const croaLabel = formatCroaCode(member.croaNumber);
  const codiname = member.codiname?.trim() || "Operador CROA";
  const title = `${codiname} · ${croaLabel}`;
  const description = `${codiname} | ${croaLabel}`;
  const pageUrl = `${baseUrl}/croa/${croa}`;
  const imageUrl = member.photoDataUrl
    ? `${baseUrl}/api/croa/${croa}/imagem?t=${new Date(member.updatedAt).getTime()}`
    : `${baseUrl}/code-airsoft-logo.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "CROA",
      type: "profile",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: `${codiname} - ${croaLabel}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CroaCardPage({ params, searchParams }: MemberCardPageProps) {
  const { croa } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  if (!/^\d{6}$/.test(croa)) {
    notFound();
  }

  const croaNumber = Number.parseInt(croa, 10);
  const cookieStore = await cookies();
  const canEdit = hasAdministrativeSession(cookieStore);
  const startEditing = canEdit && resolvedSearchParams.editar === "1";

  const [member, fields] = await Promise.all([
    prisma.member.findFirst({
      where: { croaNumber },
      include: {
        field: {
          select: {
            id: true,
            codeNumber: true,
            state: true,
            countryCode: true,
            name: true,
          },
        },
        squad: {
          select: {
            id: true,
            name: true,
            photoDataUrl: true,
            field: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.field.findMany({
      select: {
        id: true,
        codeNumber: true,
        state: true,
        countryCode: true,
        name: true,
      },
      orderBy: [{ codeNumber: "asc" }, { name: "asc" }],
    }),
  ]);

  if (!member) {
    notFound();
  }

  const fieldOptions = fields.map((field) => ({
    id: field.id,
    label: buildFieldLabel(field),
  }));

  const resolvedRole = member.role && validRoles.has(member.role) ? member.role : "operador";
  const resolvedLevel = member.level && validMemberLevels.has(member.level) ? member.level : "ALPHA_0";
  const resolvedMemberClass =
    member.memberClass && validMemberClasses.has(member.memberClass) ? member.memberClass : "STANDARD";
  const resolvedOfficialSubclass: OfficialSubclass | "" =
    resolvedMemberClass === "OFICIAL" && member.officialSubclass && validOfficialSubclasses.has(member.officialSubclass)
      ? member.officialSubclass
      : resolvedMemberClass === "OFICIAL"
        ? "AUXILIAR"
        : "";
  const resolvedStatus: MemberStatus = member.status && validStatuses.has(member.status) ? member.status : "ativo";
  const resolvedBloodType: BloodType | "" =
    member.bloodType && validBloodTypes.has(member.bloodType) ? member.bloodType : "";

  const memberRecord: MemberCroaRecordData = {
    id: member.id,
    croaNumber: member.croaNumber,
    codiname: member.codiname ?? "",
    fullName: member.fullName ?? "",
    birthDate: member.birthDate ? member.birthDate.toISOString().slice(0, 10) : "",
    enrollmentDate: member.enrollmentDate ? member.enrollmentDate.toISOString().slice(0, 10) : "",
    photoDataUrl: member.photoDataUrl ?? "",
    photoScale: member.photoScale ?? 100,
    photoPositionX: member.photoPositionX ?? 50,
    photoPositionY: member.photoPositionY ?? 50,
    crestLeftDataUrl: (member as { crestLeftDataUrl?: string | null }).crestLeftDataUrl ?? "",
    crestRightDataUrl: (member as { crestRightDataUrl?: string | null }).crestRightDataUrl ?? "",
    accessLogin: member.accessLogin ?? "",
    email: member.email ?? "",
    ddi: member.ddi ?? "",
    ddd: member.ddd ?? "",
    phoneNumber: member.phoneNumber ?? "",
    rg: member.rg ?? "",
    role: resolvedRole,
    otherRole: member.otherRole ?? "",
    level: resolvedLevel,
    memberClass: resolvedMemberClass,
    officialSubclass: resolvedOfficialSubclass,
    status: resolvedStatus,
    fieldId: member.fieldId ?? "",
    squadName: member.squad?.name ?? "",
    squadFieldName: member.squad?.field?.name ?? "",
    squadPhotoDataUrl: member.squad?.photoDataUrl ?? "",
    addressStreet: member.addressStreet ?? "",
    addressNumber: member.addressNumber ?? "",
    neighborhood: member.neighborhood ?? "",
    postalCode: member.postalCode ?? "",
    addressComplement: member.addressComplement ?? "",
    bloodType: resolvedBloodType,
    emergencyNotes: normalizeEmergencyNotes((member as { emergencyNotes?: unknown }).emergencyNotes),
    emergencyContactName: member.emergencyContactName ?? "",
    emergencyContactPhone: member.emergencyContactPhone ?? "",
    observations: member.observations ?? "",
    history: (member as { history?: string | null }).history ?? "",
  };

  return (
    <main className="page-shell croa-record-page">
      <MemberCroaRecord canEdit={canEdit} fields={fieldOptions} member={memberRecord} startEditing={startEditing} />
    </main>
  );
}
