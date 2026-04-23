import { MemberClass, MemberLevel, MemberStatus, RoleType } from "@prisma/client";

export function formatMemberRole(role: RoleType, otherRole?: string | null) {
  const labels: Record<RoleType, string> = {
    admin: "Admin",
    fundador: "Fundador",
    operador: "Operador",
    comando: "Comando",
    ranger: "Ranger",
    arbitro: "Árbitro",
    gestor: "Gestor",
    promoter: "Promoter",
    reporter: "Reporter",
    presidente: "Presidente",
    professor: "Professor",
    instrutor: "Instrutor",
    outros: otherRole?.trim() || "Outros",
  };

  return labels[role] ?? role;
}

export function formatMemberClass(memberClass: MemberClass) {
  const labels: Record<MemberClass, string> = {
    STANDARD: "Standard",
    PREMIUM: "Premium",
    TOP_TEAM: "Top Team",
    MASTER: "Master",
    OFICIAL: "Oficial",
    ALMIGHTY: "Almighty",
  };

  return labels[memberClass] ?? memberClass;
}

export function formatMemberLevel(level: MemberLevel) {
  const labels: Record<MemberLevel, string> = {
    ALPHA_0: "ALPHA 0",
    N1: "N1",
    N2: "N2",
    N3: "N3",
    N4: "N4",
    N5: "N5",
  };

  return labels[level] ?? level;
}

export function formatMemberStatus(status: MemberStatus) {
  const labels: Record<MemberStatus, string> = {
    ativo: "Ativo",
    suspenso: "Suspenso",
    inativo: "Inativo",
    excluido: "Excluído",
    rip: "R.I.P.",
  };

  return labels[status] ?? status;
}

export function formatMemberFieldLabel(field?: {
  codeNumber?: number | null;
  state?: string | null;
  countryCode?: string | null;
  name?: string | null;
} | null) {
  if (!field?.codeNumber || !field.state) {
    return "-";
  }

  const countryCode = field.countryCode?.trim().toUpperCase() || "";
  return `${field.codeNumber}º${countryCode}${field.state.toUpperCase()}`;
}
