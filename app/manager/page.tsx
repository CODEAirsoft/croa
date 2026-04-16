import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { MemberViewAccessPanel } from "@/components/member-view-access-panel";
import { hasAdministrativeSession } from "@/lib/admin-session";

export default async function ManagerPage() {
  const cookieStore = await cookies();
  const hasAdministrativeAccess = hasAdministrativeSession(cookieStore);

  return (
    <main className="page-shell">
      <AppShell
        title="Gerenciador administrativo"
        description="Ative ou desative a administração do sistema neste ponto central. Quando ativa, a edição fica liberada nas áreas protegidas do app."
      >
        <section className="card section-card">
          <div className="card-header">
            <span className="eyebrow">Manager</span>
            <h2>Controle da administração</h2>
          </div>

          <MemberViewAccessPanel
            authorized={hasAdministrativeAccess}
            buttonLabel="Administração"
            defaultOpen={!hasAdministrativeAccess}
          />
        </section>
      </AppShell>
    </main>
  );
}
