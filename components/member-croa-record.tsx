"use client";

import { BloodType, MemberClass, MemberLevel, MemberStatus, OfficialSubclass, RoleType } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState, useTransition } from "react";
import { formatCroaCode } from "@/lib/croa";
import {
  formatDdd,
  formatDdi,
  formatPhoneInternational,
  formatRg,
} from "@/lib/field-validation";
import { compressImageFileAsDataUrl, readFileAsDataUrl } from "@/lib/image-data-url";

const classOptions: { value: MemberClass; label: string }[] = [
  { value: "STANDARD", label: "STANDARD" },
  { value: "PREMIUM", label: "PREMIUM" },
  { value: "TOP_TEAM", label: "TOP TEAM" },
  { value: "MASTER", label: "MASTER" },
  { value: "OFICIAL", label: "OFICIAL" },
  { value: "ALMIGHTY", label: "ALMIGHTY" },
];

const officialSubclassOptions: { value: OfficialSubclass; label: string }[] = [
  { value: "AUXILIAR", label: "Auxiliar" },
  { value: "RANGER", label: "Ranger" },
  { value: "ARBITRO", label: "Árbitro" },
  { value: "REPORTER", label: "Reporter" },
  { value: "GERENTE", label: "Gerente" },
];

const levelOptions: { value: MemberLevel; label: string }[] = [
  { value: "ALPHA_0", label: "ALPHA 0" },
  { value: "N1", label: "N1" },
  { value: "N2", label: "N2" },
  { value: "N3", label: "N3" },
  { value: "N4", label: "N4" },
  { value: "N5", label: "N5" },
];

const roleOptions: { value: RoleType; label: string }[] = [
  { value: "operador", label: "Operador" },
  { value: "comando", label: "Comando" },
  { value: "ranger", label: "Ranger" },
  { value: "arbitro", label: "Árbitro" },
  { value: "gestor", label: "Gestor" },
  { value: "promoter", label: "Promoter" },
  { value: "reporter", label: "Reporter" },
  { value: "presidente", label: "Presidente" },
  { value: "professor", label: "Professor" },
  { value: "instrutor", label: "Instrutor" },
  { value: "outros", label: "Outros" },
];

const bloodTypeOptions: { value: BloodType; label: string }[] = [
  { value: "A_POSITIVO", label: "A+" },
  { value: "A_NEGATIVO", label: "A-" },
  { value: "B_POSITIVO", label: "B+" },
  { value: "B_NEGATIVO", label: "B-" },
  { value: "AB_POSITIVO", label: "AB+" },
  { value: "AB_NEGATIVO", label: "AB-" },
  { value: "O_POSITIVO", label: "O+" },
  { value: "O_NEGATIVO", label: "O-" },
];

const statusOptions: { value: MemberStatus; label: string; badgeClass: string }[] = [
  { value: "ativo", label: "Ativo", badgeClass: "status-active" },
  { value: "suspenso", label: "Suspenso", badgeClass: "status-suspended" },
  { value: "inativo", label: "Inativo", badgeClass: "status-inactive" },
  { value: "excluido", label: "Excluído", badgeClass: "status-excluded" },
  { value: "rip", label: "R.I.P.", badgeClass: "status-rip" },
];

type FieldOption = {
  id: string;
  label: string;
};

type MemberCroaRecordData = {
  id: string;
  croaNumber: number;
  codiname: string;
  fullName: string;
  birthDate: string;
  enrollmentDate: string;
  photoDataUrl: string;
  photoScale: number;
  photoPositionX: number;
  photoPositionY: number;
  crestLeftDataUrl: string;
  crestRightDataUrl: string;
  accessLogin: string;
  email: string;
  ddi: string;
  ddd: string;
  phoneNumber: string;
  rg: string;
  role: RoleType;
  otherRole: string;
  level: MemberLevel;
  memberClass: MemberClass;
  officialSubclass: OfficialSubclass | "";
  status: MemberStatus;
  fieldId: string;
  squadName: string;
  squadFieldName: string;
  squadPhotoDataUrl: string;
  addressStreet: string;
  addressNumber: string;
  neighborhood: string;
  postalCode: string;
  addressComplement: string;
  bloodType: BloodType | "";
  emergencyContactName: string;
  emergencyContactPhone: string;
  observations: string;
  history: string;
};

function buildPayload(member: MemberCroaRecordData, nextPassword: string) {
  const payload: Record<string, unknown> = {
    codiname: member.codiname.trim(),
    fullName: member.fullName.trim(),
    birthDate: member.birthDate || null,
    enrollmentDate: member.enrollmentDate || null,
    photoDataUrl: member.photoDataUrl || null,
    photoScale: member.photoScale,
    photoPositionX: member.photoPositionX,
    photoPositionY: member.photoPositionY,
    crestLeftDataUrl: member.crestLeftDataUrl || null,
    crestRightDataUrl: member.crestRightDataUrl || null,
    accessLogin: member.accessLogin.trim() || null,
    email: member.email.trim() || null,
    ddi: member.ddi.trim() || null,
    ddd: member.ddd.trim() || null,
    phoneNumber: member.phoneNumber.trim() || null,
    rg: member.rg.trim() || null,
    role: member.role,
    otherRole: member.otherRole.trim() || null,
    level: member.level,
    memberClass: member.memberClass,
    officialSubclass: member.memberClass === "OFICIAL" ? member.officialSubclass || "AUXILIAR" : null,
    status: member.status,
    fieldId: member.fieldId || null,
    addressStreet: member.addressStreet.trim() || null,
    addressNumber: member.addressNumber.trim() || null,
    neighborhood: member.neighborhood.trim() || null,
    postalCode: member.postalCode.trim() || null,
    addressComplement: member.addressComplement.trim() || null,
    bloodType: member.bloodType || null,
    emergencyContactName: member.emergencyContactName.trim() || null,
    emergencyContactPhone: member.emergencyContactPhone.trim() || null,
    observations: member.observations.trim() || null,
    history: member.history.trim() || null,
  };

  if (nextPassword.trim()) {
    payload.accessPassword = nextPassword.trim();
  }

  return payload;
}

export function MemberCroaRecord({
  member,
  fields,
  canEdit,
  startEditing = false,
}: {
  member: MemberCroaRecordData;
  fields: FieldOption[];
  canEdit: boolean;
  startEditing?: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const crestLeftInputRef = useRef<HTMLInputElement>(null);
  const crestRightInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(startEditing && canEdit);
  const [savedMember, setSavedMember] = useState(member);
  const [draftMember, setDraftMember] = useState(member);
  const [nextPassword, setNextPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  const currentMember = isEditing ? draftMember : savedMember;
  const isPublicView = !isEditing;
  const canViewPrivateDetails = canEdit;
  const selectedStatusClass =
    statusOptions.find((item) => item.value === currentMember.status)?.badgeClass ?? "status-active";
  const selectedFieldLabel = fields.find((field) => field.id === currentMember.fieldId)?.label ?? "Não vinculado";
  const selectedClassLabel =
    classOptions.find((option) => option.value === currentMember.memberClass)?.label ?? currentMember.memberClass;
  const selectedOfficialSubclassLabel =
    officialSubclassOptions.find((option) => option.value === currentMember.officialSubclass)?.label ??
    currentMember.officialSubclass;
  const selectedLevelLabel =
    levelOptions.find((option) => option.value === currentMember.level)?.label ?? currentMember.level;
  const selectedRoleLabel =
    currentMember.role === "outros"
      ? currentMember.otherRole || "Outros"
      : roleOptions.find((option) => option.value === currentMember.role)?.label ?? currentMember.role;
  const selectedBloodTypeLabel =
    bloodTypeOptions.find((option) => option.value === currentMember.bloodType)?.label ?? "Não informado";

  function renderReadOnlyField(label: string, value: string) {
    return (
      <label className="field croa-readonly-field">
        <span>{label}</span>
        <input readOnly tabIndex={-1} value={value || "Não informado"} />
      </label>
    );
  }

  function updateField<K extends keyof MemberCroaRecordData>(key: K, value: MemberCroaRecordData[K]) {
    setDraftMember((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateMemberClass(memberClass: MemberClass) {
    setDraftMember((current) => ({
      ...current,
      memberClass,
      officialSubclass: memberClass === "OFICIAL" ? current.officialSubclass || "AUXILIAR" : "",
    }));
  }

  function handleStartEdit() {
    setDraftMember(savedMember);
    setNextPassword("");
    setError("");
    setSuccess("");
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setDraftMember(savedMember);
    setNextPassword("");
    setError("");
    setSuccess("");
    setIsEditing(false);
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateField("photoDataUrl", dataUrl);
    } catch {
      setError("Não foi possível carregar a foto do membro.");
    }
  }

  async function handleCrestChange(event: ChangeEvent<HTMLInputElement>, side: "left" | "right") {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await compressImageFileAsDataUrl(file);
      if (side === "left") {
        updateField("crestLeftDataUrl", dataUrl);
        return;
      }

      updateField("crestRightDataUrl", dataUrl);
    } catch {
      setError("Não foi possível carregar ou otimizar o brasão da carteirinha.");
    }
  }

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  function handleRemovePhoto() {
    updateField("photoDataUrl", "");
    updateField("photoScale", 100);
    updateField("photoPositionX", 50);
    updateField("photoPositionY", 50);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleOpenCrestPicker(side: "left" | "right") {
    if (side === "left") {
      crestLeftInputRef.current?.click();
      return;
    }

    crestRightInputRef.current?.click();
  }

  function handleRemoveCrest(side: "left" | "right") {
    if (side === "left") {
      updateField("crestLeftDataUrl", "");
      if (crestLeftInputRef.current) {
        crestLeftInputRef.current.value = "";
      }
      return;
    }

    updateField("crestRightDataUrl", "");
    if (crestRightInputRef.current) {
      crestRightInputRef.current.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isEditing) {
      return;
    }

    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await fetch(`/api/membros/${savedMember.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload(draftMember, nextPassword)),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Não foi possível salvar as alterações.");
        return;
      }

      setSavedMember(draftMember);
      setNextPassword("");
      setIsEditing(false);
      setSuccess("Registro do membro atualizado com sucesso.");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm("Deseja realmente excluir este membro do CROA?")) {
      return;
    }

    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await fetch(`/api/membros/${savedMember.id}`, {
        method: "DELETE",
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Não foi possível excluir este membro.");
        return;
      }

      router.push("/membros");
      router.refresh();
    });
  }

  return (
    <form className={`quick-form croa-record-card${isPublicView ? " croa-record-card-public" : ""}`} onSubmit={handleSubmit}>
      <div className={`croa-record-wallet${isPublicView ? " croa-record-wallet-public" : ""}`}>
        <div className="croa-record-wallet-left">
          <div className="croa-record-photo-stack">
            <div className="croa-record-photo">
              <Image
                alt={`Foto de ${currentMember.fullName}`}
                className="croa-record-photo-image"
                fill
                sizes="220px"
                src={currentMember.photoDataUrl || "/member-default-photo.jpeg"}
                unoptimized
                style={{
                  objectPosition: `${currentMember.photoPositionX}% ${currentMember.photoPositionY}%`,
                  transform: `scale(${currentMember.photoScale / 100})`,
                }}
              />
            </div>

            {currentMember.squadPhotoDataUrl ? (
              <div className="croa-record-squad-photo">
                <Image
                  alt={`Foto do squad de ${currentMember.codiname || currentMember.fullName}`}
                  className="croa-record-squad-photo-image"
                  fill
                  sizes="120px"
                  src={currentMember.squadPhotoDataUrl}
                  unoptimized
                />
              </div>
            ) : null}
          </div>

          <strong className="croa-record-brand">CROA</strong>
        </div>

        <div className="croa-record-wallet-center">
          <strong className="croa-record-codiname">{currentMember.codiname || "Sem codinome"}</strong>
          <div className="croa-record-number">{formatCroaCode(currentMember.croaNumber)}</div>

          {isEditing ? (
            <label className="field croa-record-status-field">
              <span>Homologação</span>
              <select
                className={`member-status-select ${selectedStatusClass}`}
                name="status"
                onChange={(event) => updateField("status", event.target.value as MemberStatus)}
                value={currentMember.status}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className={`status-pill croa-record-status-pill ${selectedStatusClass}`}>
              {statusOptions.find((item) => item.value === currentMember.status)?.label ?? currentMember.status}
            </div>
          )}
        </div>

        <div className="croa-record-wallet-right">
          <div className="croa-record-crest-slot">
            {currentMember.crestLeftDataUrl ? (
              <Image
                alt="Brasão esquerdo da carteirinha"
                className="croa-record-crest-image"
                fill
                sizes="88px"
                src={currentMember.crestLeftDataUrl}
                unoptimized
              />
            ) : (
              <span className="croa-record-crest-placeholder">Brasão 1</span>
            )}
          </div>

          <div className="croa-record-crest-slot">
            {currentMember.crestRightDataUrl ? (
              <Image
                alt="Brasão direito da carteirinha"
                className="croa-record-crest-image"
                fill
                sizes="88px"
                src={currentMember.crestRightDataUrl}
                unoptimized
              />
            ) : (
              <span className="croa-record-crest-placeholder">Brasão 2</span>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="field-full member-photo-block croa-record-photo-tools">
          <div className="member-photo-controls">
            <input
              accept="image/*"
              className="visually-hidden"
              name="photoUpload"
              onChange={handlePhotoChange}
              ref={fileInputRef}
              type="file"
            />

            <label className="field field-full">
              <span>Zoom da foto</span>
              <input
                max="140"
                min="60"
                onChange={(event) => updateField("photoScale", Number(event.target.value))}
                type="range"
                value={currentMember.photoScale}
              />
            </label>

            <label className="field field-full">
              <span>Posição horizontal da foto</span>
              <input
                max="100"
                min="0"
                onChange={(event) => updateField("photoPositionX", Number(event.target.value))}
                type="range"
                value={currentMember.photoPositionX}
              />
            </label>

            <label className="field field-full">
              <span>Posição vertical da foto</span>
              <input
                max="100"
                min="0"
                onChange={(event) => updateField("photoPositionY", Number(event.target.value))}
                type="range"
                value={currentMember.photoPositionY}
              />
            </label>

            <div className="member-photo-actions">
              <button className="button secondary photo-action-button" onClick={handleOpenFilePicker} type="button">
                {currentMember.photoDataUrl ? "Alterar foto" : "Inserir foto"}
              </button>
              <button className="button secondary photo-action-button" onClick={handleRemovePhoto} type="button">
                Excluir foto
              </button>
            </div>
          </div>

          <div className="card-crest-grid croa-record-crest-tools">
            <div className="card-crest-card">
              <div className="card-crest-preview">
                {currentMember.crestLeftDataUrl ? (
                  <Image
                    alt="Brasão esquerdo da carteirinha"
                    className="card-crest-image"
                    fill
                    sizes="96px"
                    src={currentMember.crestLeftDataUrl}
                    unoptimized
                  />
                ) : (
                  <span className="card-crest-placeholder">Brasão esquerdo</span>
                )}
              </div>

              <input
                accept="image/*"
                className="visually-hidden"
                name="crestLeftUpload"
                onChange={(event) => void handleCrestChange(event, "left")}
                ref={crestLeftInputRef}
                type="file"
              />

              <div className="member-photo-actions">
                <button
                  className="button secondary photo-action-button"
                  onClick={() => handleOpenCrestPicker("left")}
                  type="button"
                >
                  {currentMember.crestLeftDataUrl ? "Alterar brasão" : "Inserir brasão"}
                </button>
                <button
                  className="button secondary photo-action-button"
                  onClick={() => handleRemoveCrest("left")}
                  type="button"
                >
                  Excluir
                </button>
              </div>
            </div>

            <div className="card-crest-card">
              <div className="card-crest-preview">
                {currentMember.crestRightDataUrl ? (
                  <Image
                    alt="Brasão direito da carteirinha"
                    className="card-crest-image"
                    fill
                    sizes="96px"
                    src={currentMember.crestRightDataUrl}
                    unoptimized
                  />
                ) : (
                  <span className="card-crest-placeholder">Brasão direito</span>
                )}
              </div>

              <input
                accept="image/*"
                className="visually-hidden"
                name="crestRightUpload"
                onChange={(event) => void handleCrestChange(event, "right")}
                ref={crestRightInputRef}
                type="file"
              />

              <div className="member-photo-actions">
                <button
                  className="button secondary photo-action-button"
                  onClick={() => handleOpenCrestPicker("right")}
                  type="button"
                >
                  {currentMember.crestRightDataUrl ? "Alterar brasão" : "Inserir brasão"}
                </button>
                <button
                  className="button secondary photo-action-button"
                  onClick={() => handleRemoveCrest("right")}
                  type="button"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`quick-form-grid croa-record-grid${isPublicView ? " croa-record-grid-public" : ""}`}>
        {(!isPublicView || canViewPrivateDetails) ? (
          <>
            <div className="form-section-title field-full">Dados Pessoais</div>

            {isEditing ? (
              <label className="field">
                <span>Codinome</span>
                <input
                  onChange={(event) => updateField("codiname", event.target.value)}
                  readOnly={!isEditing}
                  value={currentMember.codiname}
                />
              </label>
            ) : (
              renderReadOnlyField("Codinome", currentMember.codiname)
            )}

            {isEditing ? (
              <label className="field">
                <span>Nome</span>
                <input
                  onChange={(event) => updateField("fullName", event.target.value)}
                  readOnly={!isEditing}
                  value={currentMember.fullName}
                />
              </label>
            ) : (
              renderReadOnlyField("Nome", currentMember.fullName)
            )}

            {isEditing ? (
              <label className="field">
                <span>Data de inscrição</span>
                <input
                  onChange={(event) => updateField("enrollmentDate", event.target.value)}
                  readOnly={!isEditing}
                  type="date"
                  value={currentMember.enrollmentDate}
                />
              </label>
            ) : (
              renderReadOnlyField("Data de inscrição", currentMember.enrollmentDate)
            )}

            {isEditing ? (
              <label className="field">
                <span>Data de nascimento</span>
                <input
                  onChange={(event) => updateField("birthDate", event.target.value)}
                  readOnly={!isEditing}
                  type="date"
                  value={currentMember.birthDate}
                />
              </label>
            ) : (
              renderReadOnlyField("Data de nascimento", currentMember.birthDate)
            )}

            <div className="phone-grid field-full">
              {isEditing ? (
                <>
                  <label className="field">
                    <span>DDI</span>
                    <input
                      inputMode="numeric"
                      maxLength={2}
                      onChange={(event) => updateField("ddi", formatDdi(event.target.value))}
                      readOnly={!isEditing}
                      value={currentMember.ddi}
                    />
                  </label>

                  <label className="field">
                    <span>DDD</span>
                    <input
                      inputMode="numeric"
                      maxLength={2}
                      onChange={(event) => updateField("ddd", formatDdd(event.target.value))}
                      readOnly={!isEditing}
                      value={currentMember.ddd}
                    />
                  </label>

                  <label className="field phone-number-field">
                    <span>Celular</span>
                    <input
                      inputMode="numeric"
                      maxLength={12}
                      onChange={(event) => updateField("phoneNumber", formatPhoneInternational(event.target.value))}
                      readOnly={!isEditing}
                      value={currentMember.phoneNumber}
                    />
                  </label>
                </>
              ) : (
                <>
                  {renderReadOnlyField("DDI", currentMember.ddi)}
                  {renderReadOnlyField("DDD", currentMember.ddd)}
                  {renderReadOnlyField("Celular", currentMember.phoneNumber)}
                </>
              )}
            </div>

            {isEditing ? (
              <label className="field field-full">
                <span>E-mail</span>
                <input
                  onChange={(event) => updateField("email", event.target.value)}
                  readOnly={!isEditing}
                  type="email"
                  value={currentMember.email}
                />
              </label>
            ) : (
              renderReadOnlyField("E-mail", currentMember.email)
            )}

            {isEditing ? (
              <label className="field field-full">
                <span>RG</span>
                <input
                  maxLength={12}
                  onChange={(event) => updateField("rg", formatRg(event.target.value))}
                  readOnly={!isEditing}
                  value={currentMember.rg}
                />
              </label>
            ) : (
              renderReadOnlyField("RG", currentMember.rg)
            )}

            <div className="address-grid field-full">
              {isEditing ? (
                <>
                  <label className="field field-full">
                    <span>Endereço de residência</span>
                    <input
                      onChange={(event) => updateField("addressStreet", event.target.value)}
                      readOnly={!isEditing}
                      value={currentMember.addressStreet}
                    />
                  </label>

                  <label className="field">
                    <span>Número</span>
                    <input
                      onChange={(event) => updateField("addressNumber", event.target.value)}
                      readOnly={!isEditing}
                      value={currentMember.addressNumber}
                    />
                  </label>

                  <label className="field">
                    <span>Bairro</span>
                    <input
                      onChange={(event) => updateField("neighborhood", event.target.value)}
                      readOnly={!isEditing}
                      value={currentMember.neighborhood}
                    />
                  </label>

                  <label className="field">
                    <span>CEP</span>
                    <input
                      onChange={(event) => updateField("postalCode", event.target.value)}
                      readOnly={!isEditing}
                      value={currentMember.postalCode}
                    />
                  </label>

                  <label className="field field-full">
                    <span>Complemento</span>
                    <input
                      onChange={(event) => updateField("addressComplement", event.target.value)}
                      readOnly={!isEditing}
                      value={currentMember.addressComplement}
                    />
                  </label>
                </>
              ) : (
                <>
                  {renderReadOnlyField("Endereço de residência", currentMember.addressStreet)}
                  {renderReadOnlyField("Número", currentMember.addressNumber)}
                  {renderReadOnlyField("Bairro", currentMember.neighborhood)}
                  {renderReadOnlyField("CEP", currentMember.postalCode)}
                  {renderReadOnlyField("Complemento", currentMember.addressComplement)}
                </>
              )}
            </div>
          </>
        ) : null}

        <div className="form-section-title field-full">Dados do Operador</div>

        {isEditing ? (
          <label className="field field-full">
            <span>Campo</span>
            <select
              disabled={!isEditing}
              onChange={(event) => updateField("fieldId", event.target.value)}
              value={currentMember.fieldId}
            >
              <option value="">Selecione o campo</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          renderReadOnlyField("Campo", selectedFieldLabel)
        )}

        {!isEditing && currentMember.squadName ? renderReadOnlyField("Squad", currentMember.squadName) : null}

        {isEditing ? (
          <label className="field">
            <span>Classe</span>
            <select
              disabled={!isEditing}
              onChange={(event) => updateMemberClass(event.target.value as MemberClass)}
              value={currentMember.memberClass}
            >
              {classOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          renderReadOnlyField("Classe", selectedClassLabel)
        )}

        {currentMember.memberClass === "OFICIAL" ? (
          isEditing ? (
            <label className="field">
              <span>Sub classe</span>
              <select
                disabled={!isEditing}
                onChange={(event) => updateField("officialSubclass", event.target.value as OfficialSubclass)}
                value={currentMember.officialSubclass || "AUXILIAR"}
              >
                {officialSubclassOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            renderReadOnlyField("Sub classe", selectedOfficialSubclassLabel)
          )
        ) : null}

        {isEditing ? (
          <label className="field">
            <span>Nível</span>
            <select
              disabled={!isEditing}
              onChange={(event) => updateField("level", event.target.value as MemberLevel)}
              value={currentMember.level}
            >
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          renderReadOnlyField("Nível", selectedLevelLabel)
        )}

        {isEditing ? (
          <label className="field field-full">
            <span>Função</span>
            <select
              disabled={!isEditing}
              onChange={(event) => updateField("role", event.target.value as RoleType)}
              value={currentMember.role}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          renderReadOnlyField("Função", selectedRoleLabel)
        )}

        {currentMember.role === "outros" ? (
          <label className="field field-full">
            <span>Nova função</span>
            <input
              onChange={(event) => updateField("otherRole", event.target.value)}
              readOnly={!isEditing}
              value={currentMember.otherRole}
            />
          </label>
        ) : null}

        {!isPublicView || canViewPrivateDetails ? (
          <>
            <div className="form-section-title field-full">Acesso do Operador</div>

            {isEditing ? (
              <label className="field">
                <span>Login do operador</span>
                <input
                  onChange={(event) => updateField("accessLogin", event.target.value)}
                  readOnly={!isEditing}
                  value={currentMember.accessLogin}
                />
              </label>
            ) : (
              renderReadOnlyField("Login do operador", currentMember.accessLogin)
            )}

            {isEditing ? (
              <label className="field">
                <span>Nova senha do operador</span>
                <input
                  onChange={(event) => setNextPassword(event.target.value)}
                  placeholder={isEditing ? "Deixe em branco para manter a senha atual" : "Senha protegida"}
                  readOnly={!isEditing}
                  type="password"
                  value={nextPassword}
                />
              </label>
            ) : (
              renderReadOnlyField("Senha do operador", "Protegida")
            )}
          </>
        ) : null}

        {!isEditing ? (
          <div className="field-full croa-history-inline">
            <button
              className="button croa-history-toggle"
              onClick={() => setShowHistory((current) => !current)}
              type="button"
            >
              Histórico
            </button>

            {showHistory ? (
              <div className="croa-history-panel">
                <p>{currentMember.history || "Sem histórico registrado."}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {(!isPublicView || canViewPrivateDetails) ? (
          <>
            <div className="form-section-title field-full">Dados de Emergência</div>

            {isEditing ? (
              <>
                <label className="field">
                  <span>Tipo de sangue</span>
                  <select
                    disabled={!isEditing}
                    onChange={(event) => updateField("bloodType", event.target.value as BloodType | "")}
                    value={currentMember.bloodType}
                  >
                    <option value="">Selecione</option>
                    {bloodTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Contato de emergência</span>
                  <input
                    onChange={(event) => updateField("emergencyContactName", event.target.value)}
                    readOnly={!isEditing}
                    value={currentMember.emergencyContactName}
                  />
                </label>

                <label className="field field-full">
                  <span>Número do contato de emergência</span>
                  <input
                    onChange={(event) => updateField("emergencyContactPhone", event.target.value)}
                    readOnly={!isEditing}
                    value={currentMember.emergencyContactPhone}
                  />
                </label>

                <label className="field field-full">
                  <span>Descrição / observações</span>
                  <textarea
                    maxLength={500}
                    onChange={(event) => updateField("observations", event.target.value)}
                    readOnly={!isEditing}
                    rows={5}
                    value={currentMember.observations}
                  />
                </label>

                <label className="field field-full">
                  <span>Histórico</span>
                  <textarea
                    onChange={(event) => updateField("history", event.target.value)}
                    placeholder="Eventos realizados, conclusão do evento e data da realização."
                    readOnly={!isEditing}
                    rows={7}
                    value={currentMember.history}
                  />
                </label>
              </>
            ) : (
              <>
                {renderReadOnlyField("Tipo de sangue", selectedBloodTypeLabel)}
                {renderReadOnlyField("Contato de emergência", currentMember.emergencyContactName)}
                {renderReadOnlyField("Número do contato de emergência", currentMember.emergencyContactPhone)}
              </>
            )}
          </>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="croa-public-extra">
          <button
            className="button croa-emergency-toggle"
            onClick={() => setShowEmergency((current) => !current)}
            type="button"
          >
            Emergência
          </button>

          {showEmergency ? (
            <div className="croa-emergency-panel">
              <div className="quick-form-grid croa-record-grid croa-record-grid-public">
                {renderReadOnlyField("Tipo de sangue", selectedBloodTypeLabel)}
                {renderReadOnlyField("Contato de emergência", currentMember.emergencyContactName)}
                {renderReadOnlyField("Número do contato de emergência", currentMember.emergencyContactPhone)}
              </div>
            </div>
          ) : null}

          <div className="croa-observations-panel">
            <span>Descrição / observações</span>
            <p>{currentMember.observations || "Sem observações registradas."}</p>
          </div>
        </div>
      ) : null}

      {error ? <p className="form-message error-text">{error}</p> : null}
      {success ? <p className="form-message success-text">{success}</p> : null}

      <div className="croa-record-actions">
        {!isEditing && canEdit ? (
          <button className="button primary" type="button" onClick={handleStartEdit}>
            Editar em formulário
          </button>
        ) : null}

        {isEditing ? (
          <>
            <button className="button primary" disabled={isPending} type="submit">
              {isPending ? "Salvando..." : "Salvar"}
            </button>
            <button className="button secondary" disabled={isPending} onClick={handleCancelEdit} type="button">
              Cancelar
            </button>
            <button
              className="button secondary croa-record-delete"
              disabled={isPending}
              onClick={handleDelete}
              type="button"
            >
              Excluir tudo
            </button>
          </>
        ) : null}
      </div>
    </form>
  );
}

