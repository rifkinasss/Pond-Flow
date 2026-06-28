import { type NextRequest } from "next/server";
import { updateSession } from "@/shared/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (manifest.json, icons, dll.)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
