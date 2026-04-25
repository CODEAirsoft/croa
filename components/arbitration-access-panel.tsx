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
    <section className="card quick-access-card">
      <div className="critical-access-copy">
        <span className="eyebrow">Arbitragem</span>
        <strong>{authorized ? "Acesso liberado" : "Login necessario"}</strong>
        <p>
          Entram aqui o eNobili, arbitros, ranger e gerentes. Depois do login, a area libera Sumula,
          Controle Remoto e orientacao para Rangers.
        </p>
      </div>

      {authorized ? (
        <div className="form-actions">
          <button className="button secondary" disabled={isPending} onClick={handleLogout} type="button">
            {isPending ? "Saindo..." : "Encerrar arbitragem"}
          </button>
        </div>
      ) : (
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

          <div className="form-actions">
            <button className="button primary" disabled={isPending} type="submit">
              {isPending ? "Entrando..." : "Abrir arbitragem"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
