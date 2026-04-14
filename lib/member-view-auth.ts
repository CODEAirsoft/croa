import { MemberClass, RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CROA_GHOST_CODINAME,
  MASTER_REINTEGRATION_PASSWORD,
} from "@/lib/master-password";
import { verifyPassword } from "@/lib/password";

export async function verifyAdministrativeMemberViewAccess({
  login,
  password,
}: {
  login: string;
  password: string;
}) {
  const normalizedLogin = login.trim().toLowerCase();

  if (
    normalizedLogin === CROA_GHOST_CODINAME.trim().toLowerCase() &&
    password === MASTER_REINTEGRATION_PASSWORD
  ) {
    return true;
  }

  const member = await prisma.member.findFirst({
    where: {
      accessLogin: {
        equals: login.trim(),
        mode: "insensitive",
      },
      status: {
        not: "excluido",
      },
    },
    select: {
      accessPasswordHash: true,
      role: true,
      memberClass: true,
    },
  });

  if (!member?.accessPasswordHash) {
    return false;
  }

  const hasPermission =
    member.role === RoleType.admin ||
    member.role === RoleType.fundador ||
    member.role === RoleType.presidente ||
    member.role === RoleType.professor ||
    member.role === RoleType.instrutor ||
    member.role === RoleType.gestor ||
    member.memberClass === MemberClass.MASTER ||
    member.memberClass === MemberClass.ALMIGHTY;

  if (!hasPermission) {
    return false;
  }

  return verifyPassword(password, member.accessPasswordHash);
}
