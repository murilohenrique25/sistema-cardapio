import { NextResponse } from "next/server";
import { authenticatedBackendFetch } from "@/lib/backend";

export async function GET() {
  const response = await authenticatedBackendFetch("/api/auth/me");
  if (!response?.ok) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  return NextResponse.json(await response.json());
}

