import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendFetch } from "@/lib/backend";

export async function GET() {
  const response = await authenticatedBackendFetch("/api/admin/empresas");
  if (!response) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  const response = await authenticatedBackendFetch("/api/admin/empresas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  });
  if (!response) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

