"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState, useTransition } from "react";
import { formatFieldCode } from "@/lib/field-code";
import { formatCnpj, formatDdd, formatDdi, formatPhoneInternational } from "@/lib/field-validation";

type MemberOption = {
  id: string;
  label: string;
};

type CountryOption = {
  code: string;
  label: string;
};

type StateOption = {
  code: string;
  label: string;
};

type FieldFormData = {
  id: string;
  codeNumber: number;
  name: string;
  cnpj: string;
  fullAddress: string;
  ownerName: string;
  contactPhone: string;
  website: string;
  instagram: string;
  facebook: string;
  operatorId: string;
  registrationDate: string;
  contractValidUntil: string;
  refereeId: string;
  firstRangerId: string;
  secondRangerId: string;
  countryCode: string;
  state: string;
  photoDataUrl: string;
  photoScale: number;
  photoPositionX: number;
  photoPositionY: number;
};

const countryOptions: CountryOption[] = [
  { code: "BR", label: "Brasil" },
  { code: "AR", label: "Argentina" },
  { code: "PY", label: "Paraguai" },
  { code: "UY", label: "Uruguai" },
  { code: "CL", label: "Chile" },
  { code: "BO", label: "Bolívia" },
  { code: "PE", label: "Peru" },
  { code: "CO", label: "Colômbia" },
  { code: "US", label: "Estados Unidos" },
  { code: "PT", label: "Portugal" },
];

const stateOptionsByCountry: Record<string, StateOption[]> = {
  BR: [
    { code: "AC", label: "Acre" },
    { code: "AL", label: "Alagoas" },
    { code: "AP", label: "Amapá" },
    { code: "AM", label: "Amazonas" },
    { code: "BA", label: "Bahia" },
    { code: "CE", label: "Ceará" },
    { code: "DF", label: "Distrito Federal" },
    { code: "ES", label: "Espírito Santo" },
    { code: "GO", label: "Goiás" },
    { code: "MA", label: "Maranhão" },
    { code: "MT", label: "Mato Grosso" },
    { code: "MS", label: "Mato Grosso do Sul" },
    { code: "MG", label: "Minas Gerais" },
    { code: "PA", label: "Pará" },
    { code: "PB", label: "Paraíba" },
    { code: "PR", label: "Paraná" },
    { code: "PE", label: "Pernambuco" },
    { code: "PI", label: "Piauí" },
    { code: "RJ", label: "Rio de Janeiro" },
    { code: "RN", label: "Rio Grande do Norte" },
    { code: "RS", label: "Rio Grande do Sul" },
    { code: "RO", label: "Rondônia" },
    { code: "RR", label: "Roraima" },
    { code: "SC", label: "Santa Catarina" },
    { code: "SP", label: "São Paulo" },
    { code: "SE", label: "Sergipe" },
    { code: "TO", label: "Tocantins" },
  ],
  AR: [
    { code: "BA", label: "Buenos Aires" },
    { code: "CA", label: "Catamarca" },
    { code: "CB", label: "Córdoba" },
    { code: "ER", label: "Entre Ríos" },
    { code: "JU", label: "Jujuy" },
    { code: "LP", label: "La Pampa" },
    { code: "LR", label: "La Rioja" },
    { code: "ME", label: "Mendoza" },
    { code: "MI", label: "Misiones" },
    { code: "NQ", label: "Neuquén" },
    { code: "RN", label: "Río Negro" },
    { code: "SA", label: "Salta" },
    { code: "SC", label: "Santa Cruz" },
    { code: "SF", label: "Santa Fe" },
    { code: "SE", label: "Santiago del Estero" },
    { code: "TF", label: "Tierra del Fuego" },
    { code: "TU", label: "Tucumán" },
  ],
  PY: [
    { code: "AS", label: "Asunción" },
    { code: "AL", label: "Alto Paraná" },
    { code: "CE", label: "Central" },
    { code: "CG", label: "Caaguazú" },
    { code: "IT", label: "Itapúa" },
  ],
  UY: [
    { code: "AR", label: "Artigas" },
    { code: "CA", label: "Canelones" },
    { code: "CO", label: "Colonia" },
    { code: "MA", label: "Maldonado" },
    { code: "MO", label: "Montevideo" },
    { code: "PA", label: "Paysandú" },
  ],
  CL: [
    { code: "AN", label: "Antofagasta" },
    { code: "AT", label: "Atacama" },
    { code: "BI", label: "Biobío" },
    { code: "LI", label: "Libertador General Bernardo O'Higgins" },
    { code: "MA", label: "Magallanes" },
    { code: "RM", label: "Región Metropolitana" },
    { code: "VS", label: "Valparaíso" },
  ],
  BO: [
    { code: "BE", label: "Beni" },
    { code: "CH", label: "Chuquisaca" },
    { code: "CB", label: "Cochabamba" },
    { code: "LP", label: "La Paz" },
    { code: "OR", label: "Oruro" },
    { code: "PA", label: "Pando" },
    { code: "PT", label: "Potosí" },
    { code: "SC", label: "Santa Cruz" },
    { code: "TJ", label: "Tarija" },
  ],
  PE: [
    { code: "AR", label: "Arequipa" },
    { code: "CU", label: "Cusco" },
    { code: "JU", label: "Junín" },
    { code: "LI", label: "Lima" },
    { code: "LL", label: "La Libertad" },
    { code: "PI", label: "Piura" },
  ],
  CO: [
    { code: "AN", label: "Antioquia" },
    { code: "AT", label: "Atlántico" },
    { code: "BO", label: "Bolívar" },
    { code: "CA", label: "Caldas" },
    { code: "DC", label: "Bogotá D.C." },
    { code: "VC", label: "Valle del Cauca" },
  ],
  US: [
    { code: "CA", label: "California" },
    { code: "FL", label: "Florida" },
    { code: "NY", label: "Nova York" },
    { code: "NV", label: "Nevada" },
    { code: "TX", label: "Texas" },
    { code: "WA", label: "Washington" },
  ],
  PT: [
    { code: "AV", label: "Aveiro" },
    { code: "BR", label: "Braga" },
    { code: "CO", label: "Coimbra" },
    { code: "LI", label: "Lisboa" },
    { code: "PO", label: "Porto" },
    { code: "SE", label: "Setúbal" },
  ],
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

function parseContactPhone(value: string) {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) {
    return { ddi: "55", ddd: "", number: "" };
  }

  const ddi = cleaned.slice(0, 2) || "55";
  const ddd = cleaned.slice(2, 4);
  const number = cleaned.slice(4, 16);
  return { ddi, ddd, number };
}

export function FieldRegistrationForm({
  nextFieldCodeNumber,
  managers,
  referees,
  rangers,
  initialData,
  endpoint,
  submitLabel,
  successMessage,
  returnHref,
  allowDelete = false,
}: {
  nextFieldCodeNumber: number;
  managers: MemberOption[];
  referees: MemberOption[];
  rangers: MemberOption[];
  initialData?: FieldFormData;
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
  const [countryCode, setCountryCode] = useState(initialData?.countryCode || "BR");
  const [stateCode, setStateCode] = useState(initialData?.state || "SP");
  const [photoDataUrl, setPhotoDataUrl] = useState(initialData?.photoDataUrl || "");
  const [photoScale, setPhotoScale] = useState(initialData?.photoScale ?? 100);
  const [photoPositionX, setPhotoPositionX] = useState(initialData?.photoPositionX ?? 50);
  const [photoPositionY, setPhotoPositionY] = useState(initialData?.photoPositionY ?? 50);
  const [cnpj, setCnpj] = useState(initialData?.cnpj || "");
  const initialPhone = parseContactPhone(initialData?.contactPhone || "");
  const [ddi, setDdi] = useState(initialPhone.ddi);
  const [ddd, setDdd] = useState(initialPhone.ddd);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.number);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const availableStates = stateOptionsByCountry[countryCode] ?? stateOptionsByCountry.BR;
  const isEditing = Boolean(initialData && endpoint);

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
      setError("Não foi possível carregar a imagem do campo.");
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      cnpj: formatCnpj(String(formData.get("cnpj") ?? "")),
      fullAddress: String(formData.get("fullAddress") ?? "").trim(),
      ownerName: String(formData.get("ownerName") ?? "").trim(),
      contactPhone: `+${formatDdi(String(formData.get("contactDdi") ?? ""))} ${formatDdd(
        String(formData.get("contactDdd") ?? ""),
      )} ${formatPhoneInternational(String(formData.get("contactPhoneNumber") ?? ""))}`.trim(),
      website: String(formData.get("website") ?? "").trim(),
      instagram: String(formData.get("instagram") ?? "").trim(),
      facebook: String(formData.get("facebook") ?? "").trim(),
      operatorId: String(formData.get("operatorId") ?? "").trim(),
      registrationDate: String(formData.get("registrationDate") ?? "").trim() || null,
      contractValidUntil: String(formData.get("contractValidUntil") ?? "").trim() || null,
      refereeId: String(formData.get("refereeId") ?? "").trim(),
      firstRangerId: String(formData.get("firstRangerId") ?? "").trim(),
      secondRangerId: String(formData.get("secondRangerId") ?? "").trim(),
      countryCode: String(formData.get("countryCode") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      photoDataUrl,
      photoScale,
      photoPositionX,
      photoPositionY,
    };

    startTransition(async () => {
      const response = await fetch(endpoint ?? "/api/campos", {
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
        setError(result.error ?? "Não foi possível salvar o campo.");
        return;
      }

      if (!isEditing) {
        formElement.reset();
        setCountryCode("BR");
        setStateCode("SP");
        setPhotoDataUrl("");
        setPhotoScale(100);
        setPhotoPositionX(50);
        setPhotoPositionY(50);
        setCnpj("");
        setDdi("55");
        setDdd("");
        setPhoneNumber("");
      }

      setSuccess(successMessage ?? (isEditing ? "Campo atualizado com sucesso." : "Campo cadastrado com sucesso."));
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

    if (!window.confirm("Deseja realmente excluir este campo?")) {
      return;
    }

    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Não foi possível excluir o campo.");
        return;
      }

      router.push(returnHref ?? "/campos");
      router.refresh();
    });
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <p className="admin-note">
        Uso exclusivo da administração. Este cadastro define a base oficial de campos operacionais do CROA.
      </p>

      <div className="quick-form-grid">
        <div className="form-section-title field-full">Imagem do Campo</div>

        <div className="field-full field-photo-block">
          <div className="field-photo-preview-shell">
            <div className="field-photo-preview">
              <Image
                alt="Pré-visualização do campo"
                className="field-photo-preview-image"
                fill
                sizes="(max-width: 700px) 100vw, 360px"
                src={photoDataUrl || "/field-default-photo.png"}
                style={{
                  objectPosition: `${photoPositionX}% ${photoPositionY}%`,
                  transform: `scale(${photoScale / 100})`,
                }}
              />
              {!photoDataUrl ? <div className="field-photo-caption">Foto panorâmica do seu campo aqui!</div> : null}
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

        <div className="field-full croa-status-stack">
          <div className="field-code-grid">
            <div className="croa-display-block">
              <span className="croa-label">Registro do Campo</span>
              <strong className="croa-display">{formatFieldCode(initialData?.codeNumber ?? nextFieldCodeNumber, stateCode, countryCode)}</strong>
            </div>

            <label className="field member-status-field">
              <span>Responsável</span>
              <select defaultValue={initialData?.operatorId || ""} name="operatorId">
                <option value="">Selecione um responsável cadastrado</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field member-status-field">
              <span>País</span>
              <select
                defaultValue={initialData?.countryCode || "BR"}
                name="countryCode"
                onChange={(event) => {
                  const nextCountryCode = event.target.value;
                  const nextStates = stateOptionsByCountry[nextCountryCode] ?? stateOptionsByCountry.BR;
                  setCountryCode(nextCountryCode);
                  setStateCode(nextStates[0]?.code ?? "SP");
                }}
              >
                {countryOptions.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field member-status-field">
              <span>Estado</span>
              <select name="state" onChange={(event) => setStateCode(event.target.value)} value={stateCode}>
                {availableStates.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="field-row field-full field-team-row">
          <label className="field">
            <span>Árbitro Responsável</span>
            <select defaultValue={initialData?.refereeId || ""} name="refereeId">
              <option value="">Selecione um árbitro cadastrado</option>
              {referees.map((referee) => (
                <option key={referee.id} value={referee.id}>
                  {referee.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>1º Ranger</span>
            <select defaultValue={initialData?.firstRangerId || ""} name="firstRangerId">
              <option value="">Selecione o 1º ranger</option>
              {rangers.map((ranger) => (
                <option key={ranger.id} value={ranger.id}>
                  {ranger.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>2º Ranger</span>
            <select defaultValue={initialData?.secondRangerId || ""} name="secondRangerId">
              <option value="">Selecione o 2º ranger</option>
              {rangers.map((ranger) => (
                <option key={ranger.id} value={ranger.id}>
                  {ranger.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="field-row field-name-cnpj-row field-full">
          <label className="field field-name-field">
            <span>Nome do Campo</span>
            <input defaultValue={initialData?.name || ""} name="name" placeholder="Ex.: Arena CODE Serra Verde" />
          </label>

          <label className="field field-cnpj-field">
            <span>CNPJ</span>
            <input
              inputMode="numeric"
              maxLength={18}
              name="cnpj"
              onChange={(event) => setCnpj(formatCnpj(event.target.value))}
              pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
              placeholder="00.000.000/0000-00"
              value={cnpj}
            />
          </label>
        </div>

        <label className="field field-full">
          <span>Endereço Completo</span>
          <textarea
            defaultValue={initialData?.fullAddress || ""}
            name="fullAddress"
            placeholder="Rua, número, bairro, cidade, estado, país e referências do campo"
            rows={4}
          />
        </label>

        <div className="field-row field-owner-contact-row field-full">
          <label className="field field-owner-field">
            <span>Nome Proprietário</span>
            <input defaultValue={initialData?.ownerName || ""} name="ownerName" placeholder="Ex.: Carlos Almeida" />
          </label>

          <div className="phone-grid field-contact-field">
            <label className="field">
              <span>DDI</span>
              <input inputMode="numeric" maxLength={2} name="contactDdi" onChange={(event) => setDdi(formatDdi(event.target.value))} placeholder="55" value={ddi} />
            </label>

            <label className="field">
              <span>DDD</span>
              <input inputMode="numeric" maxLength={2} name="contactDdd" onChange={(event) => setDdd(formatDdd(event.target.value))} placeholder="11" value={ddd} />
            </label>

            <label className="field phone-number-field">
              <span>Celular</span>
              <input
                inputMode="numeric"
                maxLength={12}
                name="contactPhoneNumber"
                onChange={(event) => setPhoneNumber(formatPhoneInternational(event.target.value))}
                pattern="\d{8,12}"
                placeholder="11999990000"
                value={phoneNumber}
              />
            </label>
          </div>
        </div>

        <div className="field-row field-full field-social-row">
          <label className="field">
            <span>Site</span>
            <input defaultValue={initialData?.website || ""} name="website" placeholder="https://www.campo.com.br" type="url" />
          </label>

          <label className="field">
            <span>Instagram</span>
            <input defaultValue={initialData?.instagram || ""} name="instagram" placeholder="@campocode" />
          </label>

          <label className="field">
            <span>Facebook</span>
            <input defaultValue={initialData?.facebook || ""} name="facebook" placeholder="facebook.com/campocode" />
          </label>
        </div>

        <div className="field-row field-dates-row field-full">
          <label className="field">
            <span>Data de registro</span>
            <input defaultValue={initialData?.registrationDate || ""} name="registrationDate" type="date" />
          </label>

          <label className="field">
            <span>Data de vigência de contrato</span>
            <input defaultValue={initialData?.contractValidUntil || ""} name="contractValidUntil" type="date" />
          </label>
        </div>
      </div>

      {error ? <p className="form-message error-text">{error}</p> : null}
      {success ? <p className="form-message success-text">{success}</p> : null}

      <div className="croa-record-actions">
        <button className="button primary" disabled={isPending} type="submit">
          {isPending ? "Salvando..." : submitLabel ?? (isEditing ? "Salvar alterações" : "Cadastrar campo")}
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
