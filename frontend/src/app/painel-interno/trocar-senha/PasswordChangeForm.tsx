"use client";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./password.module.css";
type Field = "current" | "next" | "confirm";
export function PasswordChangeForm({ required }: { required: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState<Record<Field, boolean>>({
    current: false,
    next: false,
    confirm: false,
  });
  const checks = useMemo(
    () => ({
      length: password.length >= 10,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
    }),
    [password],
  );
  const score = Object.values(checks).filter(Boolean).length;
  function toggle(field: Field) {
    setVisible((value) => ({ ...value, [field]: !value[field] }));
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    if (score < 4) {
      setMessage(
        "Crie uma senha que atenda a todos os critérios de segurança.",
      );
      return;
    }
    if (password !== confirmation) {
      setMessage("As novas senhas não coincidem.");
      return;
    }
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const response = await fetch("/api/session/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senhaAtual: data.get("senhaAtual"),
        novaSenha: password,
      }),
    });
    setLoading(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setMessage(
        body?.message ??
          "Não foi possível alterar a senha. Confira sua senha atual.",
      );
      return;
    }
    router.replace("/");
    router.refresh();
  }
  const Eye = ({ field }: { field: Field }) => (
    <button
      className={styles.reveal}
      type="button"
      onClick={() => toggle(field)}
      aria-label={visible[field] ? "Ocultar senha" : "Mostrar senha"}
    >
      <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {visible[field] ? <><path d="M3 3l18 18"/><path d="M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.7 10.7 0 0112 4c5.5 0 9 5 9 5s-1.2 1.7-3.2 3.1M6.6 6.6C4.3 8 3 10 3 10s3.5 5 9 5c1 0 2-.2 2.9-.5"/></> : <><path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z"/><circle cx="12" cy="12" r="2.5"/></>}
      </svg>
    </button>
  );
  return (
    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.securityIcon}>⌁</div>
        <p className="eyebrow">Segurança da conta</p>
        <h2>{required ? "Crie sua nova senha" : "Alterar sua senha"}</h2>
        <p>
          {required
            ? "Esta é uma senha temporária. Antes de entrar no painel, defina uma senha pessoal e segura."
            : "Confirme sua senha atual e escolha uma nova combinação para sua conta."}
        </p>
      </header>
      {required && (
        <div className={styles.notice}>
          <span>◆</span>
          <div>
            <strong>Primeiro acesso</strong>
            <br />
            Você será direcionado ao painel assim que concluir esta etapa.
          </div>
        </div>
      )}
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.field}>
          Senha atual
          <div className={styles.inputWrap}>
            <input
              name="senhaAtual"
              type={visible.current ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Digite a senha temporária ou atual"
              autoFocus
            />
            <Eye field="current" />
          </div>
        </label>
        <label className={styles.field}>
          Nova senha
          <div className={styles.inputWrap}>
            <input
              name="novaSenha"
              type={visible.next ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha forte"
            />
            <Eye field="next" />
          </div>
        </label>
        <div
          className={styles.strength}
          aria-label={`Força da senha: ${score} de 4`}
        >
          {[1, 2, 3, 4].map((value) => (
            <span className={score >= value ? styles.ok : ""} key={value} />
          ))}
        </div>
        <ul className={styles.requirements}>
          <li className={checks.length ? styles.valid : ""}>
            <i>{checks.length ? "✓" : ""}</i>10 caracteres ou mais
          </li>
          <li className={checks.upper ? styles.valid : ""}>
            <i>{checks.upper ? "✓" : ""}</i>Uma letra maiúscula
          </li>
          <li className={checks.lower ? styles.valid : ""}>
            <i>{checks.lower ? "✓" : ""}</i>Uma letra minúscula
          </li>
          <li className={checks.number ? styles.valid : ""}>
            <i>{checks.number ? "✓" : ""}</i>Um número
          </li>
        </ul>
        <label className={styles.field}>
          Confirmar nova senha
          <div className={styles.inputWrap}>
            <input
              name="confirmacao"
              type={visible.confirm ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Digite novamente"
            />
            <Eye field="confirm" />
          </div>
        </label>
        {message && (
          <p className={styles.message} role="alert">
            {message}
          </p>
        )}
        <button className={styles.submit} disabled={loading}>
          {loading ? (
            <>
              <span className={styles.spinner} />
              Salvando nova senha...
            </>
          ) : (
            "Salvar e acessar o painel"
          )}
        </button>
      </form>
      <p className={styles.help}>
        Problemas para acessar?{" "}
        <strong>Fale com o administrador da plataforma.</strong>
      </p>
    </div>
  );
}
