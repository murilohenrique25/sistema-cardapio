"use client";

import { FormEvent, useState } from "react";
import styles from "./settings.module.css";
import { ImageUploader } from "./ImageUploader";

export type CompanySettings = {
  id: string;
  slug: string;
  nomeFantasia: string;
  razaoSocial: string | null;
  documento: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  descricao: string | null;
  endereco: string | null;
  corPrimaria: string;
  corSecundaria: string;
  corDestaque: string;
  aceitaEntrega: boolean;
  aceitaRetirada: boolean;
  tipoTaxaEntrega: "SEM_ENTREGA" | "TAXA_FIXA" | "TAXA_POR_BAIRRO";
  taxaEntregaFixa: number | null;
  redesSociais: Record<string, string>;
  pedidoMinimo: number;
  tempoEntregaMin: number | null;
  tempoEntregaMax: number | null;
  freteGratisAcima: number | null;
  tema: string;
  logoArquivoId: string | null;
  bannerArquivoId: string | null;
};

export function CompanySettingsForm({ company }: { company: CompanySettings }) {
  const [delivery, setDelivery] = useState(company.aceitaEntrega);
  const [feeType, setFeeType] = useState(company.tipoTaxaEntrega);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const value = (name: string) => data.get(name)?.toString() || null;
    const body = {
      nomeFantasia: value("nomeFantasia"),
      razaoSocial: value("razaoSocial"),
      documento: value("documento"),
      telefone: value("telefone"),
      whatsapp: value("whatsapp"),
      email: value("email"),
      descricao: value("descricao"),
      endereco: value("endereco"),
      corPrimaria: value("corPrimaria"),
      corSecundaria: value("corSecundaria"),
      corDestaque: value("corDestaque"),
      aceitaEntrega: data.has("aceitaEntrega"),
      aceitaRetirada: data.has("aceitaRetirada"),
      tipoTaxaEntrega: delivery ? feeType : "SEM_ENTREGA",
      taxaEntregaFixa:
        delivery && feeType === "TAXA_FIXA"
          ? Number(value("taxaEntregaFixa"))
          : null,
      pedidoMinimo: Number(value("pedidoMinimo") ?? 0),
      tempoEntregaMin: value("tempoEntregaMin")
        ? Number(value("tempoEntregaMin"))
        : null,
      tempoEntregaMax: value("tempoEntregaMax")
        ? Number(value("tempoEntregaMax"))
        : null,
      freteGratisAcima: value("freteGratisAcima")
        ? Number(value("freteGratisAcima"))
        : null,
      tema: value("tema") ?? "AUTORAL",
      redesSociais: {
        INSTAGRAM: value("instagram"),
        FACEBOOK: value("facebook"),
        TIKTOK: value("tiktok"),
        SITE: value("site"),
      },
    };
    const response = await fetch("/api/minha-empresa", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setState("error");
      setMessage(error?.message ?? "Não foi possível salvar.");
      return;
    }
    setState("success");
    setMessage("Configurações salvas com sucesso.");
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <section className={styles.card}>
        <h2>Logo e banner</h2>
        <p>Imagens armazenadas com segurança junto aos dados da empresa.</p>
        <div className={styles.uploadGrid}>
          <ImageUploader
            type="logo"
            label="Logotipo"
            currentId={company.logoArquivoId}
          />
          <ImageUploader
            type="banner"
            label="Imagem de capa"
            currentId={company.bannerArquivoId}
          />
        </div>
      </section>
      <section className={styles.card}>
        <h2>Informações gerais</h2>
        <p>
          Dados exibidos no cardápio e usados no contato com o estabelecimento.
        </p>
        <div className={styles.fields}>
          <label>
            Nome fantasia
            <input
              name="nomeFantasia"
              defaultValue={company.nomeFantasia}
              required
            />
          </label>
          <label>
            Razão social
            <input
              name="razaoSocial"
              defaultValue={company.razaoSocial ?? ""}
            />
          </label>
          <label>
            CNPJ ou CPF
            <input name="documento" defaultValue={company.documento ?? ""} />
          </label>
          <label>
            Slug público
            <input value={company.slug} disabled />
          </label>
          <label>
            Telefone
            <input name="telefone" defaultValue={company.telefone ?? ""} />
          </label>
          <label>
            WhatsApp dos pedidos
            <input name="whatsapp" defaultValue={company.whatsapp ?? ""} />
          </label>
          <label>
            E-mail
            <input
              name="email"
              type="email"
              defaultValue={company.email ?? ""}
            />
          </label>
          <label>
            Endereço
            <input name="endereco" defaultValue={company.endereco ?? ""} />
          </label>
          <label className={styles.full}>
            Descrição
            <textarea name="descricao" defaultValue={company.descricao ?? ""} />
          </label>
        </div>
      </section>
      <section className={styles.card}>
        <h2>Identidade visual</h2>
        <p>As cores serão aplicadas ao cardápio público.</p>
        <label>
          Tema inicial
          <select name="tema" defaultValue={company.tema || "AUTORAL"}>
            <option value="AUTORAL">Autoral — usa suas cores</option>
            <option value="BISTRO">Bistrô elegante</option>
            <option value="FRESH">Fresh e saudável</option>
            <option value="DARK">Dark premium</option>
          </select>
          <small>
            O tema define a atmosfera; suas cores continuam personalizáveis.
          </small>
        </label>
        <div className={styles.colors}>
          {[
            ["corPrimaria", "Cor primária", company.corPrimaria],
            ["corSecundaria", "Cor secundária", company.corSecundaria],
            ["corDestaque", "Destaque", company.corDestaque],
          ].map(([name, label, color]) => (
            <label key={name}>
              {label}
              <span className={styles.colorField}>
                <input name={name} type="color" defaultValue={color} />
                <strong>{color}</strong>
              </span>
            </label>
          ))}
        </div>
      </section>
      <section className={styles.card}>
        <h2>Atendimento e entrega</h2>
        <p>Escolha como os clientes podem receber seus pedidos.</p>
        <div className={styles.switches}>
          <label>
            <input
              name="aceitaEntrega"
              type="checkbox"
              defaultChecked={company.aceitaEntrega}
              onChange={(e) => setDelivery(e.target.checked)}
            />
            Entrega
          </label>
          <label>
            <input
              name="aceitaRetirada"
              type="checkbox"
              defaultChecked={company.aceitaRetirada}
            />
            Retirada
          </label>
        </div>
        {delivery && (
          <div className={styles.fields}>
            <fieldset className={styles.feeSelector}>
              <legend>Como deseja calcular a entrega?</legend>
              <button type="button" className={feeType === "TAXA_FIXA" ? styles.selectedFee : ""} onClick={() => setFeeType("TAXA_FIXA")}><strong>Taxa fixa</strong><span>O mesmo valor para toda a área atendida</span></button>
              <button type="button" className={feeType === "TAXA_POR_BAIRRO" ? styles.selectedFee : ""} onClick={() => setFeeType("TAXA_POR_BAIRRO")}><strong>Por bairro</strong><span>Um valor diferente para cada região</span></button>
            </fieldset>
            {feeType === "TAXA_FIXA" && (
              <label>
                Valor da taxa
                <input
                  name="taxaEntregaFixa"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={company.taxaEntregaFixa ?? 0}
                  required
                />
              </label>
            )}
            <label>
              Frete grátis acima de <span>Opcional</span>
              <input
                name="freteGratisAcima"
                type="number"
                min="0"
                step="0.01"
                defaultValue={company.freteGratisAcima ?? ""}
              />
              <small>Deixe vazio para não oferecer frete grátis.</small>
            </label>
          </div>
        )}
        <div className={styles.fields}>
          <label>
            Pedido mínimo
            <input
              name="pedidoMinimo"
              type="number"
              min="0"
              step="0.01"
              defaultValue={company.pedidoMinimo ?? 0}
            />
          </label>
          <label>
            Tempo mínimo de entrega
            <input
              name="tempoEntregaMin"
              type="number"
              min="0"
              defaultValue={company.tempoEntregaMin ?? ""}
              placeholder="Ex.: 30"
            />
          </label>
          <label>
            Tempo máximo de entrega
            <input
              name="tempoEntregaMax"
              type="number"
              min="0"
              defaultValue={company.tempoEntregaMax ?? ""}
              placeholder="Ex.: 50"
            />
          </label>
        </div>
      </section>
      <section className={styles.card}>
        <h2>Redes sociais</h2>
        <p>Informe URLs completas, incluindo https://.</p>
        <div className={styles.fields}>
          <label>
            Instagram
            <input
              name="instagram"
              type="url"
              defaultValue={company.redesSociais.INSTAGRAM ?? ""}
            />
          </label>
          <label>
            Facebook
            <input
              name="facebook"
              type="url"
              defaultValue={company.redesSociais.FACEBOOK ?? ""}
            />
          </label>
          <label>
            TikTok
            <input
              name="tiktok"
              type="url"
              defaultValue={company.redesSociais.TIKTOK ?? ""}
            />
          </label>
          <label>
            Site
            <input
              name="site"
              type="url"
              defaultValue={company.redesSociais.SITE ?? ""}
            />
          </label>
        </div>
      </section>
      <div className={styles.footer}>
        {message && (
          <span className={state === "success" ? styles.success : styles.error}>
            {message}
          </span>
        )}
        <button className="button" disabled={state === "saving"}>
          {state === "saving" ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
