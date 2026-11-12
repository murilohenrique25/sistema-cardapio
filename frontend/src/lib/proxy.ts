import { NextResponse } from "next/server";
export async function proxy(response: Response | null) { if (!response) return NextResponse.json({ message: "Não autenticado" }, { status: 401 }); return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" } }); }
