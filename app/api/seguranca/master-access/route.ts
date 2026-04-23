import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { isLikelyMobileDevice } from "@/lib/device";
import { MASTER_SESSION_COOKIE } from "@/lib/master-password";
import {
  clearAdministrativeSessions,
  createAdministrativeSessionToken,
  getAdministrativeCookieOptions,
} from "@/lib/admin-session";
import { verifySupremeCredentials } from "@/lib/critical-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    codiname?: string;
    password?: string;
  };

  const userAgent = (await headers()).get("user-agent") ?? "";

  if (isLikelyMobileDevice(userAgent)) {
    return NextResponse.json(
      { error: "O acesso crítico do CROA-000000 é permitido somente em PC." },
      { status: 403 },
    );
  }

  if (!(await verifySupremeCredentials({ login: body.codiname ?? "", password: body.password ?? "" }))) {
    return NextResponse.json({ error: "Login ou senha master inválidos." }, { status: 401 });
  }

  (await cookies()).set(
    MASTER_SESSION_COOKIE,
    createAdministrativeSessionToken("master"),
    getAdministrativeCookieOptions(60 * 30),
  );

  return NextResponse.json({
    ok: true,
    message: "Acesso crítico liberado nesta sessão.",
  });
}

export async function DELETE() {
  clearAdministrativeSessions(await cookies());
  return NextResponse.json({ ok: true });
}
