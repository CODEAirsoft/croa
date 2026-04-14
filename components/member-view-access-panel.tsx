"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export function MemberViewAccessPanel({
  authorized,
  compact = false,
  buttonLabel = "Liberar visualização administrativa",
  showLogout = true,
  defaultOpen = false,
}: {
  authorized: boolean;
  compact?: boolean;
  buttonLabel?: string;
  showLogout?: boolean;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && defaultOpen && !authorized) {
      setIsOpen(true);
    }
  }, [authorized, defaultOpen, isMounted]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const payload = {
      login: login.trim(),
      password: password.trim(),
    };

    startTransition(async () => {
      const response = await fetch("/api/seguranca/member-view-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Não foi possível liberar a visualização administrativa.");
        return;
      }

      setLogin("");
      setPassword("");
      setIsOpen(false);
      router.refresh();
    });
  }

  function handleCloseAccess() {
    startTransition(async () => {
      await fetch("/api/seguranca/member-view-access", {
        method: "DELETE",
      });
      router.refresh();
    });
  }

  const actionButton = !authorized ? (
    <button
      className={`button secondary${compact ? " members-admin-button" : ""}`}
      onClick={() => {
        setError("");
        setLogin("");
        setPassword("");
        setIsOpen(true);
      }}
      type="button"
    >
      {compact ? (
        <>
          <span className="members-admin-label-default">{buttonLabel}</span>
          <span className="members-admin-label-hover">Ativar administração</span>
        </>
      ) : (
        buttonLabel
      )}
    </button>
  ) : showLogout ? (
    <button
      className={`button secondary${compact ? " members-admin-button members-admin-button-active" : ""}`}
      disabled={isPending}
      onClick={handleCloseAccess}
      type="button"
    >
      {compact ? (
        <>
          <span className="members-admin-label-default">Administração ativada</span>
          <span className="members-admin-label-hover">Desativar administração</span>
        </>
      ) : (
        "Encerrar acesso administrativo"
      )}
    </button>
  ) : (
    <div className={`button secondary${compact ? " members-admin-button members-admin-button-active" : ""}`}>
      {compact ? "Administração ativada" : "Acesso administrativo liberado"}
    </div>
  );

  return (
    <>
      {compact ? (
        <div className="members-admin-inline">{actionButton}</div>
      ) : (
        <div className="critical-access card">
          <div className="critical-access-copy">
            <span className="eyebrow">Visualização administrativa</span>
            <strong>{authorized ? "Acesso administrativo liberado" : "Leitura resumida ativa"}</strong>
            <p>
              Admin, MASTER e ALMIGHTY podem liberar a visualização completa e os botões de edição com login e senha.
            </p>
          </div>

          <div className="critical-access-actions">{actionButton}</div>
        </div>
      )}

      {isOpen && isMounted
        ? createPortal(
            <div className="critical-modal-backdrop" role="presentation">
              <div aria-modal="true" className="critical-modal card" role="dialog">
                <div className="critical-modal-copy">
                  <strong>Login administrativo</strong>
                  <p>Use o login e a senha de um membro com perfil Admin, MASTER ou ALMIGHTY.</p>
                </div>

                <form autoComplete="off" className="quick-form" onSubmit={handleSubmit}>
                  <label className="field">
                    <span>Login</span>
                    <input
                      autoComplete="off"
                      name="login"
                      onChange={(event) => setLogin(event.target.value)}
                      required
                      value={login}
                    />
                  </label>

                  <label className="field">
                    <span>Senha</span>
                    <input
                      autoComplete="new-password"
                      name="password"
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      type="password"
                      value={password}
                    />
                  </label>

                  {error ? <p className="form-message error-text">{error}</p> : null}

                  <div className="critical-modal-actions">
                    <button
                      className="button secondary"
                      onClick={() => {
                        setError("");
                        setLogin("");
                        setPassword("");
                        setIsOpen(false);
                      }}
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button className="button primary" disabled={isPending} type="submit">
                      {isPending ? "Validando..." : "Entrar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
