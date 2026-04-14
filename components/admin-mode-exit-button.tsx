"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AdminModeExitButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDeactivate() {
    startTransition(async () => {
      await fetch("/api/seguranca/member-view-access", {
        method: "DELETE",
      });
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      className="button secondary admin-exit-button"
      disabled={isPending}
      onClick={handleDeactivate}
      type="button"
    >
      {isPending ? "Desativando..." : "Desativar modo administrador"}
    </button>
  );
}
