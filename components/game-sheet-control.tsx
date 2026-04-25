"use client";

import { GameSheetStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Option = {
  id: string;
  label: string;
};

type GameSheetRow = {
  id: string;
  title: string;
  status: GameSheetStatus;
  scheduledAt: string;
  eventTitle: string;
  squads: string;
  rangers: string;
  score: string;
};

type GameSheetControlProps = {
  events: Option[];
  squads: Option[];
  rangers: Option[];
  sheets: GameSheetRow[];
};

const statusLabels: Record<GameSheetStatus, string> = {
  planejado: "Planejado",
  iniciado: "Iniciado",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export function GameSheetControl({ events, squads, rangers, sheets }: GameSheetControlProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSquads, setSelectedSquads] = useState<string[]>([]);
  const [selectedRangers, setSelectedRangers] = useState<string[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      eventId: String(form.get("eventId") ?? ""),
      scheduledAt: String(form.get("scheduledAt") ?? ""),
      gameDurationMinutes: String(form.get("gameDurationMinutes") ?? ""),
      operationType: String(form.get("operationType") ?? ""),
      missionType: String(form.get("missionType") ?? ""),
      interventionType: String(form.get("interventionType") ?? ""),
      squadIds: selectedSquads,
      rangerIds: selectedRangers,
    };

    const response = await fetch("/api/sumulas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Nao foi possivel criar a sumula.");
      return;
    }

    event.currentTarget.reset();
    setSelectedSquads([]);
    setSelectedRangers([]);
    setMessage("Sumula criada com sucesso.");
    router.refresh();
  }

  async function updateStatus(id: string, status: GameSheetStatus) {
    setMessage("");
    const response = await fetch(`/api/sumulas/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error ?? "Nao foi possivel atualizar a sumula.");
      return;
    }

    router.refresh();
  }

  async function deleteSheet(id: string) {
    const confirmed = window.confirm("Deseja excluir este jogo ou cancelar a operacao?");

    if (!confirmed) {
      return;
    }

    setMessage("");
    const response = await fetch(`/api/sumulas/${id}`, {
      method: "DELETE",
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error ?? "Nao foi possivel excluir o jogo.");
      return;
    }

    setMessage("Jogo excluido com sucesso.");
    router.refresh();
  }

  function toggleSelection(current: string[], setter: (value: string[]) => void, id: string, limit: number) {
    if (current.includes(id)) {
      setter(current.filter((item) => item !== id));
      return;
    }

    setter([...current, id].slice(0, limit));
  }

  return (
    <div className="ops-stack">
      <form className="ops-panel" onSubmit={handleSubmit}>
        <div className="ops-panel-heading">
          <p>Nova sumula</p>
          <h2>Controle do arbitro</h2>
        </div>

        <div className="quick-form-grid">
          <label className="field">
            <span>Nome da sumula</span>
            <input name="title" placeholder="Ex: Operacao War Game - Rodada 1" required />
          </label>

          <label className="field">
            <span>Evento vinculado</span>
            <select name="eventId" defaultValue="">
              <option value="">Sem evento vinculado</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Dia e hora</span>
            <input name="scheduledAt" type="datetime-local" />
          </label>

          <label className="field">
            <span>Tempo do jogo</span>
            <input name="gameDurationMinutes" min="1" placeholder="Minutos" type="number" />
          </label>
        </div>

        <div className="quick-form-grid three">
          <label className="field">
            <span>Tipo de operacao</span>
            <input name="operationType" placeholder="Macro" />
          </label>

          <label className="field">
            <span>Tipo de missao</span>
            <input name="missionType" placeholder="Meso" />
          </label>

          <label className="field">
            <span>Tipo de intervencao</span>
            <input name="interventionType" placeholder="Micro" />
          </label>
        </div>

        <div className="ops-picker-grid">
          <div className="ops-picker">
            <strong>Squads em disputa</strong>
            <span>Selecione ate 8 squads.</span>
            <div className="ops-chip-list">
              {squads.map((squad) => (
                <button
                  className={selectedSquads.includes(squad.id) ? "ops-chip selected" : "ops-chip"}
                  key={squad.id}
                  onClick={() => toggleSelection(selectedSquads, setSelectedSquads, squad.id, 8)}
                  type="button"
                >
                  {squad.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ops-picker">
            <strong>Rangers do jogo</strong>
            <span>Equipe que alimenta o painel Ranger.</span>
            <div className="ops-chip-list">
              {rangers.map((ranger) => (
                <button
                  className={selectedRangers.includes(ranger.id) ? "ops-chip selected" : "ops-chip"}
                  key={ranger.id}
                  onClick={() => toggleSelection(selectedRangers, setSelectedRangers, ranger.id, 12)}
                  type="button"
                >
                  {ranger.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {message ? <p className="form-feedback">{message}</p> : null}

        <div className="form-actions">
          <button className="button primary" disabled={isSaving} type="submit">
            {isSaving ? "Criando..." : "Criar sumula"}
          </button>
        </div>
      </form>

      <section className="ops-panel">
        <div className="ops-panel-heading">
          <p>Sumulas cadastradas</p>
          <h2>Jogos e pontuacao</h2>
        </div>

        <div className="table-wrap">
          <table className="data-table ops-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Sumula</th>
                <th>Evento</th>
                <th>Data</th>
                <th>Squads</th>
                <th>Rangers</th>
                <th>Pontos</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {sheets.map((sheet) => (
                <tr key={sheet.id}>
                  <td>
                    <span className={`status-pill ${sheet.status}`}>{statusLabels[sheet.status]}</span>
                  </td>
                  <td>{sheet.title}</td>
                  <td>{sheet.eventTitle}</td>
                  <td>{sheet.scheduledAt}</td>
                  <td>{sheet.squads}</td>
                  <td>{sheet.rangers}</td>
                  <td>{sheet.score}</td>
                  <td>
                    <div className="ops-row-actions">
                      <button className="button secondary" onClick={() => updateStatus(sheet.id, GameSheetStatus.iniciado)} type="button">
                        Iniciar
                      </button>
                      <button className="button secondary" onClick={() => updateStatus(sheet.id, GameSheetStatus.finalizado)} type="button">
                        Finalizar
                      </button>
                      <button className="button secondary ops-danger-action" onClick={() => deleteSheet(sheet.id)} type="button">
                        Excluir Jogo
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sheets.length === 0 ? (
                <tr>
                  <td colSpan={8}>Nenhuma sumula cadastrada ainda.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
