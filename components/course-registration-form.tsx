"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState, useTransition } from "react";
import { courseCategoryOptions } from "@/lib/offerings";

type FieldOption = {
  id: string;
  label: string;
};

type CourseInitialData = {
  id: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  instructorName: string;
  workloadLabel: string;
  targetLevel: string;
  targetClass: string;
  city: string;
  state: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  totalSeats: number;
  reservedSlots: number;
  priceLabel: string;
  reservationLabel: string;
  whatsappMessage: string;
  fieldId: string;
  photoDataUrl: string;
  photoScale: number;
  photoPositionX: number;
  photoPositionY: number;
  active: boolean;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

export function CourseRegistrationForm({
  fieldOptions,
  initialData,
  endpoint,
  submitLabel,
  successMessage,
  returnHref,
  allowDelete = false,
}: {
  fieldOptions: FieldOption[];
  initialData?: CourseInitialData;
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
  const [active, setActive] = useState(initialData?.active ?? true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData && endpoint);

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
      setError("Não foi possível carregar a imagem do curso.");
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
      category: String(formData.get("category") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      instructorName: String(formData.get("instructorName") ?? "").trim(),
      workloadLabel: String(formData.get("workloadLabel") ?? "").trim(),
      targetLevel: String(formData.get("targetLevel") ?? "").trim(),
      targetClass: String(formData.get("targetClass") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      startAt: String(formData.get("startAt") ?? "").trim(),
      endAt: String(formData.get("endAt") ?? "").trim() || null,
      registrationDeadline: String(formData.get("registrationDeadline") ?? "").trim() || null,
      totalSeats: Number(String(formData.get("totalSeats") ?? "0").replace(/[^\d]/g, "") || "0"),
      reservedSlots: Number(String(formData.get("reservedSlots") ?? "0").replace(/[^\d]/g, "") || "0"),
      priceLabel: String(formData.get("priceLabel") ?? "").trim(),
      reservationLabel: String(formData.get("reservationLabel") ?? "").trim(),
      whatsappMessage: String(formData.get("whatsappMessage") ?? "").trim(),
      fieldId: String(formData.get("fieldId") ?? "").trim() || null,
      active,
      photoDataUrl,
      photoScale,
      photoPositionX,
      photoPositionY,
    };

    startTransition(async () => {
      const response = await fetch(endpoint ?? "/api/cursos", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Não foi possível salvar o curso.");
        return;
      }

      if (!isEditing) {
        form.reset();
        setPhotoDataUrl("");
        setPhotoScale(100);
        setPhotoPositionX(50);
        setPhotoPositionY(50);
        setActive(true);
      }

      setSuccess(successMessage ?? (isEditing ? "Curso atualizado com sucesso." : "Curso cadastrado com sucesso."));
      router.refresh();
    });
  }

  function handleCancel() {
    if (returnHref) router.push(returnHref);
    else router.refresh();
  }

  function handleDelete() {
    if (!endpoint || !window.confirm("Deseja realmente excluir este curso?")) return;
    startTransition(async () => {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        setError(result.error ?? "Não foi possível excluir o curso.");
        return;
      }
      router.push(returnHref ?? "/cursos");
      router.refresh();
    });
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <p className="admin-note">Uso exclusivo da administração. Cadastre avaliações, exames, workshops, palestras e trilhas oficiais do CROA.</p>

      <div className="quick-form-grid">
        <div className="form-section-title field-full">Imagem do Curso</div>
        <div className="field-full field-photo-block">
          <div className="field-photo-preview-shell">
            <div className="field-photo-preview">
              <Image
                alt="Pré-visualização do curso"
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
              {!photoDataUrl ? <div className="field-photo-caption">Imagem oficial do curso aqui!</div> : null}
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

        <div className="form-section-title field-full">Identificação do Curso</div>
        <div className="field-row field-full event-header-row">
          <label className="field event-title-field"><span>Nome do curso</span><input defaultValue={initialData?.title || ""} name="title" placeholder="Ex.: Avaliação N3 CROA" /></label>
          <label className="field"><span>Categoria</span><select defaultValue={initialData?.category || courseCategoryOptions[0]} name="category">{courseCategoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          <label className="field"><span>Campo vinculado</span><select defaultValue={initialData?.fieldId || ""} name="fieldId"><option value="">Sem campo vinculado</option>{fieldOptions.map((field) => <option key={field.id} value={field.id}>{field.label}</option>)}</select></label>
        </div>

        <div className="field-row field-full field-social-row">
          <label className="field"><span>Instrutor / responsável</span><input defaultValue={initialData?.instructorName || ""} name="instructorName" placeholder="Ex.: Equipe CROA" /></label>
          <label className="field"><span>Carga horária</span><input defaultValue={initialData?.workloadLabel || ""} name="workloadLabel" placeholder="Ex.: 12h presenciais" /></label>
          <label className="field"><span>Texto do botão</span><input defaultValue={initialData?.reservationLabel || "Reservar vaga"} name="reservationLabel" placeholder="Reservar vaga" /></label>
        </div>

        <div className="field-row field-full field-social-row">
          <label className="field"><span>Nível-alvo</span><input defaultValue={initialData?.targetLevel || ""} name="targetLevel" placeholder="Ex.: N3" /></label>
          <label className="field"><span>Classe-alvo</span><input defaultValue={initialData?.targetClass || ""} name="targetClass" placeholder="Ex.: Top Team" /></label>
          <label className="field field-boolean-toggle">
            <span>Curso ativo</span>
            <button className={`button secondary boolean-toggle-button${active ? " is-active" : ""}`} onClick={() => setActive((current) => !current)} type="button">
              {active ? "Ativo" : "Inativo"}
            </button>
          </label>
        </div>

        <div className="field-row field-full field-social-row">
          <label className="field"><span>Cidade</span><input defaultValue={initialData?.city || ""} name="city" placeholder="Ex.: São Paulo" /></label>
          <label className="field"><span>Estado</span><input defaultValue={initialData?.state || ""} name="state" placeholder="Ex.: SP" /></label>
          <label className="field"><span>Valor</span><input defaultValue={initialData?.priceLabel || ""} name="priceLabel" placeholder="Ex.: R$ 85,00" /></label>
        </div>

        <div className="field-row field-full field-dates-row">
          <label className="field"><span>Início</span><input defaultValue={initialData?.startAt || ""} name="startAt" type="datetime-local" /></label>
          <label className="field"><span>Fim</span><input defaultValue={initialData?.endAt || ""} name="endAt" type="datetime-local" /></label>
          <label className="field"><span>Reserva até</span><input defaultValue={initialData?.registrationDeadline || ""} name="registrationDeadline" type="datetime-local" /></label>
        </div>

        <div className="field-row field-full field-social-row">
          <label className="field"><span>Vagas totais</span><input defaultValue={initialData?.totalSeats ?? 0} min="0" name="totalSeats" type="number" /></label>
          <label className="field"><span>Reservas atuais</span><input defaultValue={initialData?.reservedSlots ?? 0} min="0" name="reservedSlots" type="number" /></label>
          <label className="field"><span>Mensagem do WhatsApp</span><input defaultValue={initialData?.whatsappMessage || ""} name="whatsappMessage" placeholder="Ex.: Olá! Quero reservar vaga para a avaliação N3." /></label>
        </div>

        <label className="field field-full"><span>Resumo</span><textarea defaultValue={initialData?.summary || ""} name="summary" rows={3} placeholder="Resumo curto para o card público." /></label>
        <label className="field field-full"><span>Descrição completa</span><textarea defaultValue={initialData?.description || ""} name="description" rows={5} placeholder="Programa, critérios, materiais e orientações do curso." /></label>
      </div>

      {error ? <p className="form-message error-text">{error}</p> : null}
      {success ? <p className="form-message success-text">{success}</p> : null}

      <div className="croa-record-actions">
        <button className="button primary" disabled={isPending} type="submit">{isPending ? "Salvando..." : submitLabel ?? (isEditing ? "Salvar alterações" : "Cadastrar curso")}</button>
        {isEditing ? <button className="button secondary" disabled={isPending} onClick={handleCancel} type="button">Cancelar</button> : null}
        {allowDelete ? <button className="button secondary" disabled={isPending} onClick={handleDelete} type="button">Excluir tudo</button> : null}
      </div>
    </form>
  );
}
