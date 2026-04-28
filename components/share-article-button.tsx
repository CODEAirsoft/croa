"use client";

import { useState } from "react";

type Props = {
  title: string;
  text?: string | null;
  url: string;
  label?: string;
};

export function ShareArticleButton({ title, text: _text, url, label = "Compartilhar" }: Props) {
  const [feedback, setFeedback] = useState("");

  async function handleShare() {
    const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setFeedback("Link copiado.");
    } catch {
      setFeedback("Não foi possível copiar o link.");
    }
  }

  return (
    <div className="share-article-block">
      <button aria-label={title} className="button secondary" type="button" onClick={handleShare}>
        {label}
      </button>
      {feedback ? <span className="share-article-feedback">{feedback}</span> : null}
    </div>
  );
}
