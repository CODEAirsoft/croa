import type {
  AttendanceRecord,
  EventRecord,
  Field,
  Member,
  Squad,
} from "@/data/domain-model";

export const demoSquads: Squad[] = [
  {
    id: "squad-lobo",
    name: "Squad Lobo",
    motto: "Disciplina e agressividade controlada.",
    leaderId: "membro-marcos",
    rankingPoints: 420,
  },
  {
    id: "squad-falcao",
    name: "Squad Falcao",
    motto: "Mobilidade, leitura e resposta rapida.",
    leaderId: "membro-ana",
    rankingPoints: 395,
  },
  {
    id: "squad-vanguarda",
    name: "Squad Vanguarda",
    motto: "Base de recrutas em crescimento.",
    leaderId: "membro-pedro",
    rankingPoints: 280,
  },
];

export const demoMembers: Member[] = [
  {
    id: "membro-marcos",
    fullName: "Marcos Silva",
    role: "lider_squad",
    level: "especialista",
    squadId: "squad-lobo",
    points: 182,
    attendanceRate: 92,
    cooldownDaysRemaining: 0,
  },
  {
    id: "membro-ana",
    fullName: "Ana Ribeiro",
    role: "arbitro",
    level: "instrutor",
    squadId: "squad-falcao",
    points: 210,
    attendanceRate: 95,
    cooldownDaysRemaining: 0,
  },
  {
    id: "membro-pedro",
    fullName: "Pedro Costa",
    role: "ranger",
    level: "operacional",
    squadId: "squad-vanguarda",
    points: 116,
    attendanceRate: 81,
    cooldownDaysRemaining: 12,
  },
  {
    id: "membro-luiza",
    fullName: "Luiza Martins",
    role: "praticante",
    level: "recruta",
    squadId: "squad-vanguarda",
    points: 68,
    attendanceRate: 78,
    cooldownDaysRemaining: 22,
  },
];

export const demoFields: Field[] = [
  {
    id: "campo-serra-verde",
    name: "Campo Serra Verde",
    city: "Contagem",
    capacity: 120,
    operatorId: "membro-marcos",
  },
  {
    id: "campo-delta",
    name: "Campo Delta",
    city: "Belo Horizonte",
    capacity: 80,
    operatorId: "membro-ana",
  },
];

export const demoEvents: EventRecord[] = [
  {
    id: "evento-fundamentos",
    title: "Treino de fundamentos e seguranca",
    type: "treino",
    fieldId: "campo-serra-verde",
    scheduledAt: "2026-04-08T09:00:00.000Z",
    maxParticipants: 40,
  },
  {
    id: "evento-reconquista",
    title: "Operacao Reconquista",
    type: "operacao",
    fieldId: "campo-delta",
    scheduledAt: "2026-04-21T11:00:00.000Z",
    maxParticipants: 80,
  },
  {
    id: "evento-avaliacao",
    title: "Avaliacao de progressao de recrutas",
    type: "avaliacao",
    fieldId: "campo-serra-verde",
    scheduledAt: "2026-04-27T13:00:00.000Z",
    maxParticipants: 20,
  },
];

export const demoAttendance: AttendanceRecord[] = [
  {
    id: "presenca-1",
    eventId: "evento-fundamentos",
    memberId: "membro-luiza",
    status: "confirmado",
    scoreEarned: 10,
  },
  {
    id: "presenca-2",
    eventId: "evento-fundamentos",
    memberId: "membro-pedro",
    status: "confirmado",
    scoreEarned: 12,
  },
  {
    id: "presenca-3",
    eventId: "evento-reconquista",
    memberId: "membro-marcos",
    status: "confirmado",
    scoreEarned: 20,
  },
];

export function getSquadName(squadId?: string) {
  return demoSquads.find((squad) => squad.id === squadId)?.name ?? "Sem squad";
}

export function getFieldName(fieldId: string) {
  return demoFields.find((field) => field.id === fieldId)?.name ?? "Campo nao encontrado";
}

export function getMemberName(memberId: string) {
  return demoMembers.find((member) => member.id === memberId)?.fullName ?? "Membro nao encontrado";
}
