import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { isLikelyMobileDevice } from "@/lib/device";
import {
  CROA_GHOST_CODINAME,
  MASTER_REINTEGRATION_PASSWORD,
  MASTER_SESSION_COOKIE,
} from "@/lib/master-password";

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

  if (body.codiname !== CROA_GHOST_CODINAME || body.password !== MASTER_REINTEGRATION_PASSWORD) {
    return NextResponse.json({ error: "Login ou senha master inválidos." }, { status: 401 });
  }

  (await cookies()).set(MASTER_SESSION_COOKIE, "authorized", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 30,
    path: "/",
  });

  return NextResponse.json({
    ok: true,
    message: "Acesso crítico liberado nesta sessão.",
  });
}

export async function DELETE() {
  (await cookies()).delete(MASTER_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
