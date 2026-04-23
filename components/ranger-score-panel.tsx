"use client";

import { GamePointTarget } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Option = {
  id: string;
  label: string;
};

type RangerScorePanelProps = {
  sheets: Option[];
  members: Option[];
  squads: Option[];
};

export function RangerScorePanel({ sheets, members, squads }: RangerScorePanelProps) {
  const router = useRouter();
  const [targetType, setTargetType] = useState<GamePointTarget>(GamePointTarget.OPERATOR);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      gameSheetId: String(form.get("gameSheetId") ?? ""),
      targetType,
      memberId: String(form.get("memberId") ?? ""),
      squadId: String(form.get("squadId") ?? ""),
      points: String(form.get("points") ?? ""),
      note: String(form.get("note") ?? ""),
    };

    const response = await fetch("/api/ranger-pontos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Nao foi possivel registrar a pontuacao.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Pontuacao registrada.");
    router.refresh();
  }

  return (
    <form className="ranger-console" onSubmit={handleSubmit}>
      <div className="ops-panel-heading">
        <p>Painel Ranger</p>
        <h2>Pontuacao rapida</h2>
      </div>

      <label className="field">
        <span>Sumula ativa</span>
        <select name="gameSheetId" required>
          <option value="">Selecione a sumula</option>
          {sheets.map((sheet) => (
            <option key={sheet.id} value={sheet.id}>
              {sheet.label}
            </option>
          ))}
        </select>
      </label>

      <div className="ranger-target-toggle">
        <button
          className={targetType === GamePointTarget.OPERATOR ? "selected" : ""}
          onClick={() => setTargetType(GamePointTarget.OPERATOR)}
          type="button"
        >
          Operador
        </button>
        <button
          className={targetType === GamePointTarget.SQUAD ? "selected" : ""}
          onClick={() => setTargetType(GamePointTarget.SQUAD)}
          type="button"
        >
          Squad
        </button>
      </div>

      {targetType === GamePointTarget.OPERATOR ? (
        <label className="field">
          <span>Operador</span>
          <select name="memberId" required>
            <option value="">Selecione o operador</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="field">
          <span>Squad</span>
          <select name="squadId" required>
            <option value="">Selecione o squad</option>
            {squads.map((squad) => (
              <option key={squad.id} value={squad.id}>
                {squad.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="field">
        <span>Pontos</span>
        <input name="points" placeholder="Ex: 10 ou -5" required type="number" />
      </label>

      <label className="field">
        <span>Observacao</span>
        <textarea name="note" placeholder="Motivo da pontuacao, regra aplicada ou registro do lance." rows={4} />
      </label>

      {message ? <p className="form-feedback">{message}</p> : null}

      <button className="button primary ranger-save" disabled={isSaving} type="submit">
        {isSaving ? "Registrando..." : "Registrar pontuacao"}
      </button>
    </form>
  );
}
