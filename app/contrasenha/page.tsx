import { AppShell } from "@/components/app-shell";
import { SupremePasswordForm } from "@/components/supreme-password-form";

export default function CounterPasswordPage() {
  return (
    <main className="page-shell">
      <AppShell
        title="Contrasenha"
        description="Área restrita para redefinir a senha do acesso supremo eNobili."
      >
        <section className="card section-card">
          <div className="card-header">
            <span className="eyebrow">Acesso supremo</span>
            <h2>Troca segura da senha eNobili</h2>
          </div>

          <SupremePasswordForm />
        </section>
      </AppShell>
    </main>
  );
}
