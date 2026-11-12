import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendFetch } from "@/lib/backend";

async function forward(response: Response | null) {
  if (!response) return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  return forward(await authenticatedBackendFetch("/api/minha-empresa"));
}

export async function PUT(request: NextRequest) {
  return forward(await authenticatedBackendFetch("/api/minha-empresa", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  }));
}

