import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { authenticatedBackendFetch, currentUser } from "@/lib/backend";
import { CompanySettingsForm, type CompanySettings } from "./CompanySettingsForm";
import styles from "./settings.module.css";
import { MenuQrCode } from "./MenuQrCode";

export default async function CompanySettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.perfil !== "ADMIN_EMPRESA") redirect("/");
  const response = await authenticatedBackendFetch("/api/minha-empresa");
  if (!response?.ok) redirect("/");
  const company: CompanySettings = await response.json();

  return <main className={styles.layout}>
    <AdminSidebar user={user} active="settings" />
    <section className={styles.workspace}>
      <header className={styles.header}><p className="eyebrow">Configurações</p><h1>Minha empresa</h1><p>Personalize as informações e a experiência do cardápio.</p></header>
      <CompanySettingsForm company={company} />
      <MenuQrCode slug={company.slug} logoId={company.logoArquivoId} />
    </section>
  </main>;
}
