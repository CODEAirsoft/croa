import { NextResponse } from "next/server";

import { verifyEmergencyContactAccess } from "@/lib/critical-auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      login?: string;
      password?: string;
    };

    const login = body.login?.trim() ?? "";
    const password = body.password?.trim() ?? "";

    if (!login || !password) {
      return NextResponse.json({ error: "Informe login e senha." }, { status: 400 });
    }

    const authorized = await verifyEmergencyContactAccess({ login, password });

    if (!authorized) {
      return NextResponse.json(
        { error: "Acesso negado ao contato de emergência." },
        { status: 403 },
      );
    }

    const member = await prisma.member.findUnique({
      where: { id },
      select: {
        emergencyContactName: true,
        emergencyContactPhone: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      emergencyContactName: member.emergencyContactName ?? "",
      emergencyContactPhone: member.emergencyContactPhone ?? "",
    });
  } catch (error) {
    console.error("Falha ao liberar contato de emergência:", error);
    return NextResponse.json(
      { error: "Não foi possível liberar o contato de emergência." },
      { status: 500 },
    );
  }
}
