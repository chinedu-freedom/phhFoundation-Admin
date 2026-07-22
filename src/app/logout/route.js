import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const cookieStore = await cookies();
  
  // Set expired cookie with matching path and options to guarantee browser clears it
  cookieStore.set("admin_session", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = ""; // clear params
  return NextResponse.redirect(url);
}
