import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { authenticatedBackendFetch, currentUser } from "@/lib/backend";
import styles from "./admin.module.css";
import { AnalyticsPanel } from "./AnalyticsPanel";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const [dashboardResponse,analyticsResponse,ordersResponse] = user.perfil === "ADMIN_EMPRESA" ? await Promise.all([authenticatedBackendFetch("/api/dashboard"),authenticatedBackendFetch("/api/analytics"),authenticatedBackendFetch("/api/pedidos")]) : [null,null,null];
  const dashboard = dashboardResponse?.ok ? await dashboardResponse.json() : { pedidosHoje: 0, produtosAtivos: 0, categorias: 0, promocoesAtivas: 0 };
  const analytics = analyticsResponse?.ok ? await analyticsResponse.json() : {funil:[],produtos:[],vendas:{pedidos:0,faturamento:0,ticket_medio:0}};
  const recentOrders = ordersResponse?.ok ? (await ordersResponse.json() as {id:string;numero:number;clienteNome:string;modalidade:string;status:string;total:number;criadoEm:string}[]).slice(0,5) : [];
  const statusLabel:Record<string,string>={AGUARDANDO_CONTATO:"Recebido",CONFIRMADO:"Confirmado",EM_PREPARO:"Em preparo",PRONTO:"Pronto",FINALIZADO:"Finalizado",CANCELADO:"Cancelado"};
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const metrics = [["Pedidos hoje", dashboard.pedidosHoje, "Recebidos desde meia-noite"],["Produtos ativos", dashboard.produtosAtivos, "Disponíveis no catálogo"],["Categorias", dashboard.categorias, "Organização do cardápio"],["Promoções", dashboard.promocoesAtivas, "Ativas neste momento"]];
  return (
    <main className={styles.layout}>
      <AdminSidebar user={user} active="dashboard" />
      <section className={styles.workspace}>
        <header className={styles.header}>
          <div><p className="eyebrow">Painel administrativo</p><h1>Olá, {user.nome.split(" ")[0]}</h1></div>
          {user.perfil === "SUPER_ADMIN" ? <Link className="button" href="/empresas">Gerenciar empresas</Link> : <button className="button">Novo produto</button>}
        </header>
        <div className={styles.metrics}>
          {metrics.map(([label, value, detail]) => (
            <article key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
          ))}
        </div>
        {user.perfil === "ADMIN_EMPRESA" && <AnalyticsPanel data={analytics}/>}<section className={styles.panel}>
          <div><p className="eyebrow">Operação</p><h2>Pedidos recentes</h2></div>
          {recentOrders.length?<div className={styles.recentOrders}>{recentOrders.map(order=><Link href="/pedidos" key={order.id}><span><b>#{String(order.numero).padStart(6,"0")}</b><strong>{order.clienteNome}</strong><small>{order.modalidade==="ENTREGA"?"Entrega":"Retirada"} · {new Date(order.criadoEm).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</small></span><span><em>{statusLabel[order.status]??order.status}</em><b>{money.format(order.total)}</b></span></Link>)}</div>:<div className={styles.empty}>
            <strong>Nenhum pedido recebido.</strong>
            <span>Os novos pedidos aparecerão aqui em tempo real.</span>
          </div>}
        </section>
      </section>
    </main>
  );
}
