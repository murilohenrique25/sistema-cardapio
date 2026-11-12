"use client";

import { ChangeEvent, useState } from "react";
import styles from "./settings.module.css";

export function ImageUploader({ type, currentId, label }: { type: "logo" | "banner"; currentId: string | null; label: string }) {
  const [imageId, setImageId] = useState(currentId);
  const [status, setStatus] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setStatus("Enviando...");
    const data = new FormData(); data.set("file", file);
    const response = await fetch(`/api/minha-empresa/imagens/${type}`, { method: "POST", body: data });
    if (!response.ok) { const error = await response.json().catch(() => null) as { message?: string } | null; setStatus(error?.message ?? "Falha no envio"); return; }
    const result = await response.json() as { arquivoId: string };
    setImageId(result.arquivoId); setStatus("Imagem atualizada");
  }
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  return <div className={styles.uploader}>
    <div className={type === "logo" ? styles.logoPreview : styles.bannerPreview}>
      {/* eslint-disable-next-line @next/next/no-img-element -- imagens são servidas pela API Java com cache próprio */}
      {imageId ? <img src={`${api}/api/public/arquivos/${imageId}`} alt={label} /> : <span>Sem imagem</span>}
    </div>
    <div><strong>{label}</strong><p>JPG, PNG ou WebP, até 2 MB.</p><label className={styles.fileButton}>Selecionar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></label>{status && <small>{status}</small>}</div>
  </div>;
}
