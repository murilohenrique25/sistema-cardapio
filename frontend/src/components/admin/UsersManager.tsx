"use client";

import { FormEvent, useState } from "react";
import styles from "./users-manager.module.css";

export type ManagedUser = { id:string; nome:string; email:string; ativo:boolean; trocaSenhaObrigatoria:boolean };
type Notice = { type:"success"|"error"; text:string };

export function UsersManager({ initial, basePath, title="Administradores" }: { initial:ManagedUser[]; basePath:string; title?:string }) {
  const [users,setUsers] = useState(initial);
  const [dialog,setDialog] = useState<"new"|"password"|null>(null);
  const [selected,setSelected] = useState<ManagedUser|null>(null);
  const [loading,setLoading] = useState("");
  const [notice,setNotice] = useState<Notice|null>(null);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading("create");
    const data = new FormData(event.currentTarget);
    const response = await fetch(basePath,{ method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nome:data.get("nome"),email:data.get("email"),senhaTemporaria:data.get("senha")}) });
    setLoading("");
    if (!response.ok) { const body=await response.json().catch(()=>null); setNotice({type:"error",text:body?.message??"Não foi possível adicionar o administrador."}); return; }
    const created = await response.json(); setUsers(current=>[...current,created]); setDialog(null); setNotice({type:"success",text:"Administrador criado. Ele deverá trocar a senha no primeiro acesso."});
  }

  async function reset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(!selected)return; setLoading("password");
    const data=new FormData(event.currentTarget);
    const response=await fetch(`${basePath}/${selected.id}/senha`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({novaSenha:data.get("senha")})});
    setLoading("");
    if(!response.ok){const body=await response.json().catch(()=>null);setNotice({type:"error",text:body?.message??"Não foi possível redefinir a senha."});return}
    const updated=await response.json();setUsers(current=>current.map(user=>user.id===updated.id?updated:user));setDialog(null);setNotice({type:"success",text:"Senha temporária definida. A troca será exigida no próximo login."});
  }

  async function toggle(user:ManagedUser){setLoading(user.id);const response=await fetch(`${basePath}/${user.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({nome:user.nome,ativo:!user.ativo})});setLoading("");if(response.ok){const updated=await response.json();setUsers(current=>current.map(item=>item.id===updated.id?updated:item))}else setNotice({type:"error",text:"Não foi possível alterar o acesso."})}

  return <section className={styles.wrapper}>
    <header><div><p className="eyebrow">Acessos</p><h1>{title}</h1><p>Gerencie quem pode acessar e configurar este estabelecimento.</p></div><button className="button" onClick={()=>{setDialog("new");setNotice(null)}}><span>＋</span> Novo administrador</button></header>
    {notice&&<div className={`${styles.notice} ${styles[notice.type]}`}>{notice.text}</div>}
    <div className={styles.table}>{users.map(user=><article key={user.id}><div className={styles.avatar}>{user.nome.slice(0,2).toUpperCase()}</div><div><strong>{user.nome}</strong><span>{user.email}</span></div><div className={styles.badges}><span className={user.ativo?styles.enabled:styles.disabled}>{user.ativo?"Ativo":"Inativo"}</span>{user.trocaSenhaObrigatoria&&<span className={styles.pending}>Troca de senha pendente</span>}</div><div className={styles.actions}><button className="buttonSecondary" onClick={()=>{setSelected(user);setDialog("password")}}>Redefinir senha</button><button className="buttonGhost" disabled={loading===user.id} onClick={()=>toggle(user)}>{loading===user.id?"Salvando...":user.ativo?"Desativar":"Ativar"}</button></div></article>)}</div>
    {dialog&&<div className={styles.overlay} onMouseDown={event=>event.target===event.currentTarget&&setDialog(null)}><form className={styles.dialog} onSubmit={dialog==="new"?create:reset}><header><div><p className="eyebrow">{dialog==="new"?"Novo acesso":"Segurança"}</p><h2>{dialog==="new"?"Adicionar administrador":`Redefinir senha de ${selected?.nome}`}</h2></div><button type="button" className={styles.close} onClick={()=>setDialog(null)}>×</button></header>{dialog==="new"&&<><label>Nome completo<input name="nome" required placeholder="Ex.: Maria Oliveira"/></label><label>E-mail de acesso<input name="email" type="email" required placeholder="maria@empresa.com"/></label></>}<label>Senha temporária<input name="senha" type="password" required minLength={10} placeholder="Mínimo de 10 caracteres"/><small>O administrador criará uma nova senha no primeiro acesso.</small></label><footer><button type="button" className="buttonSecondary" onClick={()=>setDialog(null)}>Cancelar</button><button className="button" disabled={!!loading}>{loading?"Salvando...":"Confirmar"}</button></footer></form></div>}
  </section>;
}
