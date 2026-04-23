"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type FormState = {
  recoveryLogin: string;
  passwordOne: string;
  passwordTwo: string;
  passwordThree: string;
  passwordFour: string;
  currentPassword: string;
  nextPassword: string;
};

const initialState: FormState = {
  recoveryLogin: "",
  passwordOne: "",
  passwordTwo: "",
  passwordThree: "",
  passwordFour: "",
  currentPassword: "",
  nextPassword: "",
};

export function SupremePasswordForm() {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof FormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleForgotPassword() {
    setMessage("");
    setError(
      "Por segurança, o CROA não envia a senha atual por e-mail. Use a validação desta página para redefinir a senha do eNobili.",
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/contrasenha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        redirectTo?: string;
      };

      if (data.redirectTo) {
        router.replace(data.redirectTo);
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Não foi possível alterar a senha suprema.");
        return;
      }

      setFormState(initialState);
      setMessage(data.message ?? "Senha alterada com sucesso.");
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-section-title field-full">Chave de contrasenha</div>

      <label className="field">
        <span>Login de validação</span>
        <input
          autoComplete="off"
          onChange={(event) => updateField("recoveryLogin", event.target.value)}
          value={formState.recoveryLogin}
        />
      </label>

      <label className="field">
        <span>Senha 1</span>
        <input
          autoComplete="new-password"
          onChange={(event) => updateField("passwordOne", event.target.value)}
          type="password"
          value={formState.passwordOne}
        />
      </label>

      <label className="field">
        <span>Senha 2</span>
        <input
          autoComplete="new-password"
          onChange={(event) => updateField("passwordTwo", event.target.value)}
          type="password"
          value={formState.passwordTwo}
        />
      </label>

      <label className="field">
        <span>Senha 3</span>
        <input
          autoComplete="new-password"
          onChange={(event) => updateField("passwordThree", event.target.value)}
          type="password"
          value={formState.passwordThree}
        />
      </label>

      <label className="field">
        <span>Senha 4</span>
        <input
          autoComplete="new-password"
          onChange={(event) => updateField("passwordFour", event.target.value)}
          type="password"
          value={formState.passwordFour}
        />
      </label>

      <div className="form-section-title field-full">Troca do eNobili</div>

      <label className="field">
        <span>Login protegido</span>
        <input readOnly value="eNobili" />
      </label>

      <label className="field">
        <span>Senha atual do eNobili</span>
        <input
          autoComplete="current-password"
          onChange={(event) => updateField("currentPassword", event.target.value)}
          type="password"
          value={formState.currentPassword}
        />
      </label>

      <label className="field">
        <span>Nova senha do eNobili</span>
        <input
          autoComplete="new-password"
          onChange={(event) => updateField("nextPassword", event.target.value)}
          type="password"
          value={formState.nextPassword}
        />
      </label>

      {error ? <p className="form-error field-full">{error}</p> : null}
      {message ? <p className="form-success field-full">{message}</p> : null}

      <div className="form-actions field-full">
        <button className="primary-button" disabled={isPending} type="submit">
          {isPending ? "Alterando..." : "Alterar senha"}
        </button>
        <button className="ghost-button" onClick={handleForgotPassword} type="button">
          Esqueci minha senha
        </button>
      </div>
    </form>
  );
}
