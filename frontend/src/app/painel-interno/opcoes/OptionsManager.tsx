"use client";
import { FormEvent, useState } from "react";
import styles from "./options.module.css";
type Product = { id: string; nome: string; preco: number };
type Group = {
  id: string;
  nome: string;
  minimo: number;
  maximo: number;
  itens: { id: string; nome: string; preco: number }[];
  produtoIds: string[];
};
type Promo = {
  id: string;
  produtoNome: string;
  precoPromocional: number;
  tag: string;
  inicio: string;
  fim: string;
  ativa: boolean;
};
type Variation = { id: string; nome: string; preco: number; ativa: boolean };
async function post(url: string, payload: unknown) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
export function OptionsManager({
  products,
  initialGroups,
  initialPromotions,
}: {
  products: Product[];
  initialGroups: Group[];
  initialPromotions: Promo[];
}) {
  const [groups, setGroups] = useState(initialGroups);
  const [promos, setPromos] = useState(initialPromotions);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selected, setSelected] = useState("");
  const [groupProducts, setGroupProducts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState("");
  async function loadVariations(id: string) {
    setSelected(id);
    if (!id) {
      setVariations([]);
      return;
    }
    setLoading("variations");
    const response = await fetch(`/api/produtos/${id}/variacoes`);
    setVariations(response.ok ? await response.json() : []);
    setLoading("");
  }
  async function addVariation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("variation");
    const form = event.currentTarget,
      data = new FormData(form),
      response = await post(`/api/produtos/${selected}/variacoes`, {
        nome: data.get("nome"),
        preco: Number(data.get("preco")),
        ordem: variations.length,
        ativa: true,
      });
    setLoading("");
    if (response.ok) {
      const created = await response.json();
      setVariations((current) => [...current, created]);
      form.reset();
      setMessage("");
    } else setMessage("Não foi possível criar a variação.");
  }
  async function addGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("group");
    const form = event.currentTarget,
      data = new FormData(form),
      response = await post("/api/grupos-complementos", {
        nome: data.get("nome"),
        obrigatorio: Number(data.get("minimo")) > 0,
        minimo: Number(data.get("minimo")),
        maximo: Number(data.get("maximo")),
        ativo: true,
        produtoIds: groupProducts,
        itens: [
          {
            nome: data.get("item"),
            preco: Number(data.get("preco")),
            ordem: 0,
            ativo: true,
          },
        ],
      });
    setLoading("");
    if (response.ok) {
      const created = await response.json();
      setGroups((current) => [...current, created]);
      form.reset();
      setGroupProducts([]);
      setMessage("");
    } else setMessage("Não foi possível criar o grupo de complementos.");
  }
  async function addPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("promo");
    const form = event.currentTarget,
      data = new FormData(form),
      response = await post("/api/promocoes", {
        produtoId: data.get("produto"),
        precoPromocional: Number(data.get("preco")),
        tag: data.get("tag"),
        inicio: new Date(String(data.get("inicio"))).toISOString(),
        fim: new Date(String(data.get("fim"))).toISOString(),
        ativa: true,
      });
    setLoading("");
    if (response.ok) {
      const created = await response.json();
      setPromos((current) => [created, ...current]);
      form.reset();
      setMessage("");
    } else setMessage("Não foi possível criar a promoção.");
  }
  return (
    <div className={styles.page}>
      {message && <p className={styles.error}>{message}</p>}
      <section className={styles.panel}>
        <header>
          <span>1</span>
          <div>
            <h2>Variações de produto</h2>
            <p>Crie tamanhos, volumes ou versões com preços diferentes.</p>
          </div>
        </header>
        <label>
          Produto
          <select
            value={selected}
            onChange={(event) => loadVariations(event.target.value)}
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option value={product.id} key={product.id}>
                {product.nome}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={addVariation}>
          <label>
            Nome da variação
            <input name="nome" required placeholder="Ex.: Grande" />
          </label>
          <label>
            Preço final
            <input
              name="preco"
              required
              type="number"
              step=".01"
              min="0"
              placeholder="0,00"
            />
          </label>
          <button
            className="button"
            disabled={!selected || loading === "variation"}
          >
            {loading === "variation" ? "Adicionando..." : "Adicionar variação"}
          </button>
        </form>
        {loading === "variations" ? (
          <p>Carregando variações...</p>
        ) : (
          variations.map((item) => (
            <div className={styles.row} key={item.id}>
              <span>{item.nome}</span>
              <strong>
                R$ {Number(item.preco).toFixed(2).replace(".", ",")}
              </strong>
            </div>
          ))
        )}
      </section>
      <section className={styles.panel}>
        <header>
          <span>2</span>
          <div>
            <h2>Grupos de complementos</h2>
            <p>Defina adicionais e quantos o cliente poderá escolher.</p>
          </div>
        </header>
        <form onSubmit={addGroup}>
          <label>
            Nome do grupo
            <input name="nome" required placeholder="Ex.: Adicionais" />
          </label>
          <div className={styles.inline}>
            <label>
              Quantidade mínima
              <input name="minimo" type="number" min="0" defaultValue="0" />
            </label>
            <label>
              Quantidade máxima
              <input name="maximo" type="number" min="1" defaultValue="1" />
            </label>
          </div>
          <label>
            Primeiro complemento
            <input name="item" required placeholder="Ex.: Bacon extra" />
          </label>
          <label>
            Preço adicional
            <input
              name="preco"
              required
              type="number"
              step=".01"
              min="0"
              placeholder="0,00"
            />
          </label>
          <fieldset className={styles.productPicker}>
            <legend>Aplicar aos produtos</legend>
            <p>Marque os itens que devem oferecer este complemento.</p>
            <div>
              {products.map((product) => (
                <label key={product.id} className={groupProducts.includes(product.id) ? styles.selectedProduct : ""}>
                  <input type="checkbox" checked={groupProducts.includes(product.id)} onChange={(event) => setGroupProducts((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))}/>
                  <span>{product.nome}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="button" disabled={loading === "group" || groupProducts.length === 0}>
            {loading === "group" ? "Criando grupo..." : "Criar grupo"}
          </button>
        </form>
        {groups.map((group) => (
          <div className={styles.row} key={group.id}>
            <span>
              {group.nome} · escolha de {group.minimo} a {group.maximo}
            </span>
            <strong>{group.itens.length} itens</strong>
          </div>
        ))}
      </section>
      <section className={styles.panel}>
        <header>
          <span>3</span>
          <div>
            <h2>Promoções</h2>
            <p>Programe um preço especial por período.</p>
          </div>
        </header>
        <form onSubmit={addPromo}>
          <label>
            Produto
            <select name="produto" required>
              <option value="">Selecione um produto</option>
              {products.map((product) => (
                <option value={product.id} key={product.id}>
                  {product.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Preço promocional
            <input
              name="preco"
              required
              type="number"
              step=".01"
              min="0"
              placeholder="0,00"
            />
          </label>
          <label>
            Texto da oferta
            <input name="tag" required placeholder="Ex.: Oferta do dia" />
          </label>
          <div className={styles.inline}>
            <label>
              Início
              <input name="inicio" required type="datetime-local" />
            </label>
            <label>
              Fim
              <input name="fim" required type="datetime-local" />
            </label>
          </div>
          <button className="button" disabled={loading === "promo"}>
            {loading === "promo" ? "Criando promoção..." : "Criar promoção"}
          </button>
        </form>
        {promos.map((promo) => (
          <div className={styles.row} key={promo.id}>
            <span>
              {promo.produtoNome} · {promo.tag}
            </span>
            <strong>
              R$ {Number(promo.precoPromocional).toFixed(2).replace(".", ",")}
            </strong>
          </div>
        ))}
      </section>
    </div>
  );
}
