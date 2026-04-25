import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearAdministrativeSessions,
  createAdministrativeSessionToken,
  getAdministrativeCookieOptions,
} from "@/lib/admin-session";
import { verifyArbitrationAccess } from "@/lib/arbitration-auth";
import { ARBITRATION_SESSION_COOKIE } from "@/lib/master-password";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    login?: string;
    password?: string;
  };

  const login = body.login?.trim() ?? "";
  const password = body.password?.trim() ?? "";

  if (!login || !password) {
    return NextResponse.json({ error: "Informe login e senha para abrir a arbitragem." }, { status: 400 });
  }

  const authorized = await verifyArbitrationAccess({ login, password });

  if (!authorized) {
    return NextResponse.json(
      { error: "Credenciais sem permissao para a area de arbitragem." },
      { status: 401 },
    );
  }

  (await cookies()).set(
    ARBITRATION_SESSION_COOKIE,
    createAdministrativeSessionToken("arbitration"),
    getAdministrativeCookieOptions(60 * 60 * 8),
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  clearAdministrativeSessions(await cookies());
  return NextResponse.json({ ok: true });
}
