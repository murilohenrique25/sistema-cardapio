import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const apiResponse = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  if (!apiResponse.ok) {
    return NextResponse.json({ message: "Credenciais inválidas" }, { status: apiResponse.status });
  }

  const session = await apiResponse.json() as { accessToken: string; expiresIn: number; usuario: { trocaSenhaObrigatoria: boolean } };
  const response = NextResponse.json({ authenticated: true, trocaSenhaObrigatoria: session.usuario.trocaSenhaObrigatoria });
  response.cookies.set("sc_access_token", session.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.expiresIn,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set("sc_access_token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
