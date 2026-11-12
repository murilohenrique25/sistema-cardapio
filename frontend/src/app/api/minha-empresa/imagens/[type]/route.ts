import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendFetch } from "@/lib/backend";

export async function POST(request: NextRequest, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  if (type !== "logo" && type !== "banner") return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
  const incoming = await request.formData();
  const file = incoming.get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "Selecione uma imagem" }, { status: 400 });
  const body = new FormData(); body.set("file", file);
  const response = await authenticatedBackendFetch(`/api/minha-empresa/imagens/${type}`, { method: "POST", body });
  if (!response) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
}

