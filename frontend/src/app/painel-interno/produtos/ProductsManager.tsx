"use client";
/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from "react";
import styles from "./products.module.css";
type Category = { id: string; nome: string; ativa: boolean };
export type Product = {
  id: string;
  categoriaId: string;
  categoriaNome: string;
  nome: string;
  descricao: string | null;
  codigoInterno: string | null;
  preco: number;
  imagemArquivoId: string | null;
  ordem: number;
  ativo: boolean;
  disponivel: boolean;
  regraPreco: "SOMA" | "MAIOR_COMPLEMENTO" | "MEDIA_COMPLEMENTOS";
};
const empty = {
  categoriaId: "",
  nome: "",
  descricao: "",
  codigoInterno: "",
  preco: 0,
  ordem: 0,
  ativo: true,
  disponivel: true,
  regraPreco: "SOMA" as "SOMA" | "MAIOR_COMPLEMENTO" | "MEDIA_COMPLEMENTOS",
};
type Draft = Omit<typeof empty, "regraPreco"> & {
  regraPreco?: "SOMA" | "MAIOR_COMPLEMENTO" | "MEDIA_COMPLEMENTOS";
  id?: string;
};
export function ProductsManager({
  initial,
  categories,
}: {
  initial: Product[];
  categories: Category[];
}) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState("");
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function upload(id: string, image: File) {
    const body = new FormData();
    body.set("file", image);
    const response = await fetch(`/api/produtos/${id}/imagem`, {
      method: "POST",
      body,
    });
    if (!response.ok)
      throw new Error("Produto salvo, mas não foi possível enviar a imagem.");
    const result = await response.json();
    return result.arquivoId as string;
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setLoading("save");
    setMessage("");
    const response = await fetch(
      editing.id ? `/api/produtos/${editing.id}` : "/api/produtos",
      {
        method: editing.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setMessage(body?.message ?? "Não foi possível salvar o produto.");
      setLoading("");
      return;
    }
    let saved = (await response.json()) as Product;
    try {
      if (file)
        saved = { ...saved, imagemArquivoId: await upload(saved.id, file) };
    } catch (reason) {
      setMessage(
        reason instanceof Error ? reason.message : "Falha ao enviar imagem.",
      );
    }
    setItems((current) =>
      editing.id
        ? current.map((product) => (product.id === saved.id ? saved : product))
        : [...current, saved],
    );
    setEditing(null);
    setFile(null);
    setLoading("");
  }
  async function changeImage(id: string, image: File) {
    setLoading(`image-${id}`);
    try {
      const arquivoId = await upload(id, image);
      setItems((current) =>
        current.map((product) =>
          product.id === id
            ? { ...product, imagemArquivoId: arquivoId }
            : product,
        ),
      );
    } catch (reason) {
      setMessage(
        reason instanceof Error ? reason.message : "Falha ao enviar imagem.",
      );
    }
    setLoading("");
  }
  async function disable(id: string) {
    setLoading(id);
    const response = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    setLoading("");
    if (response.ok)
      setItems((current) =>
        current.map((product) =>
          product.id === id ? { ...product, ativo: false } : product,
        ),
      );
    else setMessage("Não foi possível inativar o produto.");
  }
  function open(product?: Product) {
    setFile(null);
    setMessage("");
    setEditing(
      product
        ? {
            id: product.id,
            categoriaId: product.categoriaId,
            nome: product.nome,
            descricao: product.descricao ?? "",
            codigoInterno: product.codigoInterno ?? "",
            preco: product.preco,
            ordem: product.ordem,
            ativo: product.ativo,
            disponivel: product.disponivel,
            regraPreco: product.regraPreco ?? "SOMA",
          }
        : {
            ...empty,
            categoriaId:
              categories.find((category) => category.ativa)?.id ?? "",
          },
    );
  }
  return (
    <>
      <div className={styles.toolbar}>
        <div>
          <p className="eyebrow">Catálogo</p>
          <h2>Seus produtos</h2>
          <p>Gerencie preço, disponibilidade e apresentação dos itens.</p>
        </div>
        <button className="button" onClick={() => open()}>
          <span>＋</span> Novo produto
        </button>
      </div>
      {message && <p className={styles.message}>{message}</p>}
      <div className={styles.grid}>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <span>◫</span>
            <strong>Nenhum produto cadastrado</strong>
            <p>Cadastre o primeiro item do cardápio.</p>
            <button className="button" onClick={() => open()}>
              Criar produto
            </button>
          </div>
        ) : (
          items.map((product) => (
            <article className={styles.card} key={product.id}>
              <div className={styles.image}>
                {product.imagemArquivoId ? (
                  <img
                    src={`${api}/api/public/arquivos/${product.imagemArquivoId}`}
                    alt={product.nome}
                  />
                ) : (
                  <div>
                    <span>🍽</span>
                    <small>Sem foto</small>
                  </div>
                )}
                <label className={styles.imageAction}>
                  {loading === `image-${product.id}`
                    ? "Enviando..."
                    : "Trocar foto"}
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={!!loading}
                    onChange={(event) =>
                      event.target.files?.[0] &&
                      changeImage(product.id, event.target.files[0])
                    }
                  />
                </label>
              </div>
              <div className={styles.body}>
                <div className={styles.topline}>
                  <span>{product.categoriaNome}</span>
                  <span
                    className={`${styles.status} ${!product.disponivel || !product.ativo ? styles.off : ""}`}
                  >
                    {!product.ativo
                      ? "Inativo"
                      : product.disponivel
                        ? "Disponível"
                        : "Indisponível"}
                  </span>
                </div>
                <h3>{product.nome}</h3>
                <p>
                  {product.descricao ||
                    "Adicione uma descrição para ajudar o cliente a escolher."}
                </p>
                <strong className={styles.price}>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.preco)}
                </strong>
                <div className={styles.actions}>
                  <button
                    className="buttonSecondary"
                    onClick={() => open(product)}
                  >
                    Editar produto
                  </button>
                  {product.ativo && (
                    <button
                      className="buttonGhost"
                      disabled={loading === product.id}
                      onClick={() => disable(product.id)}
                    >
                      {loading === product.id ? "Inativando..." : "Inativar"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      {editing && (
        <div
          className={styles.overlay}
          onMouseDown={(event) =>
            event.target === event.currentTarget && setEditing(null)
          }
        >
          <section className={styles.dialog}>
            <header>
              <div>
                <p className="eyebrow">
                  {editing.id ? "Editar item" : "Novo item"}
                </p>
                <h2>
                  {editing.id
                    ? editing.nome || "Editar produto"
                    : "Cadastrar produto"}
                </h2>
              </div>
              <button
                className={styles.close}
                onClick={() => setEditing(null)}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>
            <form onSubmit={submit}>
              <div className={styles.formLayout}>
                <div className={styles.photoField}>
                  <div className={styles.photoPreview}>
                    {preview ? (
                      <img src={preview} alt="Prévia da foto" />
                    ) : (
                      <div>
                        <span>＋</span>
                        <strong>Adicionar foto</strong>
                        <small>JPG, PNG ou WEBP, até 2 MB</small>
                      </div>
                    )}
                  </div>
                  <label className="buttonSecondary">
                    {preview ? "Escolher outra" : "Selecionar imagem"}
                    <input
                      hidden
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        setFile(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </div>
                <div className={styles.fields}>
                  <label>
                    Categoria
                    <select
                      required
                      value={editing.categoriaId}
                      onChange={(e) =>
                        setEditing({ ...editing, categoriaId: e.target.value })
                      }
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories
                        .filter((c) => c.ativa)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Nome do produto
                    <input
                      required
                      value={editing.nome}
                      placeholder="Ex.: Coca-Cola 2 L"
                      onChange={(e) =>
                        setEditing({ ...editing, nome: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Preço de venda
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={editing.preco}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          preco: Number(e.target.value),
                        })
                      }
                    />
                    <small>Valor cobrado do cliente, em reais.</small>
                  </label>
                  <label>
                    Código interno <span>Opcional</span>
                    <input
                      value={editing.codigoInterno}
                      placeholder="Ex.: BEB-002"
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          codigoInterno: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Posição na categoria
                    <input
                      type="number"
                      min="0"
                      value={editing.ordem}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          ordem: Number(e.target.value),
                        })
                      }
                    />
                    <small>Menores aparecem primeiro.</small>
                  </label>
                  <label>
                    Tipo de precificação
                    <select
                      value={editing.regraPreco ?? "SOMA"}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          regraPreco: e.target.value as Draft["regraPreco"],
                        })
                      }
                    >
                      <option value="SOMA">Produto comum — somar adicionais</option>
                      <option value="MAIOR_COMPLEMENTO">Pizza — cobrar o sabor mais caro</option>
                      <option value="MEDIA_COMPLEMENTOS">Pizza — cobrar a média dos sabores</option>
                    </select>
                    <small>
                      Para pizzas, os sabores devem estar em um grupo de complementos.
                    </small>
                  </label>
                  <label className={styles.description}>
                    Descrição <span>Opcional</span>
                    <textarea
                      value={editing.descricao}
                      placeholder="Conte os principais detalhes do produto"
                      onChange={(e) =>
                        setEditing({ ...editing, descricao: e.target.value })
                      }
                    />
                  </label>
                  <div className={styles.switches}>
                    <label>
                      <input
                        type="checkbox"
                        checked={editing.ativo}
                        onChange={(e) =>
                          setEditing({ ...editing, ativo: e.target.checked })
                        }
                      />
                      <span>
                        <strong>Produto ativo</strong>
                        <small>Exibe o produto no cardápio.</small>
                      </span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={editing.disponivel}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            disponivel: e.target.checked,
                          })
                        }
                      />
                      <span>
                        <strong>Disponível para pedidos</strong>
                        <small>Permite adicionar ao carrinho.</small>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <footer>
                <button
                  className="buttonSecondary"
                  type="button"
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </button>
                <button className="button" disabled={loading === "save"}>
                  {loading === "save"
                    ? "Salvando produto..."
                    : "Salvar produto"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
