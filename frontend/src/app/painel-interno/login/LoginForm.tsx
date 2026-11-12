"use client";

import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export function LoginForm(){
  const router=useRouter();
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [showPassword,setShowPassword]=useState(false);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setLoading(true);setError("");
    const data=new FormData(event.currentTarget);
    const response=await fetch("/api/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:data.get("email"),senha:data.get("senha")})});
    const result=response.ok?await response.json() as {trocaSenhaObrigatoria:boolean}:null;
    setLoading(false);
    if(!response.ok){setError("E-mail ou senha inválidos. Confira os dados e tente novamente.");return}
    router.push(result?.trocaSenhaObrigatoria?"/trocar-senha":"/visao-geral");router.refresh();
  }

  return <form className={styles.form} onSubmit={submit}>
    <span className={styles.lockIcon} aria-hidden><svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/></svg></span>
    <p className={styles.kicker}>Acesso administrativo</p>
    <h2>Bom ter você<br/>de volta.</h2>
    <p className={styles.intro}>Entre para acompanhar os pedidos e manter sua operação em movimento.</p>
    {error&&<p className={styles.error} role="alert">{error}</p>}
    <label className={styles.field}><span>E-mail</span><div><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM4 7l8 6 8-6"/></svg><input name="email" type="email" autoComplete="email" placeholder="voce@empresa.com" required/></div></label>
    <label className={styles.field}><span>Senha</span><div><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg><input name="senha" type={showPassword?"text":"password"} autoComplete="current-password" placeholder="Sua senha" required/><button type="button" className={styles.eye} aria-label={showPassword?"Ocultar senha":"Mostrar senha"} onClick={()=>setShowPassword(value=>!value)}>{showPassword?"Ocultar":"Mostrar"}</button></div></label>
    <button className={styles.submit} disabled={loading}>{loading?<><i/> Entrando...</>:<>Entrar no painel <span>→</span></>}</button>
    <p className={styles.support}>Problemas para acessar? <a href="mailto:suporte@sistemacardapio.com.br">Fale com o suporte</a></p>
  </form>;
}
