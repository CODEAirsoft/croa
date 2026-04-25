import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";

export default function RangerGuidancePage() {
  return (
    <AppShell title="Ranger">
      <SectionCard eyebrow="Orientacao operacional" title="Fluxo do Ranger em campo">
        <div className="muted-copy">
          <p>
            O Ranger acompanha a partida pelo aparelho movel, registra pontos positivos ou negativos e
            informa ao arbitro qualquer lance que precise de validacao.
          </p>
          <p>
            Antes de iniciar, confira a sumula ativa, identifique os squads em disputa e mantenha os
            operadores corretos selecionados no Controle Remoto.
          </p>
          <p>
            Cada lancamento deve trazer observacao curta e objetiva. Ao final do jogo, a conferencia e o
            fechamento oficial ficam na Sumula do arbitro.
          </p>
        </div>
      </SectionCard>
    </AppShell>
  );
}
