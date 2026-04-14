"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminRecordEditorProps = {
  title: string;
  description: string;
  endpoint: string;
  returnHref: string;
  initialValue: string;
};

export function AdminRecordEditor({
  title,
  description,
  endpoint,
  returnHref,
  initialValue,
}: AdminRecordEditorProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const parsed = JSON.parse(value);
        const response = await fetch(endpoint, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed),
        });

        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(result.error ?? "Não foi possível salvar as alterações.");
          return;
        }

        setMessage("Alterações salvas com sucesso.");
        router.refresh();
      } catch {
        setError("O conteúdo precisa estar em JSON válido para salvar.");
      }
    });
  }

  function handleDelete() {
    const confirmed = window.confirm("Tem certeza que deseja excluir este registro?");
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Não foi possível excluir o registro.");
        return;
      }

      router.push(returnHref);
      router.refresh();
    });
  }

  return (
    <section className="card section-card admin-editor-card">
      <div className="card-header">
        <span className="eyebrow">Gestão administrativa</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="admin-editor-actions">
        <a className="button secondary" href={returnHref}>
          Voltar
        </a>
        <button className="button secondary" disabled={isPending} onClick={handleDelete} type="button">
          Excluir registro
        </button>
        <button className="button primary" disabled={isPending} onClick={handleSave} type="button">
          {isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      <label className="field">
        <span>Conteúdo do registro</span>
        <textarea
          className="admin-editor-textarea"
          onChange={(event) => setValue(event.target.value)}
          rows={24}
          spellCheck={false}
          value={value}
        />
      </label>

      {message ? <p className="form-message success-text">{message}</p> : null}
      {error ? <p className="form-message error-text">{error}</p> : null}
    </section>
  );
}
