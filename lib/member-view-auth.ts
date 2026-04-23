import { MemberClass, RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySupremeCredentials } from "@/lib/critical-auth";
import { verifyPassword } from "@/lib/password";

export async function verifyAdministrativeMemberViewAccess({
  login,
  password,
}: {
  login: string;
  password: string;
}) {
  if (await verifySupremeCredentials({ login, password })) {
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
