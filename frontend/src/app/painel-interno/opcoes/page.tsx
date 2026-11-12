import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { authenticatedBackendFetch, currentUser } from "@/lib/backend";
import { OptionsManager } from "./OptionsManager";
import { CouponsManager } from "./CouponsManager";
import styles from "../produtos/products.module.css";
export default async function Page() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.perfil !== "ADMIN_EMPRESA") redirect("/");
  const [p, g, pr, c] = await Promise.all([
    authenticatedBackendFetch("/api/produtos"),
    authenticatedBackendFetch("/api/grupos-complementos"),
    authenticatedBackendFetch("/api/promocoes"),
    authenticatedBackendFetch("/api/cupons"),
  ]);
  const products = p?.ok ? await p.json() : [];
  return (
    <main className={styles.layout}>
      <AdminSidebar user={user} active="options" />
      <section className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <p className="eyebrow">Cardápio</p>
            <h1>Opções, promoções e cupons</h1>
          </div>
        </header>
        <OptionsManager
          products={products}
          initialGroups={g?.ok ? await g.json() : []}
          initialPromotions={pr?.ok ? await pr.json() : []}
        />
        <CouponsManager initial={c?.ok ? await c.json() : []} />
      </section>
    </main>
  );
}
