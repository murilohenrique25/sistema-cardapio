import { cookies } from "next/headers";

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type AuthenticatedUser = {
  usuarioId: string;
  empresaId: string | null;
  nome: string;
  email: string;
  perfil: "SUPER_ADMIN" | "ADMIN_EMPRESA";
  trocaSenhaObrigatoria: boolean;
};

export async function authenticatedBackendFetch(path: string, init?: RequestInit) {
  const token = (await cookies()).get("sc_access_token")?.value;
  if (!token) return null;

  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}

export async function currentUser(): Promise<AuthenticatedUser | null> {
  const response = await authenticatedBackendFetch("/api/auth/me");
  if (!response?.ok) return null;
  return response.json();
}
