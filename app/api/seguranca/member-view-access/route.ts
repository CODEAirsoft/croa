import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearAdministrativeSessions,
  createAdministrativeSessionToken,
  getAdministrativeCookieOptions,
} from "@/lib/admin-session";
import { verifyAdministrativeMemberViewAccess } from "@/lib/member-view-auth";
import { MEMBER_VIEW_SESSION_COOKIE } from "@/lib/master-password";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    login?: string;
    password?: string;
  };

  const login = body.login?.trim() ?? "";
  const password = body.password?.trim() ?? "";

  if (!login || !password) {
    return NextResponse.json({ error: "Informe login e senha para liberar a visualização administrativa." }, { status: 400 });
  }

  const authorized = await verifyAdministrativeMemberViewAccess({
    login,
    password,
  });

  if (!authorized) {
    return NextResponse.json({ error: "Credenciais sem permissão para a visualização administrativa." }, { status: 401 });
  }

  (await cookies()).set(
    MEMBER_VIEW_SESSION_COOKIE,
    createAdministrativeSessionToken("member-view"),
    getAdministrativeCookieOptions(60 * 60),
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  clearAdministrativeSessions(await cookies());
  return NextResponse.json({ ok: true });
}
