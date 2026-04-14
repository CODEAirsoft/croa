"use client";

import { useState } from "react";

type Props = {
  title: string;
  text?: string | null;
  url: string;
};

export function ShareArticleButton({ title, text, url }: Props) {
  const [feedback, setFeedback] = useState("");

  async function handleShare() {
    const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: text ?? title,
          url: absoluteUrl,
        });
        setFeedback("Link compartilhado.");
        return;
      }

      await navigator.clipboard.writeText(absoluteUrl);
      setFeedback("Link copiado.");
    } catch {
      setFeedback("Não foi possível compartilhar.");
    }
  }

  return (
    <div className="share-article-block">
      <button className="button secondary" type="button" onClick={handleShare}>
        Compartilhar
      </button>
      {feedback ? <span className="share-article-feedback">{feedback}</span> : null}
    </div>
  );
}
