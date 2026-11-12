"use client";

import { useState } from "react";
import styles from "./hours.module.css";

type Hours = { diaSemana:number; aberto:boolean; horaInicial:string|null; horaFinal:string|null };
type Feedback = { type:"success"|"error"; text:string } | null;
const names = ["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado","Domingo"];

export function HoursForm({initial}:{initial:Hours[]}){
  const [items,setItems] = useState(initial);
  const [feedback,setFeedback] = useState<Feedback>(null);
  const [saving,setSaving] = useState(false);

  function update(day:number,field:keyof Hours,value:string|boolean){
    setFeedback(null);
    setItems(current=>current.map(item=>item.diaSemana===day?{...item,[field]:value}:item));
  }

  function toggle(day:number,open:boolean){
    setFeedback(null);
    setItems(current=>current.map(item=>item.diaSemana===day?{
      ...item,
      aberto:open,
      horaInicial:open?(item.horaInicial??"18:00"):null,
      horaFinal:open?(item.horaFinal??"23:00"):null,
    }:item));
  }

  async function save(){
    const invalid=items.find(item=>item.aberto&&(!item.horaInicial||!item.horaFinal||item.horaInicial===item.horaFinal));
    if(invalid){setFeedback({type:"error",text:`Revise ${names[invalid.diaSemana]}: abertura e fechamento precisam ser diferentes.`});return}
    setSaving(true);setFeedback(null);
    const response=await fetch("/api/horarios",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(items)});
    setSaving(false);
    if(!response.ok){
      const error=await response.json().catch(()=>null) as {message?:string}|null;
      setFeedback({type:"error",text:error?.message??"Não foi possível salvar os horários."});return;
    }
    setItems(await response.json());
    setFeedback({type:"success",text:"Horários atualizados com sucesso."});
  }

  return <section className={styles.card}>
    <div className={styles.tableHeader}><span>Dia</span><span>Status</span><span>Abre às</span><span>Fecha às</span></div>
    {items.map((item,index)=><div className={`${styles.row} ${!item.aberto?styles.closed:""}`} key={item.diaSemana}>
      <strong>{names[index]}</strong>
      <label className={styles.toggle}><input type="checkbox" checked={item.aberto} onChange={event=>toggle(item.diaSemana,event.target.checked)}/><span aria-hidden/><b>{item.aberto?"Aberto":"Fechado"}</b></label>
      <label className={styles.timeField}><span>Abre às</span><input aria-label={`Início ${names[index]}`} type="time" disabled={!item.aberto} value={item.horaInicial??""} onChange={event=>update(item.diaSemana,"horaInicial",event.target.value)}/></label>
      <label className={styles.timeField}><span>Fecha às</span><input aria-label={`Fim ${names[index]}`} type="time" disabled={!item.aberto} value={item.horaFinal??""} onChange={event=>update(item.diaSemana,"horaFinal",event.target.value)}/></label>
    </div>)}
    <footer className={styles.footer}>{feedback&&<span role="status" className={`${styles.message} ${feedback.type==="error"?styles.error:styles.success}`}>{feedback.type==="success"?"✓":"!"} {feedback.text}</span>}<button className="button" onClick={save} disabled={saving}>{saving?"Salvando horários...":"Salvar horários"}</button></footer>
  </section>;
}
