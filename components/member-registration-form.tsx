"use client";

import { BloodType, MemberClass, MemberLevel, MemberStatus, RoleType } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState, useTransition } from "react";
import { formatCroaCode } from "@/lib/croa";
import { formatDdd, formatDdi, formatPhoneInternational, formatRg } from "@/lib/field-validation";

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
  { value: "admin", label: "Admin" },
  { value: "fundador", label: "Fundador" },
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

export function MemberRegistrationForm({
  fields,
  nextCroaNumber,
}: {
  fields: FieldOption[];
  nextCroaNumber: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("operador");
  const [selectedClass, setSelectedClass] = useState<MemberClass>("STANDARD");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoScale, setPhotoScale] = useState(100);
  const [photoPositionX, setPhotoPositionX] = useState(50);
  const [photoPositionY, setPhotoPositionY] = useState(50);
  const [crestLeftDataUrl, setCrestLeftDataUrl] = useState("");
  const [crestRightDataUrl, setCrestRightDataUrl] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<MemberStatus | "">("");
  const [showAuthorizationFields, setShowAuthorizationFields] = useState(false);
  const [ddi, setDdi] = useState("55");
  const [ddd, setDdd] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rg, setRg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const crestLeftInputRef = useRef<HTMLInputElement>(null);
  const crestRightInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPhotoDataUrl("");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoDataUrl(dataUrl);
    } catch {
      setError("Não foi possível carregar a foto do operador.");
    }
  }

  async function handleCrestChange(
    event: ChangeEvent<HTMLInputElement>,
    side: "left" | "right",
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      if (side === "left") {
        setCrestLeftDataUrl("");
      } else {
        setCrestRightDataUrl("");
      }
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);

      if (side === "left") {
        setCrestLeftDataUrl(dataUrl);
        return;
      }

      setCrestRightDataUrl(dataUrl);
    } catch {
      setError("Não foi possível carregar o brasão da carteirinha.");
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

  function handleOpenCrestPicker(side: "left" | "right") {
    if (side === "left") {
      crestLeftInputRef.current?.click();
      return;
    }

    crestRightInputRef.current?.click();
  }

  function handleRemoveCrest(side: "left" | "right") {
    if (side === "left") {
      setCrestLeftDataUrl("");
      if (crestLeftInputRef.current) {
        crestLeftInputRef.current.value = "";
      }
      return;
    }

    setCrestRightDataUrl("");
    if (crestRightInputRef.current) {
      crestRightInputRef.current.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      codiname: String(formData.get("codiname") ?? "").trim(),
      fullName: String(formData.get("fullName") ?? "").trim(),
      enrollmentDate: String(formData.get("enrollmentDate") ?? "").trim(),
      birthDate: String(formData.get("birthDate") ?? "").trim(),
      ddi: String(formData.get("ddi") ?? "").trim(),
      ddd: String(formData.get("ddd") ?? "").trim(),
      phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      rg: String(formData.get("rg") ?? "").trim(),
      status: String(formData.get("status") ?? "").trim(),
      addressStreet: String(formData.get("addressStreet") ?? "").trim(),
      addressNumber: String(formData.get("addressNumber") ?? "").trim(),
      neighborhood: String(formData.get("neighborhood") ?? "").trim(),
      postalCode: String(formData.get("postalCode") ?? "").trim(),
      addressComplement: String(formData.get("addressComplement") ?? "").trim(),
      fieldId: String(formData.get("fieldId") ?? "").trim(),
      memberClass: String(formData.get("memberClass") ?? "STANDARD"),
      accessLogin: String(formData.get("accessLogin") ?? "").trim(),
      accessPassword: String(formData.get("accessPassword") ?? "").trim(),
      adminAuthorizationLogin: String(formData.get("adminAuthorizationLogin") ?? "").trim(),
      adminAuthorizationPassword: String(formData.get("adminAuthorizationPassword") ?? "").trim(),
      level: String(formData.get("level") ?? "ALPHA_0"),
      role: String(formData.get("role") ?? "operador"),
      otherRole: String(formData.get("otherRole") ?? "").trim(),
      bloodType: String(formData.get("bloodType") ?? "").trim(),
      emergencyContactName: String(formData.get("emergencyContactName") ?? "").trim(),
      emergencyContactPhone: String(formData.get("emergencyContactPhone") ?? "").trim(),
      observations: String(formData.get("observations") ?? "").trim(),
      history: String(formData.get("history") ?? "").trim(),
      photoDataUrl,
      photoScale,
      photoPositionX,
      photoPositionY,
      crestLeftDataUrl,
      crestRightDataUrl,
    };

    startTransition(async () => {
      const response = await fetch("/api/membros", {
        method: "POST",
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
        setError(result.error ?? "Não foi possível salvar o membro.");
        return;
      }

      formElement.reset();
      setSelectedClass("STANDARD");
      setSelectedRole("operador");
      setPhotoDataUrl("");
      setPhotoScale(100);
      setPhotoPositionX(50);
      setPhotoPositionY(50);
      setCrestLeftDataUrl("");
      setCrestRightDataUrl("");
      setSelectedStatus("");
      setShowAuthorizationFields(false);
      setDdi("55");
      setDdd("");
      setPhoneNumber("");
      setRg("");
      setSuccess("Membro cadastrado com sucesso.");
      router.refresh();
    });
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <p className="admin-note">
        Uso exclusivo da administração. Este cadastro define a base oficial de operadores.
      </p>

      <div className="quick-form-grid">
        <div className="form-section-title field-full">Foto do Operador</div>

        <div className="field-full member-photo-block">
          <div className="member-photo-preview-shell">
            <div className="member-photo-preview">
              <Image
                alt="Pré-visualização da foto do operador"
                className="member-photo-preview-image"
                fill
                sizes="160px"
                src={photoDataUrl || "/member-default-photo.jpeg"}
                style={{
                  objectPosition: `${photoPositionX}% ${photoPositionY}%`,
                  transform: `scale(${photoScale / 100})`,
                }}
              />
              {!photoDataUrl ? (
                <div className="member-photo-caption">Coloque sua foto aqui!</div>
              ) : null}
            </div>
          </div>

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
                onChange={(event) => setPhotoScale(Number(event.target.value))}
                type="range"
                value={photoScale}
              />
            </label>

            <label className="field field-full">
              <span>Posição horizontal da foto</span>
              <input
                max="100"
                min="0"
                onChange={(event) => setPhotoPositionX(Number(event.target.value))}
                type="range"
                value={photoPositionX}
              />
            </label>

            <label className="field field-full">
              <span>Posição vertical da foto</span>
              <input
                max="100"
                min="0"
                onChange={(event) => setPhotoPositionY(Number(event.target.value))}
                type="range"
                value={photoPositionY}
              />
            </label>

            <div className="member-photo-actions">
              <button className="button secondary photo-action-button" onClick={handleOpenFilePicker} type="button">
                {photoDataUrl ? "Alterar foto" : "Inserir foto"}
              </button>

              <button className="button secondary photo-action-button" onClick={handleRemovePhoto} type="button">
                Excluir foto
              </button>
            </div>
          </div>
        </div>

        <div className="form-section-title field-full">Brasões da Carteirinha</div>

        <div className="field-full card-crest-grid">
          <div className="card-crest-card">
            <div className="card-crest-preview">
              {crestLeftDataUrl ? (
                <Image
                  alt="Brasão esquerdo da carteirinha"
                  className="card-crest-image"
                  fill
                  sizes="96px"
                  src={crestLeftDataUrl}
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
                {crestLeftDataUrl ? "Alterar brasão" : "Inserir brasão"}
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
              {crestRightDataUrl ? (
                <Image
                  alt="Brasão direito da carteirinha"
                  className="card-crest-image"
                  fill
                  sizes="96px"
                  src={crestRightDataUrl}
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
                {crestRightDataUrl ? "Alterar brasão" : "Inserir brasão"}
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

        <div className="field-full croa-status-stack">
          <div className="croa-display-block">
            <span className="croa-label">Registro CROA</span>
            <strong className="croa-display">{formatCroaCode(nextCroaNumber)}</strong>
          </div>

          <label className="field member-status-field">
            <span>Homologação</span>
            <select
              className={`member-status-select ${
                selectedStatus
                  ? statusOptions.find((item) => item.value === selectedStatus)?.badgeClass ?? ""
                  : "status-neutral"
              }`}
              defaultValue=""
              name="status"
              onChange={(event) => {
                setSelectedStatus(event.target.value as MemberStatus | "");
              }}
            >
              <option value="">Cadastrar situação</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-section-title field-full">Dados Pessoais</div>

        <label className="field">
          <span>Codinome</span>
          <input name="codiname" placeholder="Ex.: Falcão" required />
        </label>

        <label className="field">
          <span>Nome</span>
          <input name="fullName" placeholder="Ex.: Rafael Soares" required />
        </label>

        <label className="field">
          <span>Data de inscrição</span>
          <input name="enrollmentDate" type="date" />
        </label>

        <label className="field">
          <span>Data de nascimento</span>
          <input name="birthDate" type="date" />
        </label>

        <div className="phone-grid field-full">
          <label className="field">
            <span>DDI</span>
            <input
              inputMode="numeric"
              maxLength={2}
              name="ddi"
              onChange={(event) => setDdi(formatDdi(event.target.value))}
              placeholder="55"
              required
              value={ddi}
            />
          </label>

          <label className="field">
            <span>DDD</span>
            <input
              inputMode="numeric"
              maxLength={2}
              name="ddd"
              onChange={(event) => setDdd(formatDdd(event.target.value))}
              placeholder="31"
              required
              value={ddd}
            />
          </label>

          <label className="field phone-number-field">
            <span>Celular</span>
            <input
              inputMode="numeric"
              maxLength={12}
              name="phoneNumber"
              onChange={(event) => setPhoneNumber(formatPhoneInternational(event.target.value))}
              placeholder="999990000"
              required
              value={phoneNumber}
            />
          </label>
        </div>

        <label className="field field-full">
          <span>E-mail</span>
          <input name="email" placeholder="operador@exemplo.com" type="email" />
        </label>

        <label className="field field-full">
          <span>RG</span>
          <input
            maxLength={12}
            name="rg"
            onChange={(event) => setRg(formatRg(event.target.value))}
            placeholder="12.345.678-9"
            value={rg}
          />
        </label>

        <div className="address-grid field-full">
          <label className="field field-full">
            <span>Endereço de residência</span>
            <input name="addressStreet" placeholder="Rua, avenida ou estrada" />
          </label>

          <label className="field">
            <span>Número</span>
            <input name="addressNumber" placeholder="123" />
          </label>

          <label className="field">
            <span>Bairro</span>
            <input name="neighborhood" placeholder="Ex.: Centro" />
          </label>

          <label className="field">
            <span>CEP</span>
            <input name="postalCode" placeholder="00000-000" />
          </label>

          <label className="field field-full">
            <span>Complemento</span>
            <input name="addressComplement" placeholder="Ex.: apto, bloco, casa, referência" />
          </label>
        </div>

        <div className="form-section-title field-full">Dados do Operador</div>

        <div className="field-group field-full">
          <span>Campo</span>
          <label className="field">
            <select defaultValue="" name="fieldId">
              <option value="">1º CODE SP</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.label}
                </option>
              ))}
            </select>
          </label>
          <p className="field-helper">Selecione o campo registrado do operador.</p>
        </div>

        <label className="field">
          <span>Classe</span>
          <select
            defaultValue="STANDARD"
            name="memberClass"
            onChange={(event) => {
              const nextValue = event.target.value as MemberClass;
              setSelectedClass(nextValue);

              if (nextValue !== "MASTER" && nextValue !== "ALMIGHTY") {
                setShowAuthorizationFields(false);
              }
            }}
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
          <select defaultValue="ALPHA_0" name="level">
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
            defaultValue="operador"
            name="role"
            onChange={(event) => setSelectedRole(event.target.value as RoleType)}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {selectedRole === "outros" ? (
          <label className="field field-full">
            <span>Nova função</span>
            <input name="otherRole" placeholder="Digite a função personalizada" required />
          </label>
        ) : null}

        {selectedClass === "MASTER" || selectedClass === "ALMIGHTY" ? (
          <>
            <div className="form-section-title field-full">Acesso Privilegiado do Operador</div>

            <label className="field">
              <span>Login do operador</span>
              <input name="accessLogin" placeholder="Crie o login do operador" required />
            </label>

            <label className="field">
              <span>Senha do operador</span>
              <input name="accessPassword" required type="password" />
            </label>

            <p className="field-helper field-full">
              {selectedClass === "MASTER"
                ? "MASTER pode editar e alterar em nível administrativo."
                : "ALMIGHTY possui acesso máximo e exigirá autorização crítica em alterações sensíveis."}
            </p>

          </>
        ) : null}

        <div className="form-section-title field-full">Dados de Emergência</div>

        <label className="field">
          <span>Tipo de sangue</span>
          <select defaultValue="" name="bloodType">
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
          <input name="emergencyContactName" placeholder="Ex.: Ana Soares" />
        </label>

        <label className="field field-full">
          <span>Número do contato de emergência</span>
          <input name="emergencyContactPhone" placeholder="Ex.: +55 (31) 99999-0000" />
        </label>

        <label className="field field-full">
          <span>Descrição / observações</span>
          <textarea
            maxLength={500}
            name="observations"
            placeholder="Observações administrativas sobre o operador (máximo 500 caracteres)."
            rows={5}
          />
        </label>

        <label className="field field-full">
          <span>Histórico</span>
          <textarea
            name="history"
            placeholder="Eventos realizados, conclusão do evento e data da realização."
            rows={7}
          />
        </label>

        {selectedClass === "MASTER" || selectedClass === "ALMIGHTY" ? (
          <>
            <div className="authorization-request field-full">
              <span>Solicitação necessita de Autorização</span>
              <button
                className="button secondary photo-action-button"
                onClick={() => setShowAuthorizationFields((current) => !current)}
                type="button"
              >
                Acesso
              </button>
            </div>

            {showAuthorizationFields ? (
              <div className="authorization-overlay field-full">
                <div className="form-section-title field-full">Autorização Administrativa</div>

                <label className="field">
                  <span>Login</span>
                  <input name="adminAuthorizationLogin" required />
                </label>

                <label className="field">
                  <span>Senha</span>
                  <input name="adminAuthorizationPassword" required type="password" />
                </label>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {error ? <p className="form-message error-text">{error}</p> : null}
      {success ? <p className="form-message success-text">{success}</p> : null}

      <button className="button primary" disabled={isPending} type="submit">
        {isPending ? "Salvando..." : "Cadastrar membro"}
      </button>
    </form>
  );
}
