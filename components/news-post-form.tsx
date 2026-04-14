"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState, useTransition } from "react";

type LinkOption = {
  id: string;
  label: string;
};

type NewsInitialData = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  imageDataUrl: string;
  imageScale: number;
  imagePositionX: number;
  imagePositionY: number;
  videoUrl: string;
  externalLink: string;
  eventId: string;
  courseId: string;
  published: boolean;
  sortOrder: number;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

export function NewsPostForm({
  eventOptions,
  courseOptions,
  initialData,
  endpoint,
  submitLabel,
  successMessage,
  returnHref,
  allowDelete = false,
}: {
  eventOptions: LinkOption[];
  courseOptions: LinkOption[];
  initialData?: NewsInitialData;
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
  const [imageDataUrl, setImageDataUrl] = useState(initialData?.imageDataUrl || "");
  const [imageScale, setImageScale] = useState(initialData?.imageScale ?? 100);
  const [imagePositionX, setImagePositionX] = useState(initialData?.imagePositionX ?? 50);
  const [imagePositionY, setImagePositionY] = useState(initialData?.imagePositionY ?? 50);
  const [published, setPublished] = useState(initialData?.published ?? true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData && endpoint);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setImageDataUrl("");
      return;
    }
    try {
      setImageDataUrl(await readFileAsDataUrl(file));
      setError("");
    } catch {
      setError("Não foi possível carregar a imagem da notícia.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      excerpt: String(formData.get("excerpt") ?? "").trim(),
      body: String(formData.get("body") ?? "").trim(),
      imageDataUrl,
      imageScale,
      imagePositionX,
      imagePositionY,
      videoUrl: String(formData.get("videoUrl") ?? "").trim(),
      externalLink: String(formData.get("externalLink") ?? "").trim(),
      eventId: String(formData.get("eventId") ?? "").trim() || null,
      courseId: String(formData.get("courseId") ?? "").trim() || null,
      published,
      sortOrder: Number(String(formData.get("sortOrder") ?? "0").replace(/[^\d-]/g, "") || "0"),
    };

    startTransition(async () => {
      const response = await fetch(endpoint ?? "/api/noticias", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Não foi possível salvar a notícia.");
        return;
      }

      if (!isEditing) {
        formElement.reset();
        setImageDataUrl("");
        setImageScale(100);
        setImagePositionX(50);
        setImagePositionY(50);
        setPublished(true);
      }

      setSuccess(successMessage ?? (isEditing ? "Notícia atualizada com sucesso." : "Notícia publicada com sucesso."));
      router.refresh();
    });
  }

  function handleCancel() {
    if (returnHref) router.push(returnHref);
    else router.refresh();
  }

  function handleDelete() {
    if (!endpoint || !window.confirm("Deseja realmente excluir esta notícia?")) return;
    startTransition(async () => {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Não foi possível excluir a notícia.");
        return;
      }
      router.push(returnHref ?? "/redacao");
      router.refresh();
    });
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <p className="admin-note">Uso exclusivo da administração. Publique comunicados, convocações, notícias, links, imagens e vídeos do CROA.</p>

      <div className="quick-form-grid">
        <div className="form-section-title field-full">Capa da notícia</div>
        <div className="field-full field-photo-block">
          <div className="field-photo-preview-shell">
            <div className="field-photo-preview field-photo-preview-rect">
              <Image
                alt="Pré-visualização da notícia"
                className="field-photo-preview-image"
                fill
                sizes="(max-width: 700px) 100vw, 420px"
                src={imageDataUrl || "/cadastro-campos.png"}
                style={{
                  objectPosition: `${imagePositionX}% ${imagePositionY}%`,
                  transform: `scale(${imageScale / 100})`,
                }}
                unoptimized
              />
              {!imageDataUrl ? <div className="field-photo-caption">Imagem principal da notícia aqui!</div> : null}
            </div>
          </div>

          <div className="member-photo-controls">
            <input ref={fileInputRef} accept="image/*" className="visually-hidden" type="file" onChange={handleImageChange} />
            <label className="field field-full"><span>Zoom da imagem</span><input type="range" min="60" max="140" value={imageScale} onChange={(e) => setImageScale(Number(e.target.value))} /></label>
            <label className="field field-full"><span>Posição horizontal</span><input type="range" min="0" max="100" value={imagePositionX} onChange={(e) => setImagePositionX(Number(e.target.value))} /></label>
            <label className="field field-full"><span>Posição vertical</span><input type="range" min="0" max="100" value={imagePositionY} onChange={(e) => setImagePositionY(Number(e.target.value))} /></label>
            <div className="member-photo-actions">
              <button className="button secondary photo-action-button" type="button" onClick={() => fileInputRef.current?.click()}>
                {imageDataUrl ? "Alterar imagem" : "Inserir imagem"}
              </button>
              <button className="button secondary photo-action-button" type="button" onClick={() => setImageDataUrl("")}>
                Excluir imagem
              </button>
            </div>
          </div>
        </div>

        <div className="form-section-title field-full">Publicação</div>

        <div className="field-row field-full event-header-row">
          <label className="field event-title-field">
            <span>Título da notícia</span>
            <input defaultValue={initialData?.title || ""} name="title" placeholder="Ex.: Convocação oficial para operação tática" />
          </label>

          <label className="field">
            <span>Ordem de destaque</span>
            <input defaultValue={initialData?.sortOrder ?? 0} min="0" name="sortOrder" type="number" />
          </label>

          <label className="field field-boolean-toggle">
            <span>Publicação</span>
            <button
              aria-pressed={published}
              className={`boolean-toggle-button ${published ? "is-active" : ""}`}
              type="button"
              onClick={() => setPublished((current) => !current)}
            >
              {published ? "Publicado" : "Rascunho"}
            </button>
          </label>
        </div>

        <label className="field field-full">
          <span>Resumo</span>
          <textarea defaultValue={initialData?.excerpt || ""} name="excerpt" rows={3} placeholder="Texto curto que aparece em destaque no Dashboard." />
        </label>

        <label className="field field-full">
          <span>Conteúdo da notícia</span>
          <textarea defaultValue={initialData?.body || ""} name="body" rows={10} placeholder="Escreva a notícia, comunicado, convocação ou informação oficial." />
        </label>

        <div className="field-row field-full field-social-row">
          <label className="field">
            <span>Link externo</span>
            <input defaultValue={initialData?.externalLink || ""} name="externalLink" placeholder="https://..." />
          </label>

          <label className="field">
            <span>Vídeo</span>
            <input defaultValue={initialData?.videoUrl || ""} name="videoUrl" placeholder="Link do vídeo ou YouTube" />
          </label>

          <label className="field">
            <span>Evento relacionado</span>
            <select defaultValue={initialData?.eventId || ""} name="eventId">
              <option value="">Sem evento relacionado</option>
              {eventOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field field-full">
          <span>Curso relacionado</span>
          <select defaultValue={initialData?.courseId || ""} name="courseId">
            <option value="">Sem curso relacionado</option>
            {courseOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="form-message error-text">{error}</p> : null}
      {success ? <p className="form-message success-text">{success}</p> : null}

      <div className="croa-record-actions">
        <button className="button primary" disabled={isPending} type="submit">
          {isPending ? "Salvando..." : submitLabel ?? (isEditing ? "Salvar alterações" : "Publicar notícia")}
        </button>
        {isEditing ? (
          <button className="button secondary" disabled={isPending} onClick={handleCancel} type="button">
            Cancelar
          </button>
        ) : null}
        {allowDelete ? (
          <button className="button secondary" disabled={isPending} onClick={handleDelete} type="button">
            Excluir tudo
          </button>
        ) : null}
      </div>
    </form>
  );
}
