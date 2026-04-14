import {
  SquadAssignmentType,
  SquadOperationalClass,
  SquadPosition,
  SquadSpecialization,
} from "@prisma/client";

export const squadOperationalClassOptions: { value: SquadOperationalClass; label: string }[] = [
  { value: "BASE", label: "Base" },
  { value: "INTERMEDIARIO", label: "Intermediário" },
  { value: "AVANCADO", label: "Avançado" },
  { value: "AUTO_RENDIMENTO", label: "Auto Rendimento" },
];

export const squadAssignmentTypeOptions: { value: SquadAssignmentType; label: string }[] = [
  { value: "TITULAR", label: "Titular" },
  { value: "RESERVA", label: "Reserva" },
  { value: "COMANDO", label: "Comando" },
];

export const squadPositionOptions: { value: SquadPosition; label: string }[] = [
  { value: "PONTA", label: "Ponta" },
  { value: "APOIO", label: "Apoio" },
  { value: "SUPORTE", label: "Suporte" },
  { value: "LIDER", label: "Líder" },
  { value: "RETAGUARDA", label: "Retaguarda" },
  { value: "COMANDO", label: "Comando" },
];

export const squadSpecializationOptions: { value: SquadSpecialization; label: string }[] = [
  { value: "ASSALT", label: "Assalt" },
  { value: "SUPRESSOR", label: "Supressor" },
  { value: "SNIPER", label: "Sniper" },
  { value: "DMR", label: "DMR" },
  { value: "SPOTTER", label: "Spooter" },
  { value: "RADIO", label: "Rádio" },
  { value: "MEDICO", label: "Médico" },
  { value: "ENGENHEIRO", label: "Engenheiro" },
];

export function squadOperationalClassLabel(value: SquadOperationalClass | string) {
  return squadOperationalClassOptions.find((option) => option.value === value)?.label ?? value;
}

export function squadAssignmentTypeLabel(value: SquadAssignmentType | string) {
  return squadAssignmentTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function squadPositionLabel(value: SquadPosition | string) {
  return squadPositionOptions.find((option) => option.value === value)?.label ?? value;
}

export function squadSpecializationLabel(value: SquadSpecialization | string) {
  return squadSpecializationOptions.find((option) => option.value === value)?.label ?? value;
}

export function formatRankingCode(points: number) {
  return String(points).padStart(4, "0");
}
