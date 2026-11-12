"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import styles from "./settings.module.css";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
export function MenuQrCode({
  slug,
  logoId,
}: {
  slug: string;
  logoId?: string | null;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");
  const [dark, setDark] = useState("#231f1b");
  const draw = useCallback(async (size = 320) => {
    if (!canvas.current) return;
    await QRCode.toCanvas(canvas.current, url || `${location.origin}/${slug}`, {
      width: size,
      margin: 3,
      errorCorrectionLevel: "H",
      color: { dark, light: "#ffffff" },
    });
    if (logoId) {
      const ctx = canvas.current.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `${API}/api/public/arquivos/${logoId}`;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      if (img.naturalWidth && ctx) {
        const s = size * 0.2,
          x = (size - s) / 2;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.roundRect(x - 7, x - 7, s + 14, s + 14, 14);
        ctx.fill();
        ctx.drawImage(img, x, x, s, s);
      }
    }
  }, [dark, logoId, slug, url]);
  useEffect(() => {
    const local = ["localhost", "127.0.0.1"].includes(location.hostname);
    const fallback = local
      ? `${location.protocol}//cardapio.localhost${location.port ? `:${location.port}` : ""}`
      : `${location.protocol}//${location.host.replace(/^admin\./, "")}`;
    const base = process.env.NEXT_PUBLIC_PUBLIC_APP_URL || fallback;
    setUrl(`${base.replace(/\/$/, "")}/${slug}`);
  }, [slug]);
  useEffect(() => {
    if (url) draw();
  }, [url, draw]);
  async function png() {
    await draw(1024);
    const a = document.createElement("a");
    a.download = `qrcode-${slug}.png`;
    a.href = canvas.current!.toDataURL("image/png");
    a.click();
    await draw();
  }
  async function svg() {
    let value = await QRCode.toString(url, {
      type: "svg",
      margin: 3,
      errorCorrectionLevel: "H",
      color: { dark, light: "#ffffff" },
    });
    if (logoId)
      value = value.replace(
        "</svg>",
        `<rect x="40%" y="40%" width="20%" height="20%" rx="3%" fill="white"/><image href="${API}/api/public/arquivos/${logoId}" x="42%" y="42%" width="16%" height="16%" preserveAspectRatio="xMidYMid meet"/></svg>`,
      );
    const a = document.createElement("a");
    a.download = `qrcode-${slug}.svg`;
    a.href = URL.createObjectURL(new Blob([value], { type: "image/svg+xml" }));
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <section className={styles.qr}>
      <div>
        <p className="eyebrow">Divulgação profissional</p>
        <h2>QR Code com a sua marca</h2>
        <p>
          Use em mesas, embalagens, fachada e redes sociais. O SVG mantém
          qualidade em qualquer tamanho.
        </p>
        <a href={url} target="_blank">
          {url}
        </a>
        <label>
          Cor do QR Code{" "}
          <input
            type="color"
            value={dark}
            onChange={(e) => setDark(e.target.value)}
          />
        </label>
        <div>
          <button type="button" className="button" onClick={png}>
            Baixar PNG em alta
          </button>{" "}
          <button type="button" className="buttonSecondary" onClick={svg}>
            Baixar SVG
          </button>
        </div>
      </div>
      <canvas ref={canvas} />
    </section>
  );
}
