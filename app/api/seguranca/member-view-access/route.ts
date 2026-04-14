import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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

  (await cookies()).set(MEMBER_VIEW_SESSION_COOKIE, "authorized", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(MEMBER_VIEW_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
