import { NextRequest, NextResponse } from "next/server";

const ADMIN_HOST_PREFIX = "admin.";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;
  const isLocalAdmin = process.env.NODE_ENV !== "production" &&
    (/^localhost(?::\d+)?$/.test(hostname) || /^127\.0\.0\.1(?::\d+)?$/.test(hostname));
  const isAdminHost = hostname.startsWith(ADMIN_HOST_PREFIX) || isLocalAdmin;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const target = request.nextUrl.clone();

  const token = request.cookies.get("sc_access_token")?.value;
  let mustChangePassword = false;
  if (token) {
    try {
      const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      mustChangePassword = JSON.parse(atob(payload)).troca_senha === true;
    } catch { mustChangePassword = false; }
  }

  if (isAdminHost && mustChangePassword && pathname !== "/trocar-senha") {
    target.pathname = "/painel-interno/trocar-senha";
    return NextResponse.rewrite(target);
  }

  const isPublicLocalHome = isLocalAdmin && pathname === "/";
  if (isAdminHost && !isPublicLocalHome && !pathname.startsWith("/painel-interno")) {
    target.pathname = `/painel-interno${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(target);
  }

  if (!isAdminHost && pathname.startsWith("/painel-interno")) {
    target.pathname = "/";
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
