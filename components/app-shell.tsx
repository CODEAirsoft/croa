import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { AdminModeExitButton } from "@/components/admin-mode-exit-button";
import { hasAdministrativeSession } from "@/lib/admin-session";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/campos", label: "Campos" },
  { href: "/squads", label: "Squads" },
  { href: "/membros", label: "Membros" },
  { href: "/eventos", label: "Eventos" },
  { href: "/cursos", label: "Cursos" },
];

export async function AppShell({
  title,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const hasAdministrativeAccess = hasAdministrativeSession(cookieStore);
  const items = hasAdministrativeAccess
    ? [...navigationItems, { href: "/cadastros", label: "Cadastros" }, { href: "/redacao", label: "Redação" }]
    : navigationItems;

  return (
    <div className="app-frame">
      <header className="topbar card">
        <div className="topbar-grid">
          <div>
            <div className="brand-header">
              <Image
                src="/code-airsoft-logo.jpg"
                alt="Logotipo CODE Airsoft"
                width={112}
                height={112}
                className="brand-logo"
                priority
              />
              <div className="brand-copy">
                <span className="brand-kicker">CODE Airsoft</span>
                <strong className="brand-title">CROA - Central de Registro de Operador de Airsoft</strong>
              </div>
            </div>
            <h1 className="topbar-title">{title}</h1>
          </div>
        </div>
        <nav className="nav-tabs" aria-label="Navegacao principal">
          {items.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          {hasAdministrativeAccess ? <AdminModeExitButton /> : null}
        </nav>
      </header>
      {children}
    </div>
  );
}
