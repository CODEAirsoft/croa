import { prisma } from "@/lib/prisma";
import {
  CROA_GHOST_NUMBER,
  MASTER_REINTEGRATION_LOGIN,
  MASTER_REINTEGRATION_PASSWORD,
  MASTER_REINTEGRATION_PASSWORD_HASH,
} from "@/lib/master-password";
import { verifyPassword, verifyPlainSecret } from "@/lib/password";

function verifyMasterSecret(password: string) {
  if (MASTER_REINTEGRATION_PASSWORD_HASH) {
    return verifyPassword(password, MASTER_REINTEGRATION_PASSWORD_HASH);
  }

  if (MASTER_REINTEGRATION_PASSWORD) {
    return verifyPlainSecret(password, MASTER_REINTEGRATION_PASSWORD);
  }

  return false;
}

export function verifyMasterCredentials({
  login,
  password,
}: {
  login: string;
  password: string;
}) {
  const normalizedLogin = login.trim().toLowerCase();
  const expectedLogin = MASTER_REINTEGRATION_LOGIN.trim().toLowerCase();

  if (!normalizedLogin || normalizedLogin !== expectedLogin) {
    return false;
  }

  return verifyMasterSecret(password);
}

export async function verifySupremeCredentials({
  login,
  password,
}: {
  login: string;
  password: string;
}) {
  const normalizedLogin = login.trim().toLowerCase();
  const expectedLogin = MASTER_REINTEGRATION_LOGIN.trim().toLowerCase();

  if (!normalizedLogin || normalizedLogin !== expectedLogin) {
    return false;
  }

  const supremeMember = await prisma.member.findUnique({
    where: {
      croaNumber: CROA_GHOST_NUMBER,
    },
    select: {
      accessPasswordHash: true,
      status: true,
    },
  });

  if (supremeMember?.accessPasswordHash && supremeMember.status !== "excluido") {
    return verifyPassword(password, supremeMember.accessPasswordHash);
  }

  return verifyMasterSecret(password);
}

export async function verifyCriticalOperatorAccess({
  login,
  password,
}: {
  login: string;
  password: string;
}) {
  if (await verifySupremeCredentials({ login, password })) {
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
