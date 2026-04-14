import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const cadastroItems = [
  {
    title: "Cadastro de membros",
    description: "Crie o registro oficial de operadores, gestores, comandos, rangers e árbitros do CROA.",
    href: "/cadastros/membros",
    image: "/cadastro-base-humana.png",
    eyebrow: "Base humana",
    buttonLabel: "Abrir formulário",
  },
  {
    title: "Cadastro de campos",
    description: "Organize os campos, seus responsáveis e a identificação oficial por país e estado.",
    href: "/cadastros/campos",
    image: "/cadastro-campos.png",
    eyebrow: "Infraestrutura",
    buttonLabel: "Abrir formulário",
  },
  {
    title: "Cadastro de squads",
    description: "Estruture equipes, lideranças, composição tática e histórico esportivo oficial.",
    href: "/cadastros/squads",
    image: "/code-airsoft-logo.jpg",
    eyebrow: "Equipes",
    buttonLabel: "Abrir formulário",
  },
  {
    title: "Cadastro de eventos",
    description: "Cadastre jogos, operações, treinos, competições e demais ações oficiais da modalidade.",
    href: "/cadastros/eventos",
    image: "/cadastro-campos.png",
    eyebrow: "Eventos",
    buttonLabel: "Abrir formulário",
  },
  {
    title: "Cadastro de cursos",
    description: "Estruture avaliações, workshops, palestras, exames e trilhas de formação do CROA.",
    href: "/cadastros/cursos",
    image: "/cadastro-campos.png",
    eyebrow: "Formação",
    buttonLabel: "Abrir formulário",
  },
];

export default function CadastrosPage() {
  return (
    <main className="page-shell">
      <AppShell title="Central de cadastros" description="">
        <section className="registration-grid">
          {cadastroItems.map((item) => (
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
      </AppShell>
    </main>
  );
}
