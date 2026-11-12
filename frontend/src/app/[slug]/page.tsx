import { notFound } from "next/navigation";
import { Storefront, type Menu } from "./Storefront";
import { PublicAnalytics } from "./PublicAnalytics";
import { BusinessEnhancements } from "./BusinessEnhancements";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
export default async function StorePage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const response=await fetch(`${API}/api/public/cardapios/${slug}`,{next:{revalidate:30}}).catch(()=>null);if(!response?.ok)notFound();const menu:Menu=await response.json();return <><PublicAnalytics slug={slug}/><Storefront menu={menu}/><BusinessEnhancements menu={menu}/></>}
