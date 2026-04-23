import { MemberClass, MemberLevel, MemberStatus, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { verifySupremeCredentials } from "@/lib/critical-auth";
import { CROA_GHOST_CODINAME, CROA_GHOST_NUMBER } from "@/lib/master-password";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const RECOVERY_LOGIN = "Enrico";
const RECOVERY_PASSWORDS = ["Danieli", "Camila", "Franco", "Ivo"];

function matchesRecoveryChallenge(body: {
  recoveryLogin?: string;
  passwordOne?: string;
  passwordTwo?: string;
  passwordThree?: string;
  passwordFour?: string;
}) {
  const submittedPasswords = [
    body.passwordOne,
    body.passwordTwo,
    body.passwordThree,
    body.passwordFour,
  ].map((value) => value?.trim() ?? "");

  return (
    body.recoveryLogin?.trim() === RECOVERY_LOGIN &&
    submittedPasswords.every((value, index) => value === RECOVERY_PASSWORDS[index])
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    recoveryLogin?: string;
    passwordOne?: string;
    passwordTwo?: string;
    passwordThree?: string;
    passwordFour?: string;
    currentPassword?: string;
    nextPassword?: string;
  };

  if (!matchesRecoveryChallenge(body)) {
    return NextResponse.json({ redirectTo: "/" }, { status: 401 });
  }

  const currentPassword = body.currentPassword?.trim() ?? "";
  const nextPassword = body.nextPassword?.trim() ?? "";

  if (!currentPassword || !nextPassword) {
    return NextResponse.json(
      { error: "Informe a senha atual e a nova senha do eNobili." },
      { status: 400 },
    );
  }

  if (nextPassword.length < 8) {
    return NextResponse.json(
      { error: "A nova senha precisa ter pelo menos 8 caracteres." },
      { status: 400 },
    );
  }

  const canChangePassword = await verifySupremeCredentials({
    login: CROA_GHOST_CODINAME,
    password: currentPassword,
  });

  if (!canChangePassword) {
    return NextResponse.json({ error: "Senha atual do eNobili incorreta." }, { status: 401 });
  }

  await prisma.member.upsert({
    where: {
      croaNumber: CROA_GHOST_NUMBER,
    },
    create: {
      croaNumber: CROA_GHOST_NUMBER,
      codiname: CROA_GHOST_CODINAME,
      fullName: "Administrador Supremo CROA",
      accessLogin: CROA_GHOST_CODINAME,
      accessPasswordHash: hashPassword(nextPassword),
      role: RoleType.admin,
      level: MemberLevel.N5,
      memberClass: MemberClass.ALMIGHTY,
      status: MemberStatus.ativo,
    },
    update: {
      codiname: CROA_GHOST_CODINAME,
      fullName: "Administrador Supremo CROA",
      accessLogin: CROA_GHOST_CODINAME,
      accessPasswordHash: hashPassword(nextPassword),
      role: RoleType.admin,
      level: MemberLevel.N5,
      memberClass: MemberClass.ALMIGHTY,
      status: MemberStatus.ativo,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Senha suprema do eNobili alterada com sucesso.",
  });
}
