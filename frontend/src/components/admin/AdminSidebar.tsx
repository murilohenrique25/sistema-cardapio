import Link from "next/link";
import type { AuthenticatedUser } from "@/lib/backend";
import styles from "./admin-shell.module.css";
import { LogoutButton } from "./LogoutButton";

type Active = "dashboard"|"companies"|"settings"|"delivery"|"hours"|"categories"|"products"|"orders"|"options"|"users";
type Props = { user: AuthenticatedUser; active: Active };
type IconName = Active | "password";

const paths: Record<IconName, React.ReactNode> = {
  dashboard:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  companies:<><path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-5h6v5M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/></>,
  orders:<><path d="M6 3h12l2 4v14H4V7z"/><path d="M4 8h16M9 12h6M9 16h6"/></>,
  categories:<><path d="M4 5h7v6H4zM14 5h6v6h-6zM4 14h7v6H4zM14 14h6v6h-6z"/></>,
  products:<><path d="M5 7l7-4 7 4v10l-7 4-7-4zM5 7l7 4 7-4M12 11v10"/></>,
  options:<><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></>,
  delivery:<><path d="M3 6h12v11H3zM15 10h3l3 3v4h-6z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7-.7-2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z"/></>,
  hours:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  users:<><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7M16 5a4 4 0 010 7M18 14c2.4.8 4 3.1 4 6"/></>,
  password:<><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/></>,
};

function Icon({name}:{name:IconName}){return <span className={styles.navIcon} aria-hidden><svg viewBox="0 0 24 24">{paths[name]}</svg></span>}
function Item({name,href,label,active}:{name:IconName;href:string;label:string;active?:boolean}){return <Link className={active?styles.active:""} href={href}><Icon name={name}/><span>{label}</span></Link>}

export function AdminSidebar({user,active}:Props){
  return <aside className={styles.sidebar}>
    <div className={styles.brand}>SC</div>
    <div className={styles.identity}><strong>{user.nome}</strong><span>{user.perfil==="SUPER_ADMIN"?"Plataforma":"Administrador"}</span></div>
    <nav>
      <Item name="dashboard" href="/visao-geral" label="Visão geral" active={active==="dashboard"}/>
      {user.perfil==="SUPER_ADMIN"
        ? <Item name="companies" href="/empresas" label="Empresas" active={active==="companies"}/>
        : <><Item name="orders" href="/pedidos" label="Pedidos" active={active==="orders"}/><Item name="categories" href="/categorias" label="Categorias" active={active==="categories"}/><Item name="products" href="/produtos" label="Produtos" active={active==="products"}/><Item name="options" href="/opcoes" label="Opções, promoções e cupons" active={active==="options"}/><Item name="delivery" href="/entrega" label="Entrega" active={active==="delivery"}/><Item name="settings" href="/minha-empresa" label="Minha empresa" active={active==="settings"}/><Item name="hours" href="/horarios" label="Horários" active={active==="hours"}/><Item name="users" href="/usuarios" label="Administradores" active={active==="users"}/><Item name="password" href="/trocar-senha" label="Segurança"/></>}
    </nav>
    <div className={styles.sidebarFooter}><LogoutButton/></div>
  </aside>
}
