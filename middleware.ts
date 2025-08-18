// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // simple gate: require a cookie named 'sb-access-token' set by Supabase
  const token = req.cookies.get("sb-access-token")?.value;

  // Protect /admin only
  if (req.nextUrl.pathname.startsWith("/admin") && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/agent"; // send to login/form
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
