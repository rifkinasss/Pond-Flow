import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "change-this-secret-in-production");

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get("pondflow_session")?.value;
  let authenticated = false;
  if (token) { try { await jwtVerify(token, secret); authenticated = true; } catch {} }
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");
  const isPublicPath = isAuthPage || pathname === "/" || pathname === "/demo" || pathname === "/download" || pathname.startsWith("/api/auth") || pathname.startsWith("/api/iot/telemetry");
  if (!authenticated && !isPublicPath) { const url = request.nextUrl.clone(); url.pathname = "/login"; return NextResponse.redirect(url); }
  if (authenticated && isAuthPage) { const url = request.nextUrl.clone(); url.pathname = "/dashboard"; return NextResponse.redirect(url); }
  return NextResponse.next();
}
