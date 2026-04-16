"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminModeExitButton } from "@/components/admin-mode-exit-button";

type NavigationItem = {
  href: string;
  label: string;
};

export function AppShellNavigation({
  items,
  hasAdministrativeAccess,
}: {
  items: NavigationItem[];
  hasAdministrativeAccess: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-controls="app-shell-drawer"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fechar menu principal" : "Abrir menu principal"}
        className="nav-drawer-toggle"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className="nav-tabs nav-tabs-desktop" aria-label="Navegacao principal">
        {items.map((item) => (
          <Link className="nav-link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
        {hasAdministrativeAccess ? <AdminModeExitButton /> : null}
      </nav>

      <button
        aria-hidden={!isOpen}
        className={`nav-drawer-backdrop${isOpen ? " is-open" : ""}`}
        onClick={() => setIsOpen(false)}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />

      <aside className={`nav-drawer${isOpen ? " is-open" : ""}`} id="app-shell-drawer">
        <div className="nav-drawer-header">
          <strong>Menu CROA</strong>
          <button aria-label="Fechar menu" className="nav-drawer-close" onClick={() => setIsOpen(false)} type="button">
            ×
          </button>
        </div>

        <div className="nav-drawer-links">
          {items.map((item) => (
            <Link className="nav-drawer-link" href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
              {item.label}
            </Link>
          ))}
          {hasAdministrativeAccess ? <AdminModeExitButton /> : null}
        </div>
      </aside>
    </>
  );
}
