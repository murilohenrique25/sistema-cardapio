import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { authenticatedBackendFetch, currentUser } from "@/lib/backend";
import { DeliveryNeighborhoods, type Neighborhood } from "./DeliveryNeighborhoods";
import styles from "./delivery.module.css";

export default async function DeliveryPage() {
  const user = await currentUser(); if (!user) redirect("/login"); if (user.perfil !== "ADMIN_EMPRESA") redirect("/");
  const response = await authenticatedBackendFetch("/api/bairros-entrega");
  const neighborhoods: Neighborhood[] = response?.ok ? await response.json() : [];
  return <main className={styles.layout}><AdminSidebar user={user} active="delivery" /><section className={styles.workspace}>
    <header className={styles.header}><div><p className="eyebrow">Configurações</p><h1>Bairros de entrega</h1><p>Defina os locais atendidos e o valor de entrega para cada um.</p></div></header>
    <DeliveryNeighborhoods initial={neighborhoods} />
  </section></main>;
}

