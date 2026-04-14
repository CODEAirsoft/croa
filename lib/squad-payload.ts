import {
  MemberStatus,
  SquadAssignmentType,
  SquadOperationalClass,
  SquadPosition,
  SquadSpecialization,
} from "@prisma/client";

const operationalClasses = new Set<SquadOperationalClass>([
  "BASE",
  "INTERMEDIARIO",
  "AVANCADO",
  "AUTO_RENDIMENTO",
]);

const assignmentTypes = new Set<SquadAssignmentType>(["TITULAR", "RESERVA", "COMANDO"]);
const positions = new Set<SquadPosition>(["PONTA", "APOIO", "SUPORTE", "LIDER", "RETAGUARDA", "COMANDO"]);
const statuses = new Set<MemberStatus>(["ativo", "suspenso", "inativo", "excluido", "rip"]);
const specializations = new Set<SquadSpecialization>([
  "ASSALT",
  "SUPRESSOR",
  "SNIPER",
  "DMR",
  "SPOTTER",
  "RADIO",
  "MEDICO",
  "ENGENHEIRO",
]);

export type SquadAssignmentInput = {
  memberId: string;
  slotType: SquadAssignmentType;
  position: SquadPosition;
  specializations: SquadSpecialization[];
  sortOrder: number;
};

export type SquadPayload = {
  name: string;
  fieldId: string | null;
  operationalClass: SquadOperationalClass;
  rankingPoints: number;
  active: boolean;
  enrollmentDate: string | null;
  status: MemberStatus;
  photoDataUrl: string;
  photoScale: number;
  photoPositionX: number;
  photoPositionY: number;
  assignments: SquadAssignmentInput[];
};

function toInt(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseSquadPayload(body: Record<string, unknown>): SquadPayload {
  const assignmentsRaw = Array.isArray(body.assignments) ? body.assignments : [];
  const assignments = assignmentsRaw
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const memberId = String(record.memberId ?? "").trim();
      const slotType = String(record.slotType ?? "").trim() as SquadAssignmentType;
      const position = String(record.position ?? "").trim() as SquadPosition;
      const specialties = Array.isArray(record.specializations)
        ? record.specializations
            .map((value) => String(value).trim() as SquadSpecialization)
            .filter((value) => specializations.has(value))
        : [];

      return {
        memberId,
        slotType,
        position,
        specializations: specialties,
        sortOrder: toInt(record.sortOrder, index),
      };
    })
    .filter((item): item is SquadAssignmentInput => Boolean(item && item.memberId));

  const status = statuses.has(String(body.status ?? "") as MemberStatus)
    ? (String(body.status) as MemberStatus)
    : "ativo";

  return {
    name: String(body.name ?? "").trim(),
    fieldId: String(body.fieldId ?? "").trim() || null,
    operationalClass: operationalClasses.has(String(body.operationalClass ?? "") as SquadOperationalClass)
      ? (String(body.operationalClass) as SquadOperationalClass)
      : "BASE",
    rankingPoints: Math.max(0, toInt(body.rankingPoints, 0)),
    active: status === "ativo",
    enrollmentDate: String(body.enrollmentDate ?? "").trim() || null,
    status,
    photoDataUrl: String(body.photoDataUrl ?? "").trim(),
    photoScale: Math.min(140, Math.max(60, toInt(body.photoScale, 100))),
    photoPositionX: Math.min(100, Math.max(0, toInt(body.photoPositionX, 50))),
    photoPositionY: Math.min(100, Math.max(0, toInt(body.photoPositionY, 50))),
    assignments,
  };
}

export function validateSquadPayload(payload: SquadPayload) {
  if (!payload.name) {
    return "Informe o nome do squad.";
  }

  if (payload.assignments.length < 4) {
    return "O squad precisa ter no mínimo 4 integrantes.";
  }

  if (payload.assignments.length > 12) {
    return "O squad pode ter no máximo 12 integrantes.";
  }

  const memberIds = new Set<string>();
  let titularCount = 0;
  let reservaCount = 0;
  let comandoCount = 0;
  let liderCount = 0;

  for (const assignment of payload.assignments) {
    if (!assignmentTypes.has(assignment.slotType)) {
      return "Existe um integrante com tipo de participação inválido.";
    }

    if (!positions.has(assignment.position)) {
      return "Existe um integrante com posição inválida.";
    }

    if (memberIds.has(assignment.memberId)) {
      return "O mesmo integrante não pode aparecer duas vezes no squad.";
    }
    memberIds.add(assignment.memberId);

    if (assignment.slotType === "TITULAR") titularCount += 1;
    if (assignment.slotType === "RESERVA") reservaCount += 1;
    if (assignment.slotType === "COMANDO") comandoCount += 1;
    if (assignment.position === "LIDER") liderCount += 1;
  }

  if (titularCount > 8) {
    return "O squad pode ter no máximo 8 titulares.";
  }

  if (reservaCount > 3) {
    return "O squad pode ter no máximo 3 reservas.";
  }

  if (comandoCount > 1) {
    return "O squad pode ter no máximo 1 comando.";
  }

  if (liderCount < 1) {
    return "O squad precisa ter pelo menos 1 líder.";
  }

  return null;
}
