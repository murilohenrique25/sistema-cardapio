import Link from "next/link";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

export default function LoginPage(){
  return <main className={styles.main}>
    <section className={styles.visual}>
      <div className={styles.visualGlow}/>
      <Link className={styles.brand} href="/"><span>SC</span><b>Sistema Cardápio</b></Link>
      <div className={styles.message}><span>OPERAÇÃO SEM RUÍDO</span><h1>Seu negócio<br/><em>em movimento.</em></h1><p>Cardápio, pedidos e decisões reunidos em uma experiência simples para você cuidar do que importa.</p><div className={styles.benefits}><span>✓ Pedidos em tempo real</span><span>✓ Gestão simples e visual</span><span>✓ Menos de R$ 1 por dia</span></div></div>
      <footer><span><i/> Sistema disponível</span><small>© {new Date().getFullYear()} Sistema Cardápio</small></footer>
    </section>
    <section className={styles.formSide}><Link className={styles.back} href="/">← Voltar para o site</Link><LoginForm/></section>
  </main>;
}
