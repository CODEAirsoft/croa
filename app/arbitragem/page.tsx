import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { ArbitrationAccessPanel } from "@/components/arbitration-access-panel";
import { hasArbitrationSession } from "@/lib/admin-session";

const arbitrationItems = [
  {
    title: "Abrir sumula",
    description: "Cadastre partidas, vincule evento, squads, rangers, arbitros e acompanhe o andamento de cada jogo.",
    href: "/sumula",
    image: "/cadastro-eventos.svg",
    eyebrow: "Arbitragem central",
    buttonLabel: "Abrir sumula",
  },
  {
    title: "Controle Remoto",
    description: "Painel rapido para lancar ou retirar pontos de operador e squad durante o jogo ativo.",
    href: "/ranger",
    image: "/cadastro-membros.svg",
    eyebrow: "Pontuacao ao vivo",
    buttonLabel: "Abrir controle",
  },
  {
    title: "Ranger",
    description: "Orientacao visual para a equipe Ranger sobre fluxo de pontuacao, registro de lances e comunicacao de campo.",
    href: "/arbitragem/ranger",
    image: "/cadastro-squads.svg",
    eyebrow: "Orientacao",
    buttonLabel: "Ver orientacao",
  },
];

export const dynamic = "force-dynamic";

export default async function ArbitragemPage() {
  const cookieStore = await cookies();
  const authorized = hasArbitrationSession(cookieStore);

  return (
    <main className="page-shell">
      <AppShell title="Arbitragem" description="">
        {!authorized ? <ArbitrationAccessPanel authorized={authorized} /> : null}

        {authorized ? (
          <section className="registration-grid">
            {arbitrationItems.map((item) => (
              <article className="card registration-card" key={item.href}>
                <div className="registration-card-media">
                  <Image alt={item.title} fill sizes="(max-width: 900px) 100vw, 33vw" src={item.image} />
                </div>
                <div className="registration-card-copy">
                  <span className="eyebrow">{item.eyebrow}</span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <Link className="button primary registration-card-button" href={item.href}>
                    {item.buttonLabel}
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </AppShell>
    </main>
  );
}
