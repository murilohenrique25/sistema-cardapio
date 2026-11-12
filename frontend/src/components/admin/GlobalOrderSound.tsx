"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./global-order-sound.module.css";

const PENDING_KEY = "pending-order-alert";
const DEFAULT_TITLE = "Sistema Cardápio";

export function GlobalOrderSound() {
  const pathname = usePathname();
  const router = useRouter();
  const audio = useRef<AudioContext | null>(null);
  const repeatTimer = useRef<number | null>(null);
  const titleTimer = useRef<number | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (pathname !== "/pedidos") return;
    localStorage.removeItem(PENDING_KEY);
    setPending(false);
    document.title = DEFAULT_TITLE;
  }, [pathname]);

  useEffect(() => {
    const host = window.location.hostname;
    const adminHost = host === "localhost" || host === "127.0.0.1" || host.startsWith("admin.");
    if (!adminHost || pathname === "/login" || pathname === "/pedidos") return;

    const soundEnabled = localStorage.getItem("order-sound") === "on";
    async function prepare() {
      if (!soundEnabled) return;
      if (!audio.current) audio.current = new AudioContext();
      await audio.current.resume().catch(() => undefined);
      if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission();
    }
    function beep() {
      const context = audio.current;
      if (!soundEnabled || !context || context.state !== "running") return;
      const gain = context.createGain();
      gain.gain.setValueAtTime(.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.2, context.currentTime + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .7);
      gain.connect(context.destination);
      [0, .2].forEach((delay) => { const tone = context.createOscillator(); tone.frequency.value = delay ? 880 : 660; tone.connect(gain); tone.start(context.currentTime + delay); tone.stop(context.currentTime + delay + .24) });
    }
    function announce() {
      if (!soundEnabled || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const message = new SpeechSynthesisUtterance("Pedido noooovo!");
      message.lang = "pt-BR"; message.volume = 1; message.rate = .82; message.pitch = 1.08;
      const voice = window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith("pt-br")) ?? window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith("pt"));
      if (voice) message.voice = voice;
      window.speechSynthesis.speak(message);
    }
    function playAlert() { beep(); announce() }
    function startPersistentAlert(showSystemNotification = false) {
      localStorage.setItem(PENDING_KEY, "on");
      setPending(true); playAlert(); navigator.vibrate?.([180, 80, 180]);
      if (repeatTimer.current === null) repeatTimer.current = window.setInterval(playAlert, 5000);
      if (titleTimer.current === null) titleTimer.current = window.setInterval(() => { document.title = document.title.startsWith("🔔") ? DEFAULT_TITLE : "🔔 NOVO PEDIDO" }, 900);
      if (showSystemNotification && "Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("Novo pedido recebido", { body: "Abra a tela de Pedidos para visualizar e desligar o alerta.", tag: "novo-pedido", requireInteraction: true });
        notification.onclick = () => { window.focus(); router.push("/pedidos"); notification.close() };
      }
    }

    void prepare();
    const resume = () => void prepare();
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    if (localStorage.getItem(PENDING_KEY) === "on") startPersistentAlert();
    const source = new EventSource("/api/pedidos/eventos");
    source.addEventListener("novo-pedido", () => startPersistentAlert(true));
    return () => {
      source.close(); window.removeEventListener("pointerdown", resume); window.removeEventListener("keydown", resume);
      if (repeatTimer.current !== null) { window.clearInterval(repeatTimer.current); repeatTimer.current = null }
      if (titleTimer.current !== null) { window.clearInterval(titleTimer.current); titleTimer.current = null }
      window.speechSynthesis?.cancel();
      document.title = DEFAULT_TITLE;
    };
  }, [pathname, router]);

  if (!pending || pathname === "/pedidos") return null;
  return <button className={styles.notice} onClick={() => router.push("/pedidos")}><span className={styles.bell}>🔔</span><span><strong>Novo pedido aguardando</strong><small>Abra Pedidos para visualizar e desligar o alerta.</small></span></button>;
}
