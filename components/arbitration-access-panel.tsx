"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ArbitrationAccessPanel({ authorized }: { authorized: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/arbitragem/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: login.trim(),
          password: password.trim(),
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Nao foi possivel abrir a arbitragem.");
        return;
      }

      setLogin("");
      setPassword("");
      router.refresh();
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/arbitragem/login", {
        method: "DELETE",
      });
      router.refresh();
    });
  }

  return (
    <section className="card arbitration-login-shell">
      <div className="arbitration-login-copy">
        <span className="arbitration-login-kicker">Arbitragem oficial</span>
        <h2 className="arbitration-login-title">
          {authorized ? "Acesso liberado para a mesa de arbitragem" : "Entrada restrita para a central de arbitragem"}
        </h2>
        <p className="arbitration-login-description">
          Entram aqui o eNobili, arbitros, ranger e gerentes. Depois do login, a area libera Sumula,
          Controle Remoto e orientacao para Rangers com o mesmo padrao oficial do CROA.
        </p>

        <div className="arbitration-login-tags" aria-hidden="true">
          <span>Mesa oficial</span>
          <span>Controle remoto</span>
          <span>Orientacao tatica</span>
        </div>
      </div>

      {authorized ? (
        <div className="arbitration-login-panel arbitration-login-panel-active">
          <div className="arbitration-login-active-state">
            <span className="arbitration-login-state-badge">Sessao ativa</span>
            <strong>Os modulos de arbitragem ja estao liberados para este navegador.</strong>
            <p>Se quiser encerrar esta sessao, use o botao abaixo.</p>
          </div>

          <div className="form-actions">
            <button
              className="button secondary arbitration-login-submit arbitration-login-submit-secondary"
              disabled={isPending}
              onClick={handleLogout}
              type="button"
            >
              {isPending ? "Saindo..." : "Encerrar arbitragem"}
            </button>
          </div>
        </div>
      ) : (
        <form autoComplete="off" className="arbitration-login-panel arbitration-login-form" onSubmit={handleSubmit}>
          <div className="arbitration-login-form-header">
            <span className="arbitration-login-form-eyebrow">Login necessario</span>
            <strong>Identifique-se para abrir a area protegida</strong>
          </div>

          <label className="field arbitration-login-field">
            <span>Login</span>
            <input
              autoComplete="off"
              name="login"
              onChange={(event) => setLogin(event.target.value)}
              placeholder="Digite seu login"
              required
              value={login}
            />
          </label>

          <label className="field arbitration-login-field">
            <span>Senha</span>
            <input
              autoComplete="new-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="form-message error-text arbitration-login-error">{error}</p> : null}

          <div className="form-actions">
            <button className="button primary arbitration-login-submit" disabled={isPending} type="submit">
              {isPending ? "Entrando..." : "Abrir arbitragem"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
