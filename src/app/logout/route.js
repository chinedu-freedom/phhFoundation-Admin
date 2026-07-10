import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = ""; // clear params
  return NextResponse.redirect(url);
}
