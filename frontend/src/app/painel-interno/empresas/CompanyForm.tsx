"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./companies.module.css";

export function CompanyForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/admin/empresas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(data)),
    });
    setLoading(false);
    if (!response.ok) {
      const error = await response.json().catch(() => null) as { message?: string } | null;
      setMessage(error?.message ?? "Não foi possível cadastrar a empresa.");
      return;
    }
    form.reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button className="button" onClick={() => setOpen(true)}>Nova empresa</button>
      {open && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="company-title">
            <header><div><p className="eyebrow">Novo cliente</p><h2 id="company-title">Cadastrar empresa</h2></div><button className={styles.close} onClick={() => setOpen(false)} aria-label="Fechar">×</button></header>
            <form onSubmit={submit}>
              <div className={styles.fields}>
                <label>Nome fantasia<input name="nomeFantasia" required maxLength={160} /></label>
                <label>Slug do cardápio<input name="slug" required maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="alabama-burger" /></label>
              </div>
              <div className={styles.divider}><span>Administrador da empresa</span></div>
              <div className={styles.fields}>
                <label>Nome<input name="adminNome" required maxLength={160} /></label>
                <label>E-mail<input name="adminEmail" type="email" required maxLength={254} /></label>
                <label className={styles.full}>Senha inicial<input name="adminSenha" type="password" required minLength={10} autoComplete="new-password" /></label>
              </div>
              {message && <p className={styles.error} role="alert">{message}</p>}
              <footer><button type="button" className={styles.secondary} onClick={() => setOpen(false)}>Cancelar</button><button className="button" disabled={loading}>{loading ? "Cadastrando..." : "Cadastrar empresa"}</button></footer>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

