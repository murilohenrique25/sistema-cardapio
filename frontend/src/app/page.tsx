import Link from "next/link";
import styles from "./landing.module.css";

const features=[
  ["01","Cardápio com a sua cara","Cores, capa, logo, fotos e categorias em uma experiência rápida no celular."],
  ["02","Pedido sem confusão","Carrinho, entrega, retirada, cupons, adicionais e pagamento reunidos em um checkout simples."],
  ["03","Operação em tempo real","Kanban de pedidos, alerta sonoro persistente e status por arrastar e soltar."],
  ["04","Decisões com dados","Visualizações, produtos mais procurados, ticket médio e vendas dos últimos 30 dias."],
];

export default function HomePage(){
  return <main className={styles.page}>
    <nav className={styles.nav}><Link className={styles.brand} href="/"><span>SC</span><b>Sistema Cardápio</b></Link><div><a href="#recursos">Recursos</a><a href="#preco">Preço</a><Link className={styles.login} href="/login">Entrar</Link><Link className={styles.navCta} href="/login">Começar agora</Link></div></nav>

    <section className={styles.hero}>
      <div className={styles.heroCopy}><span className={styles.pill}><i/> Seu negócio aberto para pedidos</span><h1>Seu cardápio vende.<br/><em>Você só acompanha.</em></h1><p>Receba pedidos organizados, personalize sua vitrine e cuide de toda a operação em um painel que qualquer pessoa aprende a usar.</p><div className={styles.actions}><Link href="/login">Criar meu cardápio <span>→</span></Link><a href="#produto">Ver como funciona</a></div><div className={styles.proof}><div className={styles.avatars}><span>JM</span><span>AC</span><span>+</span></div><p><b>Feito para quem empreende</b><small>Do primeiro pedido ao horário de pico.</small></p></div></div>
      <div className={styles.stage} id="produto"><div className={styles.glow}/><div className={styles.browser}><header><span/><span/><span/><b>seudominio.com/sua-loja</b></header><div className={styles.demo}><aside><strong>SC</strong>{["Visão geral","Pedidos","Produtos","Entrega"].map((item,index)=><span className={index===1?styles.selected:""} key={item}><i/>{item}</span>)}</aside><section><div className={styles.demoTop}><span><small>OPERAÇÃO</small><b>Pedidos</b></span><em>● Ao vivo</em></div><div className={styles.board}>{["Recebidos","Confirmados","Em preparo"].map((column,index)=><div className={styles.demoColumn} key={column}><header><b>{column}</b><span>{index===0?2:index===1?1:0}</span></header>{index<2&&<article><small>#{index?"000127":"000128"} · agora</small><b>{index?"Ana Clara":"João Martins"}</b><span>{index?"Retirada · PIX":"Entrega · Cartão"}</span><strong>{index?"R$ 32,90":"R$ 48,50"}</strong></article>}</div>)}</div></section></div></div><div className={styles.floating}><span>🔔</span><p><b>Pedido noooovo!</b><small>Você não perde nenhuma venda.</small></p></div></div>
    </section>

    <section className={styles.strip}><span>Cardápio online</span><i/> <span>Pedidos em tempo real</span><i/> <span>Entrega por bairro</span><i/> <span>Cupons e promoções</span><i/> <span>QR Code</span></section>

    <section className={styles.features} id="recursos"><header><span>TUDO EM UM SÓ LUGAR</span><h2>Menos improviso.<br/>Mais pedidos bem cuidados.</h2><p>Da vitrine digital à cozinha, cada detalhe foi pensado para tornar o dia mais leve.</p></header><div>{features.map(([number,title,text])=><article key={number}><span>{number}</span><div className={styles.featureIcon}>{number==="01"?"✦":number==="02"?"✓":number==="03"?"↗":"◫"}</div><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className={styles.flow}><div><span>DO CLIQUE À COZINHA</span><h2>Um fluxo que simplesmente funciona.</h2><p>Seu cliente escolhe. O pedido chega organizado. Sua equipe acompanha sem papel, ruído ou retrabalho.</p></div><ol><li><b>1</b><span><strong>O cliente monta o pedido</strong><small>No celular, sem instalar aplicativo.</small></span></li><li><b>2</b><span><strong>Você recebe na hora</strong><small>Com alerta sonoro e todos os detalhes.</small></span></li><li><b>3</b><span><strong>A equipe movimenta o status</strong><small>Do recebido ao pronto, visualmente.</small></span></li></ol></section>

    <section className={styles.pricing} id="preco"><div className={styles.priceCopy}><span>PREÇO SEM PEGADINHA</span><h2>Menos de R$ 1 por dia para organizar suas vendas.</h2><p>Um único plano. Todos os recursos. Sem comissão sobre os seus pedidos.</p></div><article><span className={styles.popular}>PLANO ÚNICO</span><p><sup>R$</sup><strong>29</strong><b>,90</b><small>/mês</small></p><em>Equivale a aproximadamente R$ 0,98 por dia.</em><ul><li>✓ Produtos e categorias ilimitados</li><li>✓ Pedidos e alertas em tempo real</li><li>✓ Cupons, adicionais e promoções</li><li>✓ QR Code e identidade personalizada</li><li>✓ Indicadores para acompanhar o negócio</li></ul><Link href="/login">Começar agora <span>→</span></Link><small>Cancele quando quiser.</small></article></section>

    <section className={styles.finalCta}><span>SEU PRÓXIMO PEDIDO COMEÇA AQUI</span><h2>Abra sua vitrine digital.<br/>Organize sua operação.</h2><Link href="/login">Quero meu cardápio por R$ 29,90 <span>→</span></Link></section>

    <footer className={styles.footer}><Link className={styles.brand} href="/"><span>SC</span><b>Sistema Cardápio</b></Link><p>Cardápios bonitos. Pedidos organizados. Negócios mais leves.</p><div><Link href="/login">Área do lojista</Link><a href="#recursos">Recursos</a><a href="#preco">Preço</a></div><small>© {new Date().getFullYear()} Sistema Cardápio. Todos os direitos reservados.</small></footer>
  </main>;
}
