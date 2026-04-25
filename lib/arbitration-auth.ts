import { MemberClass, OfficialSubclass, RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySupremeCredentials } from "@/lib/critical-auth";
import { verifyPassword } from "@/lib/password";

export async function verifyArbitrationAccess({
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
      officialSubclass: true,
    },
  });

  if (!member?.accessPasswordHash) {
    return false;
  }

  const hasPermission =
    member.memberClass === MemberClass.MASTER ||
    member.memberClass === MemberClass.ALMIGHTY ||
    member.officialSubclass === OfficialSubclass.ARBITRO ||
    member.officialSubclass === OfficialSubclass.RANGER ||
    member.officialSubclass === OfficialSubclass.GERENTE ||
    member.role === RoleType.admin ||
    member.role === RoleType.gestor ||
    member.role === RoleType.ranger ||
    member.role === RoleType.arbitro;

  if (!hasPermission) {
    return false;
  }

  return verifyPassword(password, member.accessPasswordHash);
}
