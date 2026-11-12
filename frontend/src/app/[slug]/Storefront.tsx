"use client";
/* eslint-disable @next/next/no-img-element */
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./store.module.css";
type Variation = { id: string; nome: string; preco: number };
type Addon = { id: string; nome: string; preco: number };
type Group = {
  id: string;
  nome: string;
  obrigatorio: boolean;
  minimo: number;
  maximo: number;
  itens: Addon[];
};
type Product = {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  precoPromocional?: number;
  tagPromocao?: string;
  imagemArquivoId?: string;
  disponivel: boolean;
  regraPreco?: "SOMA" | "MAIOR_COMPLEMENTO" | "MEDIA_COMPLEMENTOS";
  variacoes: Variation[];
  grupos: Group[];
};
type Category = {
  id: string;
  nome: string;
  descricao?: string;
  produtos: Product[];
};
type Neighborhood = { id: string; nome: string; taxa: number };
type Hours = {
  diaSemana: number;
  aberto: boolean;
  inicio?: string;
  fim?: string;
};
export type Menu = {
  slug: string;
  nome: string;
  descricao?: string;
  whatsapp?: string;
  telefone?: string;
  endereco?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  corDestaque?: string;
  logoArquivoId?: string;
  bannerArquivoId?: string;
  aberta: boolean;
  aceitaEntrega: boolean;
  aceitaRetirada: boolean;
  tipoTaxaEntrega: string;
  taxaEntregaFixa?: number;
  pedidoMinimo?: number;
  tempoEntregaMin?: number;
  tempoEntregaMax?: number;
  freteGratisAcima?: number;
  tema?: string;
  redesSociais: Record<string, string>;
  bairros: Neighborhood[];
  horarios: Hours[];
  categorias: Category[];
};
type Selection = {
  product: Product;
  variationId?: string;
  addons: Record<string, number>;
  quantity: number;
  observation: string;
};
type CartItem = Selection & { key: string };
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const days = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];
const imageUrl = (id?: string) =>
  id ? `${API}/api/public/arquivos/${id}` : undefined;
function unitPrice(item: Selection) {
  const variation = item.product.variacoes.find(
    (value) => value.id === item.variationId,
  );
  const base =
    variation?.preco ?? item.product.precoPromocional ?? item.product.preco;
  const selected = item.product.grupos
    .flatMap((group) => group.itens)
    .filter((a) => (item.addons[a.id] ?? 0) > 0);
  const totalSelected = selected.reduce(
    (sum, addon) => sum + (item.addons[addon.id] ?? 0),
    0,
  );
  const sum = selected.reduce(
    (value, addon) => value + addon.preco * (item.addons[addon.id] ?? 0),
    0,
  );
  const extra =
    item.product.regraPreco === "MAIOR_COMPLEMENTO"
      ? Math.max(0, ...selected.map((a) => a.preco))
      : item.product.regraPreco === "MEDIA_COMPLEMENTOS" && totalSelected > 0
        ? sum / totalSelected
        : sum;
  return base + extra;
}
function slots(hours: Hours[]) {
  const result: { value: string; label: string }[] = [];
  const now = new Date();
  for (let offset = 0; offset < 8; offset++) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const day = ((date.getDay() + 6) % 7) + 1;
    const config = hours.find((item) => item.diaSemana === day);
    if (!config?.aberto || !config.inicio || !config.fim) continue;
    const [startH, startM] = config.inicio.split(":").map(Number);
    const [endH, endM] = config.fim.split(":").map(Number);
    const start = new Date(date);
    start.setHours(startH, startM, 0, 0);
    const end = new Date(date);
    end.setHours(endH, endM, 0, 0);
    if (end <= start) end.setDate(end.getDate() + 1);
    const minimum = new Date(now.getTime() + 20 * 60000);
    for (
      let time = new Date(start);
      time < end;
      time = new Date(time.getTime() + 30 * 60000)
    ) {
      if (time < minimum) continue;
      const value = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, "0")}-${String(time.getDate()).padStart(2, "0")}T${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
      result.push({
        value,
        label: `${offset === 0 ? "Hoje" : offset === 1 ? "Amanhã" : time.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}, ${time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      });
      if (result.length >= 40) return result;
    }
  }
  return result;
}
export function Storefront({ menu }: { menu: Menu }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkout, setCheckout] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [mode, setMode] = useState(menu.aceitaEntrega ? "ENTREGA" : "RETIRADA");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState("PIX");
  const [address, setAddress] = useState({
    street: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const availableSlots = useMemo(() => slots(menu.horarios), [menu.horarios]);
  const categories = useMemo(
    () =>
      menu.categorias
        .map((item) => ({
          ...item,
          produtos: item.produtos.filter(
            (product) =>
              (category === "all" || item.id === category) &&
              `${product.nome} ${product.descricao ?? ""}`
                .toLowerCase()
                .includes(query.toLowerCase()),
          ),
        }))
        .filter((item) => item.produtos.length),
    [menu, category, query],
  );
  const subtotal = cart.reduce(
    (sum, item) => sum + unitPrice(item) * item.quantity,
    0,
  );
  const freeShipping =
    menu.freteGratisAcima != null && subtotal >= menu.freteGratisAcima;
  const fee =
    mode === "RETIRADA" || freeShipping
      ? 0
      : menu.tipoTaxaEntrega === "TAXA_POR_BAIRRO"
        ? (menu.bairros.find((item) => item.id === neighborhoodId)?.taxa ?? 0)
        : (menu.taxaEntregaFixa ?? 0);
  function openProduct(product: Product) {
    if (!product.disponivel) return;
    setError("");
    setSelection({
      product,
      variationId: product.variacoes[0]?.id,
      addons: {},
      quantity: 1,
      observation: "",
    });
  }
  function add() {
    if (!selection) return;
    for (const group of selection.product.grupos) {
      const count = group.itens.reduce(
        (sum, item) => sum + (selection.addons[item.id] ?? 0),
        0,
      );
      if (count < group.minimo || count > group.maximo) {
        setError(
          `${group.nome}: escolha entre ${group.minimo} e ${group.maximo}.`,
        );
        return;
      }
    }
    setCart((current) => [
      ...current,
      { ...selection, key: crypto.randomUUID() },
    ]);
    setSelection(null);
  }
  function toggle(group: Group, addon: Addon) {
    if (!selection) return;
    const current = selection.addons[addon.id] ?? 0;
    const total = group.itens.reduce(
      (sum, item) => sum + (selection.addons[item.id] ?? 0),
      0,
    );
    setSelection({
      ...selection,
      addons: {
        ...selection.addons,
        [addon.id]: current ? 0 : total < group.maximo ? 1 : 0,
      },
    });
  }
  function quantity(key: string, delta: number) {
    setCart((current) =>
      current.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  }
  async function lookupCep(value: string) {
    const cep = value.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    setError("");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) throw new Error();
      setAddress({
        street: data.logradouro ?? "",
        neighborhood: data.bairro ?? "",
        city: data.localidade ?? "",
        state: data.uf ?? "",
      });
      const normalized = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      const matched = menu.bairros.find((item) => normalized(item.nome) === normalized(data.bairro ?? ""));
      if (matched) setNeighborhoodId(matched.id);
    } catch {
      setError("CEP não encontrado. Preencha o endereço manualmente.");
    } finally {
      setCepLoading(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const schedule = String(data.get("schedule") ?? "");
    const payload = {
      empresaSlug: menu.slug,
      clienteNome: data.get("name"),
      telefone: data.get("phone"),
      modalidade: mode,
      bairroId: mode === "ENTREGA" && neighborhoodId ? neighborhoodId : null,
      endereco:
        mode === "ENTREGA"
          ? {
              cep: data.get("cep"),
              rua: data.get("street"),
              numero: data.get("number"),
              complemento: data.get("complement"),
              bairro: data.get("neighborhood"),
              referencia: data.get("reference"),
            }
          : null,
      pagamento: data.get("payment"),
      trocoPara:
        data.get("payment") === "DINHEIRO" && data.get("change")
          ? Number(data.get("change"))
          : null,
      agendadoPara: schedule ? new Date(schedule).toISOString() : null,
      cupomCodigo: coupon.trim() || null,
      sessao:
        typeof window !== "undefined"
          ? sessionStorage.getItem("sc-session")
          : null,
      itens: cart.map((item) => ({
        produtoId: item.product.id,
        variacaoId: item.variationId ?? null,
        quantidade: item.quantity,
        observacao: item.observation,
        complementos: Object.entries(item.addons)
          .filter(([, amount]) => amount > 0)
          .map(([id, amount]) => ({ id, quantidade: amount })),
      })),
    };
    try {
      const response = await fetch("/api/public/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message ?? "Não foi possível criar o pedido.");
      window.location.href = body.whatsappUrl;
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível criar o pedido.",
      );
      setSending(false);
    }
  }
  return (
    <main
      className={styles.page}
      style={
        {
          "--store-primary": menu.corPrimaria || "#e54818",
          "--store-secondary": menu.corSecundaria || "#2b1711",
          "--store-accent": menu.corDestaque || "#ffb703",
        } as React.CSSProperties
      }
    >
      <header
        className={styles.hero}
        style={
          menu.bannerArquivoId
            ? {
                backgroundImage: `linear-gradient(90deg,rgba(24,12,8,.82),rgba(24,12,8,.35)),url(${imageUrl(menu.bannerArquivoId)})`,
              }
            : undefined
        }
      >
        <div className={styles.heroTop}>
          {menu.logoArquivoId ? (
            <img
              className={styles.logo}
              src={imageUrl(menu.logoArquivoId)}
              alt={`Logo ${menu.nome}`}
            />
          ) : (
            <div className={styles.logoFallback}>
              {menu.nome.slice(0, 2).toUpperCase()}
            </div>
          )}
          <Link href="/meus-pedidos" className={styles.historyLink}>
            Meus pedidos
          </Link>
        </div>
      </header>
      <section className={styles.storeHeader}>
        <div className={styles.storeTitle}>
          <div>
            <h1>{menu.nome}</h1>
            <p>
              {menu.descricao || "Faça seu pedido de forma rápida e segura."}
            </p>
          </div>
          <button
            className={`${styles.openStatus} ${!menu.aberta ? styles.closed : ""}`}
            onClick={() => setHoursOpen(true)}
          >
            <span />
            {menu.aberta ? "Aberto agora" : "Fechado agora"}
            <b>Ver horários ›</b>
          </button>
        </div>
        <div className={styles.storeMeta}>
          {menu.endereco && (
            <button onClick={() => setHoursOpen(true)}>
              ⌖ {menu.endereco}
            </button>
          )}
          {menu.telefone && <span>Telefone: {menu.telefone}</span>}
          {menu.tempoEntregaMin != null && (
            <span>
              ⏱ {menu.tempoEntregaMin}
              {menu.tempoEntregaMax ? `–${menu.tempoEntregaMax}` : ""} min
            </span>
          )}
          {(menu.pedidoMinimo ?? 0) > 0 && (
            <span>Pedido mínimo {money.format(menu.pedidoMinimo!)}</span>
          )}
          {menu.freteGratisAcima != null && (
            <span>Frete grátis acima de {money.format(menu.freteGratisAcima)}</span>
          )}
          {menu.aceitaEntrega && <span>Entrega disponível</span>}
          {menu.aceitaRetirada && <span>Retirada disponível</span>}
        </div>
      </section>
      {!menu.aberta && (
        <div className={styles.closedNotice}>
          <div>
            <strong>Estamos fechados agora</strong>
            <span>
              Você pode montar o pedido e agendar para o próximo horário
              disponível.
            </span>
          </div>
          <button onClick={() => setHoursOpen(true)}>Consultar horários</button>
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.searchWrap}>
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar em ${menu.nome}`}
          />
        </div>
        <nav className={styles.categories}>
          <button
            className={category === "all" ? styles.active : ""}
            onClick={() => setCategory("all")}
          >
            Todos
          </button>
          {menu.categorias.map((item) => (
            <button
              key={item.id}
              className={category === item.id ? styles.active : ""}
              onClick={() => setCategory(item.id)}
            >
              {item.nome}
            </button>
          ))}
        </nav>
        {categories.map((item) => (
          <section className={styles.categorySection} key={item.id}>
            <header>
              <div>
                <h2>{item.nome}</h2>
                {item.descricao && <p>{item.descricao}</p>}
              </div>
              <span>
                {item.produtos.length}{" "}
                {item.produtos.length === 1 ? "item" : "itens"}
              </span>
            </header>
            <div className={styles.productGrid}>
              {item.produtos.map((product) => (
                <button
                  className={`${styles.productCard} ${!product.disponivel ? styles.unavailable : ""}`}
                  data-product-id={product.id}
                  key={product.id}
                  onClick={() => openProduct(product)}
                >
                  <div className={styles.productInfo}>
                    <div>
                      {product.tagPromocao && (
                        <span className={styles.promo}>
                          {product.tagPromocao}
                        </span>
                      )}
                      <h3>{product.nome}</h3>
                      <p>
                        {product.descricao ||
                          "Confira os detalhes deste produto."}
                      </p>
                    </div>
                    <div>
                      {product.precoPromocional ? (
                        <>
                          <del>{money.format(product.preco)}</del>
                          <strong>
                            {money.format(product.precoPromocional)}
                          </strong>
                        </>
                      ) : (
                        <strong>{money.format(product.preco)}</strong>
                      )}
                      {!product.disponivel && (
                        <span className={styles.soldOut}>Indisponível</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.productImage}>
                    {product.imagemArquivoId ? (
                      <img
                        src={imageUrl(product.imagemArquivoId)}
                        alt={product.nome}
                      />
                    ) : (
                      <span>🍴</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
        {!categories.length && (
          <div className={styles.empty}>
            Nenhum produto encontrado para sua busca.
          </div>
        )}
      </div>
      {!!cart.length && (
        <button className={styles.cartBar} onClick={() => setCheckout(true)}>
          <span className={styles.cartCount}>
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
          <span>Ver pedido</span>
          <strong>{money.format(subtotal)}</strong>
        </button>
      )}
      {selection && (
        <div className={styles.overlay} onMouseDown={() => setSelection(null)}>
          <section
            className={styles.productModal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className={styles.close} onClick={() => setSelection(null)}>
              ×
            </button>
            <div className={styles.modalProductHeader}>
              {selection.product.imagemArquivoId && (
                <img
                  src={imageUrl(selection.product.imagemArquivoId)}
                  alt={selection.product.nome}
                />
              )}
              <div>
                <h2>{selection.product.nome}</h2>
                <p>{selection.product.descricao}</p>
                <strong>{money.format(unitPrice(selection))}</strong>
              </div>
            </div>
            {selection.product.variacoes.length > 0 && (
              <fieldset>
                <legend>
                  <strong>Escolha o tamanho</strong>
                  <small>Obrigatório</small>
                </legend>
                {selection.product.variacoes.map((value) => (
                  <label key={value.id}>
                    <input
                      type="radio"
                      checked={selection.variationId === value.id}
                      onChange={() =>
                        setSelection({ ...selection, variationId: value.id })
                      }
                    />
                    <span>{value.nome}</span>
                    <b>{money.format(value.preco)}</b>
                  </label>
                ))}
              </fieldset>
            )}
            {selection.product.grupos.map((group) => (
              <fieldset key={group.id}>
                <legend>
                  <strong>{group.nome}</strong>
                  <small>
                    {group.minimo
                      ? `Escolha de ${group.minimo} a ${group.maximo}`
                      : `Escolha até ${group.maximo}`}
                  </small>
                </legend>
                {group.itens.map((addon) => (
                  <label key={addon.id}>
                    <input
                      type="checkbox"
                      checked={!!selection.addons[addon.id]}
                      onChange={() => toggle(group, addon)}
                    />
                    <span>{addon.nome}</span>
                    <b>+ {money.format(addon.preco)}</b>
                  </label>
                ))}
              </fieldset>
            ))}
            <label className={styles.note}>
              Alguma observação?
              <textarea
                value={selection.observation}
                onChange={(event) =>
                  setSelection({
                    ...selection,
                    observation: event.target.value,
                  })
                }
                placeholder="Ex.: retirar cebola, molho separado..."
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <footer>
              <div className={styles.stepper}>
                <button
                  onClick={() =>
                    setSelection({
                      ...selection,
                      quantity: Math.max(1, selection.quantity - 1),
                    })
                  }
                >
                  −
                </button>
                <span>{selection.quantity}</span>
                <button
                  onClick={() =>
                    setSelection({
                      ...selection,
                      quantity: selection.quantity + 1,
                    })
                  }
                >
                  ＋
                </button>
              </div>
              <button className={styles.primaryAction} onClick={add}>
                Adicionar ·{" "}
                {money.format(unitPrice(selection) * selection.quantity)}
              </button>
            </footer>
          </section>
        </div>
      )}
      {checkout && (
        <div className={styles.overlay}>
          <form className={styles.checkout} onSubmit={submit}>
            <header>
              <div>
                <small>Seu pedido em</small>
                <h2>{menu.nome}</h2>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={() => setCheckout(false)}
              >
                ×
              </button>
            </header>
            <div className={styles.checkoutLayout}>
              <section className={styles.checkoutForm}>
                <div className={styles.formSection}>
                  <h3>1. Como você quer receber?</h3>
                  <div className={styles.optionCards}>
                    {menu.aceitaEntrega && (
                      <label
                        className={mode === "ENTREGA" ? styles.selected : ""}
                      >
                        <input
                          type="radio"
                          checked={mode === "ENTREGA"}
                          onChange={() => setMode("ENTREGA")}
                        />
                        <span>
                          <b>Entrega</b>
                          <small>Receba no seu endereço</small>
                        </span>
                      </label>
                    )}
                    {menu.aceitaRetirada && (
                      <label
                        className={mode === "RETIRADA" ? styles.selected : ""}
                      >
                        <input
                          type="radio"
                          checked={mode === "RETIRADA"}
                          onChange={() => setMode("RETIRADA")}
                        />
                        <span>
                          <b>Retirada</b>
                          <small>Busque no estabelecimento</small>
                        </span>
                      </label>
                    )}
                  </div>
                </div>
                {!menu.aberta && (
                  <div className={styles.formSection}>
                    <h3>2. Escolha o horário</h3>
                    <label className={styles.field}>
                      Horário disponível
                      <select name="schedule" required>
                        <option value="">Selecione um horário</option>
                        {availableSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                      <small>
                        Mostramos apenas horários dentro do funcionamento.
                      </small>
                    </label>
                  </div>
                )}
                <div className={styles.formSection}>
                  <h3>{menu.aberta ? "2" : "3"}. Seus dados</h3>
                  <div className={styles.twoColumns}>
                    <label className={styles.field}>
                      Nome completo
                      <input
                        name="name"
                        required
                        placeholder="Como podemos chamar você?"
                      />
                    </label>
                    <label className={styles.field}>
                      WhatsApp
                      <input
                        name="phone"
                        required
                        inputMode="tel"
                        placeholder="(00) 00000-0000"
                      />
                    </label>
                  </div>
                </div>
                {mode === "ENTREGA" && (
                  <div className={styles.formSection}>
                    <h3>{menu.aberta ? "3" : "4"}. Endereço de entrega</h3>
                    {menu.tipoTaxaEntrega === "TAXA_POR_BAIRRO" && (
                      <label className={styles.field}>
                        Região de entrega e taxa
                        <select
                          required
                          value={neighborhoodId}
                          onChange={(event) =>
                            setNeighborhoodId(event.target.value)
                          }
                        >
                          <option value="">Selecione a região atendida</option>
                          {menu.bairros.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nome} · {money.format(item.taxa)}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <div className={styles.addressGrid}>
                      <label className={styles.field}>
                        CEP
                        <div className={styles.cepInput}>
                          <input
                            name="cep"
                            inputMode="numeric"
                            maxLength={9}
                            placeholder="00000-000"
                            onBlur={(event) => lookupCep(event.target.value)}
                          />
                          {cepLoading && (
                            <span className={styles.miniSpinner} />
                          )}
                        </div>
                      </label>
                      <label className={`${styles.field} ${styles.street}`}>
                        Rua
                        <input
                          name="street"
                          required
                          value={address.street}
                          onChange={(event) =>
                            setAddress({
                              ...address,
                              street: event.target.value,
                            })
                          }
                          placeholder="Nome da rua"
                        />
                      </label>
                      <label className={styles.field}>
                        Número
                        <input name="number" required placeholder="Ex.: 123" />
                      </label>
                      <label className={styles.field}>
                        Bairro do endereço
                        <input
                          name="neighborhood"
                          required
                          value={address.neighborhood}
                          onChange={(event) =>
                            setAddress({
                              ...address,
                              neighborhood: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        Cidade
                        <input value={address.city} readOnly />
                      </label>
                      <label className={styles.field}>
                        UF
                        <input value={address.state} readOnly />
                      </label>
                      <label className={styles.field}>
                        Complemento <small>Opcional</small>
                        <input name="complement" placeholder="Apto, bloco..." />
                      </label>
                      <label className={styles.field}>
                        Referência <small>Opcional</small>
                        <input name="reference" placeholder="Próximo a..." />
                      </label>
                    </div>
                  </div>
                )}
                <div className={styles.formSection}>
                  <h3>
                    {menu.aberta
                      ? mode === "ENTREGA"
                        ? "4"
                        : "3"
                      : mode === "ENTREGA"
                        ? "5"
                        : "4"}
                    . Pagamento
                  </h3>
                  <label className={styles.field}>
                    Forma de pagamento
                    <select name="payment" required value={payment} onChange={(event) => setPayment(event.target.value)}>
                      <option value="PIX">Pix</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CREDITO">Cartão de crédito</option>
                      <option value="DEBITO">Cartão de débito</option>
                    </select>
                  </label>
                  {payment === "DINHEIRO" && <label className={styles.field}>
                    Troco para quanto? <small>Opcional</small>
                    <input name="change" type="number" min="0" step=".01" inputMode="decimal" placeholder="Ex.: 50,00" />
                  </label>}
                </div>
                {error && <p className={styles.error}>{error}</p>}
              </section>
              <aside className={styles.summary}>
                <h3>Resumo do pedido</h3>
                {cart.map((item) => (
                  <article key={item.key}>
                    <div className={styles.summaryTop}>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          onClick={() => quantity(item.key, -1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => quantity(item.key, 1)}
                        >
                          ＋
                        </button>
                      </div>
                      <div>
                        <strong>{item.product.nome}</strong>
                        <small>
                          {
                            item.product.variacoes.find(
                              (value) => value.id === item.variationId,
                            )?.nome
                          }
                        </small>
                      </div>
                      <b>{money.format(unitPrice(item) * item.quantity)}</b>
                    </div>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() =>
                        setCart((current) =>
                          current.filter((value) => value.key !== item.key),
                        )
                      }
                    >
                      Remover item
                    </button>
                  </article>
                ))}
                <label className={styles.field}>
                  Cupom de desconto <small>Opcional</small>
                  <input
                    value={coupon}
                    onChange={(event) => setCoupon(event.target.value.toUpperCase())}
                    placeholder="Ex.: PRIMEIRA10"
                  />
                </label>
                {menu.freteGratisAcima != null && !freeShipping && mode === "ENTREGA" && (
                  <small className={styles.safe}>
                    Faltam {money.format(Math.max(0, menu.freteGratisAcima - subtotal))} para frete grátis.
                  </small>
                )}
                {(menu.pedidoMinimo ?? 0) > subtotal && (
                  <p className={styles.error}>
                    Adicione mais {money.format((menu.pedidoMinimo ?? 0) - subtotal)} para atingir o pedido mínimo.
                  </p>
                )}
                <div className={styles.totals}>
                  <span>
                    Subtotal <b>{money.format(subtotal)}</b>
                  </span>
                  <span>
                    Taxa de entrega <b>{freeShipping ? "Grátis" : money.format(fee)}</b>
                  </span>
                  <strong>
                    Total <b>{money.format(subtotal + fee)}</b>
                  </strong>
                </div>
                <button
                  className={styles.finish}
                  disabled={sending || !cart.length || (menu.pedidoMinimo ?? 0) > subtotal}
                >
                  {sending ? (
                    <>
                      <span className={styles.miniSpinner} /> Registrando
                      pedido...
                    </>
                  ) : (
                    "Confirmar e ir para o WhatsApp"
                  )}
                </button>
                <small className={styles.safe}>
                  Seu pedido será registrado antes de abrir o WhatsApp.
                </small>
              </aside>
            </div>
          </form>
        </div>
      )}
      <footer className={styles.storeFooter}>
        <div className={styles.footerGrid}>
          <section className={styles.footerBrand}>
            <div>{menu.logoArquivoId ? <img src={imageUrl(menu.logoArquivoId)} alt={`Logo ${menu.nome}`} /> : <span>{menu.nome.slice(0,2).toUpperCase()}</span>}<strong>{menu.nome}</strong></div>
            <p>{menu.descricao || "Peça pelo cardápio digital de forma rápida e segura."}</p>
          </section>
          <section>
            <h2>Contato</h2>
            {menu.whatsapp && <a href={`https://wa.me/${menu.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer">WhatsApp: {menu.whatsapp}</a>}
            {menu.telefone && <a href={`tel:${menu.telefone.replace(/[^\d+]/g,"")}`}>Telefone: {menu.telefone}</a>}
            {menu.endereco && <p>{menu.endereco}</p>}
          </section>
          <section>
            <h2>Atendimento</h2>
            <button type="button" onClick={()=>setHoursOpen(true)}>Ver horários de funcionamento</button>
            <Link href="/meus-pedidos">Consultar meus pedidos</Link>
          </section>
          {Object.keys(menu.redesSociais ?? {}).length>0&&<section>
            <h2>Redes sociais</h2>
            {Object.entries(menu.redesSociais).map(([name,url])=><a href={url} target="_blank" rel="noreferrer" key={name}>{name.charAt(0)+name.slice(1).toLowerCase()}</a>)}
          </section>}
        </div>
        <div className={styles.footerBottom}><span>© {new Date().getFullYear()} {menu.nome}</span><span>Pedidos protegidos e registrados pelo Sistema Cardápio</span></div>
      </footer>
      {hoursOpen && (
        <div className={styles.overlay} onMouseDown={() => setHoursOpen(false)}>
          <section
            className={styles.hoursModal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className={styles.close}
              onClick={() => setHoursOpen(false)}
            >
              ×
            </button>
            <div className={styles.hoursCompany}>
              {menu.logoArquivoId && (
                <img src={imageUrl(menu.logoArquivoId)} alt="" />
              )}
              <div>
                <h2>{menu.nome}</h2>
                <p>{menu.endereco}</p>
              </div>
            </div>
            <h3>Horários de funcionamento</h3>
            <div className={styles.hoursList}>
              {menu.horarios.map((item) => (
                <div key={item.diaSemana}>
                  <span>{days[item.diaSemana - 1]}</span>
                  <strong>
                    {item.aberto
                      ? `${item.inicio?.slice(0, 5)} às ${item.fim?.slice(0, 5)}`
                      : "Fechado"}
                  </strong>
                </div>
              ))}
            </div>
            <div className={styles.contact}>
              {menu.telefone && <span>Telefone: {menu.telefone}</span>}
              {menu.whatsapp && <span>WhatsApp: {menu.whatsapp}</span>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
