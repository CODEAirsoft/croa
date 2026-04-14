"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function CriticalAccessPanel({
  authorized,
}: {
  authorized: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      codiname: String(formData.get("codiname") ?? "").trim(),
      password: String(formData.get("password") ?? "").trim(),
    };

    startTransition(async () => {
      const response = await fetch("/api/seguranca/master-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Não foi possível liberar o acesso crítico.");
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  function handleCloseAccess() {
    startTransition(async () => {
      await fetch("/api/seguranca/master-access", {
        method: "DELETE",
      });
      router.refresh();
    });
  }

  return (
    <div className="critical-access card">
      <div className="critical-access-copy">
        <span className="eyebrow">Acesso Crítico</span>
        <strong>{authorized ? "Sessão crítica ativa" : "Proteção do CROA-000000"}</strong>
        <p>
          Alterações críticas exigem autenticação do registro fantasma do sistema e devem ser feitas
          somente no PC.
        </p>
      </div>

      <div className="critical-access-actions">
        {authorized ? (
          <button className="button secondary" disabled={isPending} onClick={handleCloseAccess} type="button">
            Encerrar acesso crítico
          </button>
        ) : (
          <button className="button secondary" onClick={() => setIsOpen(true)} type="button">
            Liberar acesso crítico
          </button>
        )}
      </div>

      {isOpen ? (
        <div className="critical-modal-backdrop" role="presentation">
          <div aria-modal="true" className="critical-modal card" role="dialog">
            <div className="critical-modal-copy">
              <strong>Login crítico do sistema</strong>
              <p>Informe o codinome e a senha master do CROA-000000.</p>
            </div>

            <form className="quick-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Codinome</span>
                <input defaultValue="eNobili" name="codiname" required />
              </label>

              <label className="field">
                <span>Senha master</span>
                <input name="password" required type="password" />
              </label>

              {error ? <p className="form-message error-text">{error}</p> : null}

              <div className="critical-modal-actions">
                <button className="button secondary" onClick={() => setIsOpen(false)} type="button">
                  Cancelar
                </button>
                <button className="button primary" disabled={isPending} type="submit">
                  {isPending ? "Validando..." : "Entrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
