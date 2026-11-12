import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendFetch } from "@/lib/backend";

async function forward(response: Response | null) {
  if (!response) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  return new NextResponse(await response.text(), { status: response.status, headers: response.status === 204 ? {} : { "Content-Type": "application/json" } });
}
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return forward(await authenticatedBackendFetch(`/api/bairros-entrega/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: await request.text() }));
}
export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return forward(await authenticatedBackendFetch(`/api/bairros-entrega/${id}`, { method: "DELETE" }));
}

