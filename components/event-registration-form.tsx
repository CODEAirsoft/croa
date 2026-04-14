"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useRef, useState, useTransition } from "react";
import { eventCategoryOptions, formatCurrencyValue, parseCurrencyInput, recurrenceFrequencyOptions } from "@/lib/offerings";

type FieldOption = {
  id: string;
  label: string;
  name: string;
  fullAddress: string;
};

type EventInitialData = {
  id: string;
  title: string;
  type: "aberto" | "fechado" | "chancelado" | "homologado";
  category: string;
  summary: string;
  description: string;
  organizerName: string;
  city: string;
  state: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  recurringEnabled: boolean;
  recurrenceFrequency: string;
  maxParticipants: number;
  reservedSlots: number;
  priceLabel: string;
  equipmentRentalLabel: string;
  discountPercent: number;
  reservationLabel: string;
  whatsappMessage: string;
  fieldId: string;
  photoDataUrl: string;
  photoScale: number;
  photoPositionX: number;
  photoPositionY: number;
  status: string;
};

const typeOptions = [
  { value: "aberto", label: "Aberto" },
  { value: "fechado", label: "Fechado" },
  { value: "chancelado", label: "Chancelado" },
  { value: "homologado", label: "Homologado" },
] as const;

const statusOptions = [
  { value: "planejamento", label: "Em planejamento", className: "status-neutral" },
  { value: "inscricoes-abertas", label: "Inscrições abertas", className: "status-active" },
  { value: "lotado", label: "Lotado", className: "status-excluded" },
  { value: "adiado", label: "Evento adiado", className: "status-inativo" },
  { value: "cancelado", label: "Cancelado", className: "status-cancelado" },
] as const;

const discountOptions = [0, 5, 10, 25, 50] as const;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

export function EventRegistrationForm({
  fieldOptions,
  initialData,
  endpoint,
  submitLabel,
  successMessage,
  returnHref,
  allowDelete = false,
}: {
  fieldOptions: FieldOption[];
  initialData?: EventInitialData;
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
  const [status, setStatus] = useState(initialData?.status || "planejamento");
  const [priceLabel, setPriceLabel] = useState(initialData?.priceLabel || "");
  const [discountPercent, setDiscountPercent] = useState(initialData?.discountPercent ?? 0);
  const [recurringEnabled, setRecurringEnabled] = useState(initialData?.recurringEnabled ?? false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState(initialData?.recurrenceFrequency || "semanal");
  const [selectedFieldId, setSelectedFieldId] = useState(initialData?.fieldId || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData && endpoint);

  const statusClass = useMemo(() => statusOptions.find((option) => option.value === status)?.className ?? "status-neutral", [status]);
  const discountedLabel = useMemo(() => {
    const amount = parseCurrencyInput(priceLabel);
    if (amount === null) return "";
    const discounted = amount * (1 - discountPercent / 100);
    return formatCurrencyValue(discounted);
  }, [discountPercent, priceLabel]);
  const selectedField = useMemo(
    () => fieldOptions.find((field) => field.id === selectedFieldId) ?? null,
    [fieldOptions, selectedFieldId],
  );

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoDataUrl("");
      return;
    }
    try {
      setPhotoDataUrl(await readFileAsDataUrl(file));
      setError("");
    } catch {
      setError("Não foi possível carregar a imagem do evento.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      type: String(formData.get("type") ?? "aberto"),
      category: String(formData.get("category") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      organizerName: String(formData.get("organizerName") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      startAt: String(formData.get("startAt") ?? "").trim(),
      endAt: String(formData.get("endAt") ?? "").trim() || null,
      registrationDeadline: String(formData.get("registrationDeadline") ?? "").trim() || null,
      recurringEnabled,
      recurrenceFrequency: recurringEnabled ? recurrenceFrequency : null,
      maxParticipants: Number(String(formData.get("maxParticipants") ?? "0").replace(/[^\d]/g, "") || "0"),
      reservedSlots: Number(String(formData.get("reservedSlots") ?? "0").replace(/[^\d]/g, "") || "0"),
      priceLabel: String(formData.get("priceLabel") ?? "").trim(),
      equipmentRentalLabel: String(formData.get("equipmentRentalLabel") ?? "").trim(),
      discountPercent,
      reservationLabel: String(formData.get("reservationLabel") ?? "").trim(),
      whatsappMessage: String(formData.get("whatsappMessage") ?? "").trim(),
      fieldId: selectedFieldId || null,
      status,
      photoDataUrl,
      photoScale,
      photoPositionX,
      photoPositionY,
    };

    startTransition(async () => {
      const response = await fetch(endpoint ?? "/api/eventos", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Não foi possível salvar o evento.");
        return;
      }

      if (!isEditing) {
        form.reset();
        setPhotoDataUrl("");
        setPhotoScale(100);
        setPhotoPositionX(50);
        setPhotoPositionY(50);
        setStatus("planejamento");
        setPriceLabel("");
        setDiscountPercent(0);
        setRecurringEnabled(false);
        setRecurrenceFrequency("semanal");
        setSelectedFieldId("");
      }

      setSuccess(successMessage ?? (isEditing ? "Evento atualizado com sucesso." : "Evento cadastrado com sucesso."));
      router.refresh();
    });
  }

  function handleCancel() {
    if (returnHref) router.push(returnHref);
    else router.refresh();
  }

  function handleDelete() {
    if (!endpoint || !window.confirm("Deseja realmente excluir este evento?")) return;
    startTransition(async () => {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        setError(result.error ?? "Não foi possível excluir o evento.");
        return;
      }
      router.push(returnHref ?? "/eventos");
      router.refresh();
    });
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <p className="admin-note">Uso exclusivo da administração. Cadastre jogos, operações, competições e demais eventos oficiais do CROA.</p>

      <div className="quick-form-grid">
        <div className="form-section-title field-full">Imagem do Evento</div>
        <div className="field-full field-photo-block">
          <div className="field-photo-preview-shell">
            <div className="field-photo-preview">
              <Image
                alt="Pré-visualização do evento"
                className="field-photo-preview-image"
                fill
                sizes="(max-width: 700px) 100vw, 360px"
                src={photoDataUrl || "/cadastro-campos.png"}
                style={{
                  objectPosition: `${photoPositionX}% ${photoPositionY}%`,
                  transform: `scale(${photoScale / 100})`,
                }}
                unoptimized
              />
              {!photoDataUrl ? <div className="field-photo-caption">Imagem oficial do evento aqui!</div> : null}
            </div>
          </div>

          <div className="member-photo-controls">
            <input ref={fileInputRef} accept="image/*" className="visually-hidden" type="file" onChange={handlePhotoChange} />
            <label className="field field-full"><span>Zoom da imagem</span><input type="range" min="60" max="140" value={photoScale} onChange={(e) => setPhotoScale(Number(e.target.value))} /></label>
            <label className="field field-full"><span>Posição horizontal</span><input type="range" min="0" max="100" value={photoPositionX} onChange={(e) => setPhotoPositionX(Number(e.target.value))} /></label>
            <label className="field field-full"><span>Posição vertical</span><input type="range" min="0" max="100" value={photoPositionY} onChange={(e) => setPhotoPositionY(Number(e.target.value))} /></label>
            <div className="member-photo-actions">
              <button className="button secondary photo-action-button" type="button" onClick={() => fileInputRef.current?.click()}>{photoDataUrl ? "Alterar imagem" : "Inserir imagem"}</button>
              <button className="button secondary photo-action-button" type="button" onClick={() => setPhotoDataUrl("")}>Excluir imagem</button>
            </div>
          </div>
        </div>

        <div className="form-section-title field-full">Identificação do Evento</div>

        <div className="field-row field-full event-header-row">
          <label className="field event-title-field">
            <span>Nome do evento</span>
            <input defaultValue={initialData?.title || ""} name="title" placeholder="Ex.: Operação Reconquista" />
          </label>

          <label className="field">
            <span>Tipo</span>
            <select defaultValue={initialData?.type || "aberto"} name="type">
              {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Categoria</span>
            <select defaultValue={initialData?.category || eventCategoryOptions[0]} name="category">
              {eventCategoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>

        <div className="field-row field-full event-meta-row">
          <label className="field">
            <span>Campo do evento</span>
            <select name="fieldId" value={selectedFieldId} onChange={(event) => setSelectedFieldId(event.target.value)}>
              <option value="">Selecione o campo do evento</option>
              {fieldOptions.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Organização responsável</span>
            <input defaultValue={initialData?.organizerName || ""} name="organizerName" placeholder="Ex.: Coordenação CROA" />
          </label>

          <label className="field member-status-field">
            <span>Estado operacional</span>
            <select className={`member-status-select ${statusClass}`} value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {selectedField ? (
          <p className="field-inline-note field-full">
            Local do evento: <strong>{selectedField.name}</strong>
            {selectedField.fullAddress ? ` | ${selectedField.fullAddress}` : ""}
          </p>
        ) : null}

        <div className="field-row field-full field-social-row">
          <label className="field"><span>Cidade</span><input defaultValue={initialData?.city || ""} name="city" placeholder="Ex.: Atibaia" /></label>
          <label className="field"><span>Estado</span><input defaultValue={initialData?.state || ""} name="state" placeholder="Ex.: SP" /></label>
          <label className="field"><span>Texto do botão</span><input defaultValue={initialData?.reservationLabel || "Reservar vaga"} name="reservationLabel" placeholder="Reservar vaga" /></label>
        </div>

        <div className="field-row field-full field-dates-row event-dates-inline">
          <label className="field"><span>Início</span><input defaultValue={initialData?.startAt || ""} name="startAt" type="datetime-local" /></label>
          <label className="field"><span>Fim</span><input defaultValue={initialData?.endAt || ""} name="endAt" type="datetime-local" /></label>
          <label className="field"><span>Reserva até</span><input defaultValue={initialData?.registrationDeadline || ""} name="registrationDeadline" type="datetime-local" /></label>
        </div>

        <div className="field-row field-full field-social-row">
          <label className="field field-boolean-toggle">
            <span>Periodicidade</span>
            <button
              aria-pressed={recurringEnabled}
              className={`boolean-toggle-button ${recurringEnabled ? "is-active" : ""}`}
              type="button"
              onClick={() => setRecurringEnabled((current) => !current)}
            >
              {recurringEnabled ? "Evento recorrente" : "Evento pontual"}
            </button>
          </label>

          <label className="field">
            <span>Recorrência</span>
            <select
              disabled={!recurringEnabled}
              value={recurrenceFrequency}
              onChange={(event) => setRecurrenceFrequency(event.target.value)}
            >
              {recurrenceFrequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="field field-inline-note">
            <span>Agenda</span>
            <strong>{recurringEnabled ? "Evento recorrente" : "Evento com data fixa"}</strong>
          </div>
        </div>

        <div className="field-row field-full field-social-row event-pricing-row">
          <label className="field"><span>Valor do evento</span><input value={priceLabel} name="priceLabel" onChange={(event) => setPriceLabel(event.target.value)} placeholder="Ex.: R$ 120,00" /></label>
          <label className="field"><span>Locação de equipamento</span><input defaultValue={initialData?.equipmentRentalLabel || ""} name="equipmentRentalLabel" placeholder="Ex.: R$ 80,00 kit completo" /></label>
          <label className="field"><span>Desconto</span><select value={String(discountPercent)} onChange={(event) => setDiscountPercent(Number(event.target.value))}>{discountOptions.map((value) => <option key={value} value={value}>{value === 0 ? "Sem desconto" : `${value}%`}</option>)}</select></label>
        </div>

        {discountedLabel ? <p className="field-inline-note field-full">Valor com desconto aplicado: <strong>{discountedLabel}</strong></p> : null}

        <div className="field-row field-full field-social-row">
          <label className="field"><span>Participantes máximos</span><input defaultValue={initialData?.maxParticipants ?? 0} min="0" name="maxParticipants" type="number" /></label>
          <label className="field"><span>Reservas atuais</span><input defaultValue={initialData?.reservedSlots ?? 0} min="0" name="reservedSlots" type="number" /></label>
          <label className="field"><span>Mensagem do WhatsApp</span><input defaultValue={initialData?.whatsappMessage || ""} name="whatsappMessage" placeholder="Ex.: Olá! Quero reservar vaga para este evento." /></label>
        </div>

        <label className="field field-full"><span>Resumo</span><textarea defaultValue={initialData?.summary || ""} name="summary" rows={3} placeholder="Resumo curto para o card público." /></label>
        <label className="field field-full"><span>Descrição completa</span><textarea defaultValue={initialData?.description || ""} name="description" rows={5} placeholder="Detalhes do evento, programação, regras, kit e observações." /></label>
      </div>

      {error ? <p className="form-message error-text">{error}</p> : null}
      {success ? <p className="form-message success-text">{success}</p> : null}

      <div className="croa-record-actions">
        <button className="button primary" disabled={isPending} type="submit">{isPending ? "Salvando..." : submitLabel ?? (isEditing ? "Salvar alterações" : "Cadastrar evento")}</button>
        {isEditing ? <button className="button secondary" disabled={isPending} onClick={handleCancel} type="button">Cancelar</button> : null}
        {allowDelete ? <button className="button secondary" disabled={isPending} onClick={handleDelete} type="button">Excluir tudo</button> : null}
      </div>
    </form>
  );
}
