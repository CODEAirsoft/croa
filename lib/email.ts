type RegistrationEmailInput = {
  fullName: string;
  recipientEmail: string;
  croaCode: string;
};

function getCroaUrl() {
  return process.env.APP_CROA_URL ?? "https://www.codea.club/croa";
}

function getTransportConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";
  const authEnabled = process.env.SMTP_AUTH !== "false";

  if (!host || !port || !user || !pass || !authEnabled) {
    return null;
  }

  return {
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user,
      pass,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
  };
}

function buildRegistrationEmailHtml({ fullName, croaCode }: RegistrationEmailInput) {
  const croaUrl = getCroaUrl();

  return `
    <div style="margin:0;padding:32px;background:#0f0f0f;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#181818;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;">
        <p style="margin:0 0 18px;color:#f0c75e;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">
          Cadastro CROA
        </p>
        <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;color:#ffffff;">
          Cadastro enviado com sucesso
        </h1>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#d9d9d9;">
          Olá, ${fullName}.
        </p>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#d9d9d9;">
          Agradecemos o seu cadastro no CROA. Seu registro foi enviado com sucesso para a administração do CROA e está em análise para liberação.
        </p>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#d9d9d9;">
          A liberação é realizada quando todas as informações enviadas são corretamente checadas.
        </p>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#d9d9d9;">
          Seu cadastro já foi registrado em nosso banco de dados e aparecerá na lista de registro oficial de membros como <strong style="color:#ffffff;">${croaCode}</strong>.
        </p>
        <div style="margin:28px 0;">
          <a href="${croaUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#f0c75e;color:#111111;text-decoration:none;font-weight:700;">
            Acessar CROA
          </a>
        </div>
        <p style="margin:22px 0 0;font-size:16px;line-height:1.7;color:#d9d9d9;">
          Agradecemos,
        </p>
        <p style="margin:6px 0 0;font-size:16px;font-weight:700;color:#ffffff;">
          Equipe CROA
        </p>
      </div>
    </div>
  `;
}

export async function sendMemberRegistrationEmail(input: RegistrationEmailInput) {
  const transportConfig = getTransportConfig();

  if (!transportConfig) {
    return { skipped: true as const, reason: "smtp_not_configured" as const };
  }

  const nodemailerModule = await import("nodemailer");
  const transporter = nodemailerModule.default.createTransport(transportConfig);

  const fromName = process.env.SMTP_FROM_NAME ?? "Equipe CROA";
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER!;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: input.recipientEmail,
    subject: "Cadastro CROA recebido com sucesso",
    html: buildRegistrationEmailHtml(input),
  });

  return { skipped: false as const };
}
