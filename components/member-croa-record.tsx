"use client";

import { BloodType, MemberClass, MemberLevel, MemberStatus, RoleType } from "@prisma/client";
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

const classOptions: { value: MemberClass; label: string }[] = [
  { value: "STANDARD", label: "STANDARD" },
  { value: "PREMIUM", label: "PREMIUM" },
  { value: "TOP_TEAM", label: "TOP TEAM" },
  { value: "MASTER", label: "MASTER" },
  { value: "ALMIGHTY", label: "ALMIGHTY" },
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
  status: MemberStatus;
  fieldId: string;
  addressStreet: string;
  addressNumber: string;
  neighborhood: string;
  postalCode: string;
  addressComplement: string;
  bloodType: BloodType | "";
  emergencyContactName: string;
  emergencyContactPhone: string;
  observations: string;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

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

  const currentMember = isEditing ? draftMember : savedMember;
  const isPublicView = !isEditing;
  const selectedStatusClass =
    statusOptions.find((item) => item.value === currentMember.status)?.badgeClass ?? "status-active";

  function updateField<K extends keyof MemberCroaRecordData>(key: K, value: MemberCroaRecordData[K]) {
    setDraftMember((current) => ({
      ...current,
      [key]: value,
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
      const dataUrl = await readFileAsDataUrl(file);
      if (side === "left") {
        updateField("crestLeftDataUrl", dataUrl);
        return;
      }

      updateField("crestRightDataUrl", dataUrl);
    } catch {
      setError("Não foi possível carregar o brasão da carteirinha.");
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

          <strong className="croa-record-brand">CROA</strong>
        </div>

        <div className="croa-record-wallet-center">
          {isEditing ? (
            <div className="croa-record-header-line">
              <Image alt="Logotipo CODE Airsoft" height={58} priority src="/code-airsoft-logo.jpg" width={58} />
              <div className="croa-record-header-copy">
                <span className="croa-record-header-overline">CODE Airsoft</span>
                <strong className="croa-record-header-title">Carteira oficial do operador</strong>
              </div>
            </div>
          ) : null}

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
        {!isPublicView ? (
          <>
            <div className="form-section-title field-full">Dados Pessoais</div>

            <label className="field">
              <span>Codinome</span>
              <input
                onChange={(event) => updateField("codiname", event.target.value)}
                readOnly={!isEditing}
                value={currentMember.codiname}
              />
            </label>

            <label className="field">
              <span>Nome</span>
              <input
                onChange={(event) => updateField("fullName", event.target.value)}
                readOnly={!isEditing}
                value={currentMember.fullName}
              />
            </label>

            <label className="field">
              <span>Data de inscrição</span>
              <input
                onChange={(event) => updateField("enrollmentDate", event.target.value)}
                readOnly={!isEditing}
                type="date"
                value={currentMember.enrollmentDate}
              />
            </label>

            <label className="field">
              <span>Data de nascimento</span>
              <input
                onChange={(event) => updateField("birthDate", event.target.value)}
                readOnly={!isEditing}
                type="date"
                value={currentMember.birthDate}
              />
            </label>

            <div className="phone-grid field-full">
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
            </div>

            <label className="field field-full">
              <span>E-mail</span>
              <input
                onChange={(event) => updateField("email", event.target.value)}
                readOnly={!isEditing}
                type="email"
                value={currentMember.email}
              />
            </label>

            <label className="field field-full">
              <span>RG</span>
              <input
                maxLength={12}
                onChange={(event) => updateField("rg", formatRg(event.target.value))}
                readOnly={!isEditing}
                value={currentMember.rg}
              />
            </label>

            <div className="address-grid field-full">
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
            </div>
          </>
        ) : null}

        <div className="form-section-title field-full">Dados do Operador</div>

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

        <label className="field">
          <span>Classe</span>
          <select
            disabled={!isEditing}
            onChange={(event) => updateField("memberClass", event.target.value as MemberClass)}
            value={currentMember.memberClass}
          >
            {classOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

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

        {!isPublicView && (currentMember.memberClass === "MASTER" || currentMember.memberClass === "ALMIGHTY") ? (
          <>
            <div className="form-section-title field-full">Acesso Privilegiado do Operador</div>

            <label className="field">
              <span>Login do operador</span>
              <input
                onChange={(event) => updateField("accessLogin", event.target.value)}
                readOnly={!isEditing}
                value={currentMember.accessLogin}
              />
            </label>

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
          </>
        ) : null}

        {!isPublicView ? (
          <>
            <div className="form-section-title field-full">Dados de Emergência</div>

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
          </>
        ) : null}
      </div>

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

