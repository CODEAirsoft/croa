import { BloodType } from "@prisma/client";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { MemberCroaRecord } from "@/components/member-croa-record";
import { hasAdministrativeSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

type MemberCardPageProps = {
  params: Promise<{
    croa: string;
  }>;
  searchParams?: Promise<{
    editar?: string;
  }>;
};

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
    label: `${field.codeNumber}º${field.countryCode.trim().toUpperCase()}${field.state.trim().toUpperCase()} - ${field.name}`,
  }));

  const memberRecord = {
    id: member.id,
    croaNumber: member.croaNumber,
    codiname: member.codiname,
    fullName: member.fullName,
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
    role: member.role,
    otherRole: member.otherRole ?? "",
    level: member.level,
    memberClass: member.memberClass,
    status: member.status,
    fieldId: member.fieldId ?? "",
    addressStreet: member.addressStreet ?? "",
    addressNumber: member.addressNumber ?? "",
    neighborhood: member.neighborhood ?? "",
    postalCode: member.postalCode ?? "",
    addressComplement: member.addressComplement ?? "",
    bloodType: (member.bloodType ?? "") as BloodType | "",
    emergencyContactName: member.emergencyContactName ?? "",
    emergencyContactPhone: member.emergencyContactPhone ?? "",
    observations: member.observations ?? "",
  };

  return (
    <main className="page-shell croa-record-page">
      <MemberCroaRecord canEdit={canEdit} fields={fieldOptions} member={memberRecord} startEditing={startEditing} />
    </main>
  );
}
