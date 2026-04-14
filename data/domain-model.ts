export type RoleType =
  | "gestor"
  | "operador_desportivo"
  | "arbitro"
  | "ranger"
  | "lider_squad"
  | "praticante";

export type MemberLevel =
  | "recruta"
  | "operacional"
  | "especialista"
  | "instrutor"
  | "coordenacao";

export type EventType = "treino" | "operacao" | "avaliacao";

export interface Field {
  id: string;
  name: string;
  city: string;
  capacity: number;
  operatorId: string;
}

export interface Squad {
  id: string;
  name: string;
  motto: string;
  leaderId: string;
  rankingPoints: number;
}

export interface Member {
  id: string;
  fullName: string;
  role: RoleType;
  level: MemberLevel;
  squadId?: string;
  points: number;
  attendanceRate: number;
  cooldownDaysRemaining: number;
}

export interface EventRecord {
  id: string;
  title: string;
  type: EventType;
  fieldId: string;
  scheduledAt: string;
  maxParticipants: number;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  memberId: string;
  status: "confirmado" | "presente" | "ausente" | "justificado";
  scoreEarned: number;
}

export interface PromotionRule {
  from: MemberLevel;
  to: MemberLevel;
  minimumPoints: number;
  minimumAttendanceRate: number;
  minimumCooldownDays: number;
}

export const initialPromotionRules: PromotionRule[] = [
  {
    from: "recruta",
    to: "operacional",
    minimumPoints: 100,
    minimumAttendanceRate: 75,
    minimumCooldownDays: 30,
  },
  {
    from: "operacional",
    to: "especialista",
    minimumPoints: 240,
    minimumAttendanceRate: 80,
    minimumCooldownDays: 60,
  },
];
