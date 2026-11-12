import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { authenticatedBackendFetch, currentUser } from "@/lib/backend";
import { CompanyForm } from "./CompanyForm";
import styles from "./companies.module.css";

type Company = { id: string; slug: string; nomeFantasia: string; ativa: boolean };

export default async function CompaniesPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.perfil !== "SUPER_ADMIN") redirect("/");

  const response = await authenticatedBackendFetch("/api/admin/empresas");
  const companies: Company[] = response?.ok ? await response.json() : [];

  return (
    <main className={styles.layout}>
      <AdminSidebar user={user} active="companies" />
      <section className={styles.workspace}>
        <header className={styles.header}>
          <div><p className="eyebrow">Plataforma</p><h1>Empresas</h1><p>Gerencie os estabelecimentos e seus acessos iniciais.</p></div>
          <CompanyForm />
        </header>
        <div className={styles.tableWrap}>
          {companies.length === 0 ? <div className={styles.empty}>Nenhuma empresa cadastrada ainda.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Empresa</th><th>Endereço público</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>{companies.map((company) => (
                <tr key={company.id}><td><strong>{company.nomeFantasia}</strong></td><td className={styles.slug}>/{company.slug}</td><td><span className={styles.status}>{company.ativa ? "Ativa" : "Inativa"}</span></td><td><Link className="buttonSecondary" href={`/empresas/${company.id}/usuarios`}>Administradores</Link></td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
