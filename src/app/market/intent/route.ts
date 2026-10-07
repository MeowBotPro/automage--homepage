import { NextResponse, type NextRequest } from "next/server";
import { skillCatalog } from "@/lib/skill-catalog";
import { SKILL_INTENT_COOKIE, parseIntentCookie, safeReturnTo } from "@/lib/skill-intent";

// Reading or prefetching a URL never changes the inquiry list.
export function GET() {
  return new Response(null, { status: 303, headers: { Location: "/market" } });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const action = form.get("action");
  const returnTo = safeReturnTo(form.get("returnTo"));
  const current = parseIntentCookie(request.cookies.get(SKILL_INTENT_COOKIE)?.value);
  if ((action !== "add" && action !== "remove") || !skillCatalog.getById(id)) {
    return NextResponse.json({ error: "请选择目录中有效的 Skill。" }, { status: 400 });
  }
  const next = action === "add" ? [...new Set([...current, id])] : current.filter((item) => item !== id);
  if (next.length > 20) return NextResponse.json({ error: "清单最多保存 20 项，请移除暂时不需要的能力后再添加。" }, { status: 422 });
  const response = request.headers.get("accept")?.includes("application/json")
    ? NextResponse.json({ ids: next })
    : new NextResponse(null, { status: 303, headers: { Location: returnTo } });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(SKILL_INTENT_COOKIE, JSON.stringify(next), { path: "/", maxAge: 60 * 60 * 24 * 30, httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:" });
  return response;
}
