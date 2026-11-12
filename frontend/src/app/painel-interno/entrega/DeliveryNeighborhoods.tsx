"use client";
import { FormEvent, useState } from "react";
import styles from "./delivery.module.css";
export type Neighborhood = {
  id: string;
  nome: string;
  taxa: number;
  ordem: number;
  ativo: boolean;
};
export function DeliveryNeighborhoods({
  initial,
}: {
  initial: Neighborhood[];
}) {
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("new");
    const form = event.currentTarget,
      data = new FormData(form);
    const response = await fetch("/api/bairros-entrega", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: data.get("nome"),
        taxa: Number(data.get("taxa")),
        ordem: Number(data.get("ordem")),
        ativo: true,
      }),
    });
    setLoading("");
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      setMessage(error?.message ?? "Não foi possível adicionar o bairro.");
      return;
    }
    const created = await response.json();
    setItems((current) =>
      [...current, created].sort((a, b) => a.ordem - b.ordem),
    );
    form.reset();
    setMessage("");
  }
  async function save(item: Neighborhood) {
    setLoading(item.id);
    const response = await fetch(`/api/bairros-entrega/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    setLoading("");
    if (!response.ok) {
      setMessage("Não foi possível salvar o bairro.");
      return;
    }
    const saved = await response.json();
    setItems((current) =>
      current.map((value) => (value.id === saved.id ? saved : value)),
    );
    setMessage("");
  }
  async function disable(id: string) {
    setLoading(id);
    const response = await fetch(`/api/bairros-entrega/${id}`, {
      method: "DELETE",
    });
    setLoading("");
    if (response.ok)
      setItems((current) =>
        current.map((value) =>
          value.id === id ? { ...value, ativo: false } : value,
        ),
      );
    else setMessage("Não foi possível inativar o bairro.");
  }
  function update(
    id: string,
    field: keyof Neighborhood,
    value: string | number,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }
  return (
    <div className={styles.stack}>
      <section className={styles.info}>
        <div className={styles.infoIcon}>⌖</div>
        <div>
          <strong>Taxa por bairro</strong>
          <p>
            O cliente seleciona um bairro atendido e a taxa correspondente é
            aplicada automaticamente no checkout.
          </p>
        </div>
      </section>
      <section className={styles.card}>
        <header>
          <div>
            <p className="eyebrow">Área de entrega</p>
            <h2>Adicionar bairro atendido</h2>
          </div>
        </header>
        <form className={styles.newRow} onSubmit={create}>
          <label>
            Nome do bairro
            <input name="nome" placeholder="Ex.: Centro" required />
          </label>
          <label>
            Taxa de entrega
            <input
              name="taxa"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              required
            />
            <span>Valor em reais</span>
          </label>
          <label>
            Posição na lista
            <input name="ordem" type="number" min="0" defaultValue="0" />
            <span>Menores aparecem primeiro</span>
          </label>
          <button className="button" disabled={loading === "new"}>
            {loading === "new" ? "Adicionando..." : "Adicionar bairro"}
          </button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.list}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <strong>Nenhum bairro cadastrado</strong>
              <span>
                Adicione as regiões onde o estabelecimento realiza entregas.
              </span>
            </div>
          ) : (
            items.map((item) => (
              <article
                className={!item.ativo ? styles.inactive : ""}
                key={item.id}
              >
                <label>
                  Bairro
                  <input
                    value={item.nome}
                    onChange={(e) => update(item.id, "nome", e.target.value)}
                    disabled={!item.ativo}
                  />
                </label>
                <label>
                  Taxa (R$)
                  <input
                    value={item.taxa}
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(e) =>
                      update(item.id, "taxa", Number(e.target.value))
                    }
                    disabled={!item.ativo}
                  />
                </label>
                <label>
                  Posição
                  <input
                    value={item.ordem}
                    type="number"
                    min="0"
                    onChange={(e) =>
                      update(item.id, "ordem", Number(e.target.value))
                    }
                    disabled={!item.ativo}
                  />
                </label>
                <div className={styles.actions}>
                  {item.ativo ? (
                    <>
                      <button
                        className="buttonSecondary"
                        disabled={loading === item.id}
                        onClick={() => save(item)}
                      >
                        {loading === item.id ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        className="buttonGhost"
                        disabled={loading === item.id}
                        onClick={() => disable(item.id)}
                      >
                        Inativar
                      </button>
                    </>
                  ) : (
                    <span>Inativo</span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
