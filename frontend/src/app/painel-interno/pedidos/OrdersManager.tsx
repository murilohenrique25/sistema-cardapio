"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./orders.module.css";

type Order = { id: string; numero: number; clienteNome: string; clienteTelefone: string; modalidade: string; status: string; pagamento: string; total: number; criadoEm: string; agendadoPara?: string };
type Detail = { pedido: Order; endereco: { cep?:string; rua?: string; numero?: string; complemento?: string; bairro?: string; referencia?: string; taxaEntrega: number; subtotal: number }; itens: { id: string; produtoNome: string; variacaoNome?: string; quantidade: number; subtotal: number; observacao?: string; complementos: { nome: string; quantidade: number }[] }[]; historico: { novoStatus: string; criadoEm: string }[] };
const columns = ["AGUARDANDO_CONTATO", "CONFIRMADO", "EM_PREPARO", "PRONTO", "FINALIZADO"];
const labels: Record<string, string> = { AGUARDANDO_CONTATO: "Recebidos", CONFIRMADO: "Confirmados", EM_PREPARO: "Em preparo", PRONTO: "Prontos", FINALIZADO: "Finalizados", CANCELADO: "Cancelados" };
const paymentLabels:Record<string,string>={PIX:"Pix",DINHEIRO:"Dinheiro",CREDITO:"Cartão de crédito",DEBITO:"Cartão de débito"};
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function requireLogin(response: Response) { if (response.status !== 401) return false; window.location.assign("/login?motivo=sessao-expirada"); return true }

export function OrdersManager({ initial }: { initial: Order[] }) {
  const [items, setItems] = useState(initial);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [sound, setSound] = useState(false);
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const known = useRef(new Set(initial.map(item => item.id)));

  const beep = useCallback(() => {
    if (!audio.current) return;
    const context = audio.current;
    const gain = context.createGain();
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.18, context.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .65);
    gain.connect(context.destination);
    [0, .18].forEach((delay) => { const oscillator = context.createOscillator(); oscillator.type = "sine"; oscillator.frequency.value = delay ? 880 : 660; oscillator.connect(gain); oscillator.start(context.currentTime + delay); oscillator.stop(context.currentTime + delay + .22) });
    if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); const message = new SpeechSynthesisUtterance("Pedido noooovo!"); message.lang = "pt-BR"; message.volume = 1; message.rate = .82; message.pitch = 1.08; const voice = window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith("pt-br")) ?? window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith("pt")); if (voice) message.voice = voice; window.speechSynthesis.speak(message) }
  }, []);

  const refresh = useCallback(async (announce = false) => {
    const response = await fetch("/api/pedidos", { cache: "no-store" });
    if (requireLogin(response)) return;
    if (!response.ok) { const body = await response.json().catch(() => null) as { message?: string } | null; setError(body?.message ?? "Não foi possível atualizar os pedidos."); return }
    const next: Order[] = await response.json();
    const newOrders = next.filter(item => !known.current.has(item.id));
    next.forEach(item => known.current.add(item.id));
    setItems(next); setError("");
    if (announce && newOrders.length) {
      setNotice(newOrders.length === 1 ? `Novo pedido #${String(newOrders[0].numero).padStart(6, "0")}` : `${newOrders.length} novos pedidos recebidos`);
      document.title = "🔔 Novo pedido — Sistema Cardápio";
      navigator.vibrate?.([180, 80, 180]);
      beep();
      window.setTimeout(() => setNotice(""), 6000);
    }
  }, [beep]);

  useEffect(() => {
    const source = new EventSource("/api/pedidos/eventos");
    source.addEventListener("conectado", () => setConnected(true));
    source.addEventListener("novo-pedido", () => window.setTimeout(() => refresh(true), 450));
    source.addEventListener("status-alterado", () => window.setTimeout(() => refresh(), 250));
    source.onerror = () => setConnected(false);
    const polling = window.setInterval(() => refresh(true), 12000);
    return () => { source.close(); window.clearInterval(polling) };
  }, [refresh]);

  useEffect(() => {
    if (localStorage.getItem("order-sound") !== "on") return;
    async function restore() {
      if (!audio.current) audio.current = new AudioContext();
      await audio.current.resume().catch(() => undefined);
      if (audio.current.state === "running") setSound(true);
    }
    void restore();
    const resume = () => void restore();
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => { window.removeEventListener("pointerdown", resume); window.removeEventListener("keydown", resume) };
  }, []);

  async function enableSound() {
    if (!audio.current) audio.current = new AudioContext();
    await audio.current.resume(); setSound(true); localStorage.setItem("order-sound", "on"); beep();
  }
  async function change(order: Order, status: string) { setLoading(order.id); const response = await fetch(`/api/pedidos/${order.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); setLoading(""); if (requireLogin(response)) return; if (response.ok) { const updated = await response.json(); setItems(current => current.map(item => item.id === order.id ? updated : item)); setDetail(null); setError("") } else { const body = await response.json().catch(() => null) as { message?: string } | null; setError(body?.message ?? "Não foi possível alterar o status.") } }
  async function drop(status: string) {
    const order = items.find(item => item.id === dragging);
    setDragging(null); setDropTarget(null);
    if (order && order.status !== status) await change(order, status);
  }
  async function open(id: string) { setLoading(`detail-${id}`); const response = await fetch(`/api/pedidos/${id}`, { cache: "no-store" }); setLoading(""); if (requireLogin(response)) return; if (response.ok) setDetail(await response.json()); else setError("Não foi possível carregar o pedido.") }

  return <section>
    <div className={styles.live}><span className={connected ? styles.online : styles.offline} /><span>{connected ? "Atualização em tempo real ativa" : "Reconectando atualização em tempo real..."}</span>{sound ? <span className={styles.soundActive}>🔔 Som ativo</span> : <button className={styles.soundButton} onClick={enableSound}>🔔 Ativar som</button>}<button onClick={() => refresh()}>Atualizar agora</button></div>
    {notice && <div className={styles.newOrderNotice} role="alert"><span>🔔</span><div><strong>{notice}</strong><small>O pedido já está na coluna Recebidos.</small></div><button onClick={() => setNotice("")}>×</button></div>}
    {error && <p className={styles.alert}>{error}</p>}
    <p className={styles.dragHint}>Arraste um pedido para outra coluna para alterar o status.</p>
    <div className={styles.kanban}>{columns.map(status => <section className={`${styles.column} ${dropTarget === status ? styles.dropTarget : ""}`} key={status} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropTarget(status) }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropTarget(null) }} onDrop={event => { event.preventDefault(); void drop(status) }}><header><h2>{labels[status]}</h2><span>{items.filter(item => item.status === status).length}</span></header><div>{items.filter(item => item.status === status).map(order => <article className={`${styles.ticket} ${dragging === order.id ? styles.dragging : ""}`} draggable={loading !== order.id} key={order.id} title="Arraste para mudar o status ou clique para ver os detalhes" onDragStart={event => { setDragging(order.id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", order.id) }} onDragEnd={() => { setDragging(null); setDropTarget(null) }} onClick={() => { if (!dragging) void open(order.id) }}><small>#{String(order.numero).padStart(6, "0")} · {new Date(order.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</small><h3>{order.clienteNome}</h3><p>{order.modalidade === "ENTREGA" ? "Entrega" : "Retirada"} · {order.pagamento}</p>{order.agendadoPara && <b>Agendado: {new Date(order.agendadoPara).toLocaleString("pt-BR")}</b>}<strong>{money.format(order.total)}</strong><label className={styles.statusField}>Status<select value={order.status} disabled={loading === order.id} onClick={event => event.stopPropagation()} onChange={event => change(order, event.target.value)}>{[...columns, "CANCELADO"].map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>{loading === `detail-${order.id}` && <span>Carregando...</span>}</article>)}</div></section>)}</div>
    {detail && <div className={styles.overlay} onMouseDown={() => setDetail(null)}><section className={`${styles.dialog} ${styles.receipt}`} onMouseDown={event => event.stopPropagation()}><button aria-label="Fechar" className={styles.close} onClick={() => setDetail(null)}>×</button><header className={styles.receiptHeader}><div><p className="eyebrow">Comprovante do pedido</p><h2>Pedido #{String(detail.pedido.numero).padStart(6,"0")}</h2><small>{new Date(detail.pedido.criadoEm).toLocaleString("pt-BR")}</small></div><b>{labels[detail.pedido.status]??detail.pedido.status}</b></header><section className={styles.customer}><div><small>Cliente</small><strong>{detail.pedido.clienteNome}</strong><span>{detail.pedido.clienteTelefone}</span></div><div><small>Atendimento</small><strong>{detail.pedido.modalidade==="ENTREGA"?"Entrega":"Retirada"}</strong><span>{paymentLabels[detail.pedido.pagamento]??detail.pedido.pagamento}</span></div></section>{detail.pedido.agendadoPara&&<div className={styles.scheduleBox}>Agendado para <strong>{new Date(detail.pedido.agendadoPara).toLocaleString("pt-BR")}</strong></div>}{detail.pedido.modalidade==="ENTREGA"&&<div className={styles.address}><small>Endereço de entrega</small><strong>{detail.endereco.rua}, {detail.endereco.numero}</strong><span>{detail.endereco.bairro}{detail.endereco.cep&&` · CEP ${detail.endereco.cep}`}</span>{detail.endereco.complemento&&<span>Complemento: {detail.endereco.complemento}</span>}{detail.endereco.referencia&&<span>Referência: {detail.endereco.referencia}</span>}</div>}<div className={styles.sectionTitle}><h3>Itens do pedido</h3><span>{detail.itens.reduce((sum,item)=>sum+item.quantidade,0)} itens</span></div>{detail.itens.map(item=><div className={styles.item} key={item.id}><div><strong>{item.quantidade}× {item.produtoNome}</strong>{item.variacaoNome&&<span>{item.variacaoNome}</span>}{item.complementos.map((complement,index)=><span key={index}>+ {complement.quantidade}× {complement.nome}</span>)}{item.observacao&&<em>Observação: {item.observacao}</em>}</div><b>{money.format(item.subtotal)}</b></div>)}<div className={styles.total}><span>Subtotal <b>{money.format(detail.endereco.subtotal)}</b></span><span>Taxa de entrega <b>{money.format(detail.endereco.taxaEntrega)}</b></span><strong>Total <b>{money.format(detail.pedido.total)}</b></strong></div><details className={styles.historyDetails}><summary>Histórico do pedido</summary>{detail.historico.map((history,index)=><p className={styles.history} key={index}>{new Date(history.criadoEm).toLocaleString("pt-BR")} · {labels[history.novoStatus]??history.novoStatus}</p>)}</details></section></div>}
  </section>;
}
