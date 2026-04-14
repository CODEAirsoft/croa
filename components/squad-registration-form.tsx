"use client";

import { MemberStatus, SquadAssignmentType, SquadOperationalClass, SquadPosition, SquadSpecialization } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useRef, useState, useTransition } from "react";
import { formatRankingCode, squadAssignmentTypeLabel, squadAssignmentTypeOptions, squadOperationalClassOptions, squadPositionLabel, squadPositionOptions, squadSpecializationLabel, squadSpecializationOptions } from "@/lib/squad";

type FieldOption = {
  id: string;
  code: string;
  name: string;
};

type MemberOption = {
  id: string;
  croaCode: string;
  codiname: string;
  memberClassLabel: string;
  levelLabel: string;
  photoDataUrl: string;
};

type AssignmentFormValue = {
  memberId: string;
  slotType: SquadAssignmentType;
  position: SquadPosition;
  specializations: SquadSpecialization[];
};

type SquadInitialData = {
  id: string;
  name: string;
  fieldId: string;
  operationalClass: SquadOperationalClass;
  rankingPoints: number;
  active: boolean;
  enrollmentDate: string;
  status: MemberStatus;
  photoDataUrl: string;
  photoScale: number;
  photoPositionX: number;
  photoPositionY: number;
  assignments: AssignmentFormValue[];
};

const statusOptions: { value: MemberStatus; label: string; badgeClass: string }[] = [
  { value: "ativo", label: "Ativo", badgeClass: "status-active" },
  { value: "suspenso", label: "Suspenso", badgeClass: "status-suspended" },
  { value: "inativo", label: "Inativo", badgeClass: "status-inactive" },
  { value: "excluido", label: "Excluído", badgeClass: "status-excluded" },
  { value: "rip", label: "R.I.P.", badgeClass: "status-rip" },
];

const defaultAssignment = (): AssignmentFormValue => ({
  memberId: "",
  slotType: "TITULAR",
  position: "PONTA",
  specializations: [],
});

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

export function SquadRegistrationForm({
  fieldOptions,
  memberOptions,
  initialData,
  endpoint,
  submitLabel,
  successMessage,
  returnHref,
  allowDelete = false,
}: {
  fieldOptions: FieldOption[];
  memberOptions: MemberOption[];
  initialData?: SquadInitialData;
  endpoint?: string;
  submitLabel?: string;
  successMessage?: string;
  returnHref?: string;
  allowDelete?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState(initialData?.photoDataUrl || "");
  const [photoScale, setPhotoScale] = useState(initialData?.photoScale ?? 100);
  const [photoPositionX, setPhotoPositionX] = useState(initialData?.photoPositionX ?? 50);
  const [photoPositionY, setPhotoPositionY] = useState(initialData?.photoPositionY ?? 50);
  const [fieldId, setFieldId] = useState(initialData?.fieldId || fieldOptions[0]?.id || "");
  const [operationalClass, setOperationalClass] = useState<SquadOperationalClass>(initialData?.operationalClass ?? "BASE");
  const [rankingPoints, setRankingPoints] = useState(initialData?.rankingPoints ?? 0);
  const [enrollmentDate, setEnrollmentDate] = useState(initialData?.enrollmentDate ?? "");
  const [status, setStatus] = useState<MemberStatus>(initialData?.status ?? "ativo");
  const [name, setName] = useState(initialData?.name ?? "");
  const [assignments, setAssignments] = useState<AssignmentFormValue[]>(
    initialData?.assignments?.length ? initialData.assignments : [defaultAssignment(), defaultAssignment(), defaultAssignment(), defaultAssignment()],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData && endpoint);

  const assignmentSummary = useMemo(() => {
    const titulares = assignments.filter((item) => item.slotType === "TITULAR").length;
    const reservas = assignments.filter((item) => item.slotType === "RESERVA").length;
    const comando = assignments.filter((item) => item.slotType === "COMANDO").length;
    return { titulares, reservas, comando, total: assignments.filter((item) => item.memberId).length };
  }, [assignments]);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPhotoDataUrl("");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoDataUrl(dataUrl);
      setError("");
    } catch {
      setError("Não foi possível carregar a imagem do squad.");
    }
  }

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  function handleRemovePhoto() {
    setPhotoDataUrl("");
    setPhotoScale(100);
    setPhotoPositionX(50);
    setPhotoPositionY(50);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function updateAssignment(index: number, nextValue: Partial<AssignmentFormValue>) {
    setAssignments((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }
        return { ...item, ...nextValue };
      }),
    );
  }

  function addAssignment() {
    setAssignments((current) => {
      if (current.length >= 12) {
        return current;
      }
      return [...current, defaultAssignment()];
    });
  }

  function removeAssignment(index: number) {
    setAssignments((current) => {
      if (current.length <= 4) {
        return current;
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function toggleSpecialization(index: number, value: SquadSpecialization) {
    setAssignments((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const exists = item.specializations.includes(value);
        return {
          ...item,
          specializations: exists
            ? item.specializations.filter((specialization) => specialization !== value)
            : [...item.specializations, value],
        };
      }),
    );
  }

  function resetForm() {
    setName("");
    setFieldId(fieldOptions[0]?.id || "");
    setOperationalClass("BASE");
    setRankingPoints(0);
    setEnrollmentDate("");
    setStatus("ativo");
    setAssignments([defaultAssignment(), defaultAssignment(), defaultAssignment(), defaultAssignment()]);
    setPhotoDataUrl("");
    setPhotoScale(100);
    setPhotoPositionX(50);
    setPhotoPositionY(50);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name,
      fieldId,
      operationalClass,
      rankingPoints,
      active: status === "ativo",
      enrollmentDate,
      status,
      photoDataUrl,
      photoScale,
      photoPositionX,
      photoPositionY,
      assignments: assignments.map((assignment, index) => ({
        ...assignment,
        sortOrder: index,
      })),
    };

    startTransition(async () => {
      const response = await fetch(endpoint ?? "/api/squads", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result: { error?: string } = {};

      try {
        result = (await response.json()) as { error?: string };
      } catch {
        result = {
          error: response.ok
            ? "O servidor concluiu a solicitação sem retornar detalhes."
            : "O servidor encontrou um erro interno ao processar o cadastro.",
        };
      }

      if (!response.ok) {
        setError(result.error ?? "Não foi possível salvar o squad.");
        return;
      }

      setSuccess(successMessage ?? (isEditing ? "Squad atualizado com sucesso." : "Squad cadastrado com sucesso."));
      if (!isEditing) {
        resetForm();
      }
      router.refresh();
    });
  }

  function handleCancel() {
    if (returnHref) {
      router.push(returnHref);
      return;
    }
    router.refresh();
  }

  function handleDelete() {
    if (!endpoint) {
      return;
    }

    if (!window.confirm("Deseja realmente excluir este squad?")) {
      return;
    }

    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Não foi possível excluir o squad.");
        return;
      }

      router.push(returnHref ?? "/squads");
      router.refresh();
    });
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <p className="admin-note">
        Uso exclusivo da administração. Este cadastro define a composição operacional oficial do squad.
      </p>

      <div className="quick-form-grid">
        <div className="form-section-title field-full">Imagem do Squad</div>

        <div className="field-full squad-photo-block">
          <div className="squad-photo-preview-shell">
            <div className="squad-photo-preview">
              <Image
                alt="Pré-visualização do squad"
                className="squad-photo-preview-image"
                fill
                sizes="(max-width: 700px) 100vw, 420px"
                src={photoDataUrl || "/cadastro-base-humana.png"}
                style={{
                  objectPosition: `${photoPositionX}% ${photoPositionY}%`,
                  transform: `scale(${photoScale / 100})`,
                }}
                unoptimized
              />
              {!photoDataUrl ? <div className="field-photo-caption">Imagem oficial do squad aqui!</div> : null}
            </div>
          </div>

          <div className="member-photo-controls squad-photo-controls">
            <input
              accept="image/*"
              className="visually-hidden"
              name="photoUpload"
              onChange={handlePhotoChange}
              ref={fileInputRef}
              type="file"
            />

            <label className="field field-full">
              <span>Zoom da imagem</span>
              <input max="140" min="60" onChange={(event) => setPhotoScale(Number(event.target.value))} type="range" value={photoScale} />
            </label>

            <label className="field field-full">
              <span>Posição horizontal</span>
              <input max="100" min="0" onChange={(event) => setPhotoPositionX(Number(event.target.value))} type="range" value={photoPositionX} />
            </label>

            <label className="field field-full">
              <span>Posição vertical</span>
              <input max="100" min="0" onChange={(event) => setPhotoPositionY(Number(event.target.value))} type="range" value={photoPositionY} />
            </label>

            <div className="member-photo-actions">
              <button className="button secondary photo-action-button" onClick={handleOpenFilePicker} type="button">
                {photoDataUrl ? "Alterar imagem" : "Inserir imagem"}
              </button>

              <button className="button secondary photo-action-button" onClick={handleRemovePhoto} type="button">
                Excluir imagem
              </button>
            </div>
          </div>
        </div>

        <div className="field-full squad-ranking-row">
          <div className="croa-display-block squad-ranking-block">
            <span className="croa-label">Ranking e pontos</span>
            <strong className="croa-display">{formatRankingCode(rankingPoints)}</strong>
          </div>

          <label className="field squad-points-field">
            <span>Pontos do squad</span>
            <input
              inputMode="numeric"
              min="0"
              onChange={(event) => setRankingPoints(Number(event.target.value.replace(/[^\d]/g, "") || "0"))}
              type="number"
              value={rankingPoints}
            />
          </label>
        </div>

        <div className="field-full squad-ranking-row">
          <label className="field squad-points-field">
            <span>Data de inscrição do Squad</span>
            <input onChange={(event) => setEnrollmentDate(event.target.value)} type="date" value={enrollmentDate} />
          </label>

          <label className="field squad-status-field">
            <span>Homologação</span>
            <select
              className={`member-status-select ${statusOptions.find((item) => item.value === status)?.badgeClass ?? "status-active"}`}
              onChange={(event) => setStatus(event.target.value as MemberStatus)}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-section-title field-full">Identificação do Squad</div>

        <div className="field-row field-full squad-header-row">
          <label className="field squad-name-field">
            <span>Nome do Squad</span>
            <input onChange={(event) => setName(event.target.value)} placeholder="Ex.: Squad DUX" value={name} />
          </label>

          <label className="field squad-register-field">
            <span>Registro do Campo</span>
            <select onChange={(event) => setFieldId(event.target.value)} value={fieldId}>
              <option value="">Selecione um campo cadastrado</option>
              {fieldOptions.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.code}
                </option>
              ))}
            </select>
          </label>

          <label className="field squad-class-field">
            <span>Classe operacional</span>
            <select onChange={(event) => setOperationalClass(event.target.value as SquadOperationalClass)} value={operationalClass}>
              {squadOperationalClassOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-section-title field-full">Composição do Squad</div>

        <div className="field-full squad-summary-bar">
          <span>Total selecionado: {assignmentSummary.total}</span>
          <span>Titulares: {assignmentSummary.titulares}/8</span>
          <span>Reservas: {assignmentSummary.reservas}/3</span>
          <span>Comando: {assignmentSummary.comando}/1</span>
        </div>

        <div className="field-full squad-members-grid">
          {assignments.map((assignment, index) => {
            const selectedMember = memberOptions.find((member) => member.id === assignment.memberId);

            return (
              <article className="squad-member-card" key={`assignment-${index}`}>
                <div className="squad-member-card-top">
                  <div className="squad-member-avatar">
                    <Image
                      alt={selectedMember ? `Foto de ${selectedMember.codiname}` : "Integrante do squad"}
                      fill
                      sizes="72px"
                      src={selectedMember?.photoDataUrl || "/member-default-photo.jpeg"}
                      unoptimized
                    />
                  </div>

                  <div className="squad-member-identity">
                    <strong>{selectedMember?.codiname || `Integrante ${index + 1}`}</strong>
                    <span>{selectedMember?.croaCode || "Selecione um CROA"}</span>
                    <small>
                      {selectedMember ? `${selectedMember.memberClassLabel} | ${selectedMember.levelLabel}` : "Classe e nível aparecem aqui"}
                    </small>
                  </div>

                  <button className="button secondary squad-member-remove" onClick={() => removeAssignment(index)} type="button">
                    Remover
                  </button>
                </div>

                <label className="field field-full">
                  <span>Integrante</span>
                  <select
                    onChange={(event) => updateAssignment(index, { memberId: event.target.value })}
                    value={assignment.memberId}
                  >
                    <option value="">Selecione um membro</option>
                    {memberOptions.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.codiname} | {member.croaCode}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field-full">
                  <span>Tipo de vaga</span>
                  <select
                    onChange={(event) => updateAssignment(index, { slotType: event.target.value as SquadAssignmentType })}
                    value={assignment.slotType}
                  >
                    {squadAssignmentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {squadAssignmentTypeLabel(option.value)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field-full">
                  <span>Posição</span>
                  <select
                    onChange={(event) => updateAssignment(index, { position: event.target.value as SquadPosition })}
                    value={assignment.position}
                  >
                    {squadPositionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {squadPositionLabel(option.value)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="field field-full">
                  <span>Especializações</span>
                  <div className="squad-specialization-grid squad-specialization-grid-compact">
                    {squadSpecializationOptions.map((option) => {
                      const checked = assignment.specializations.includes(option.value);
                      return (
                        <label className={`squad-specialization-item${checked ? " active" : ""}`} key={`${index}-${option.value}`}>
                          <input
                            checked={checked}
                            onChange={() => toggleSpecialization(index, option.value)}
                            type="checkbox"
                          />
                          <span>{squadSpecializationLabel(option.value)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="field-full squad-members-actions">
          <button className="button secondary" disabled={assignments.length >= 12} onClick={addAssignment} type="button">
            Adicionar integrante
          </button>
          <p className="field-helper">
            Mínimo de 4 integrantes e máximo de 12, com até 8 titulares, 3 reservas e 1 comando. O squad deve ter um Líder obrigatório.
          </p>
        </div>
      </div>

      {error ? <p className="form-message error-text">{error}</p> : null}
      {success ? <p className="form-message success-text">{success}</p> : null}

      <div className="croa-record-actions">
        <button className="button primary" disabled={isPending} type="submit">
          {isPending ? "Salvando..." : submitLabel ?? (isEditing ? "Salvar alterações" : "Cadastrar squad")}
        </button>

        {isEditing ? (
          <>
            <button className="button secondary" disabled={isPending} onClick={handleCancel} type="button">
              Cancelar
            </button>
            {allowDelete ? (
              <button className="button secondary croa-record-delete" disabled={isPending} onClick={handleDelete} type="button">
                Excluir tudo
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </form>
  );
}
