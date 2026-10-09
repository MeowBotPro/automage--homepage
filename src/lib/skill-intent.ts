import type { SkillCatalog } from "./skill-catalog";

export const SKILL_INTENT_COOKIE = "automage_skill_intent";

/** The saved inquiry list: ids still in the catalog, each once. */
export function parseIntentCookie(value: string | undefined, catalog: SkillCatalog): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter(
      (id): id is string => typeof id === "string" && Boolean(catalog.getById(id)),
    ))];
  } catch {
    return [];
  }
}

export function safeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/market";
  if (value.startsWith("//") || value.includes("\\") || /[\r\n]/.test(value)) return "/market";
  const path = value.split(/[?#]/)[0];
  if (!(path === "/market" || path === "/contact" || /^\/market\/[^/]+$/.test(path)) || path === "/market/intent") return "/market";
  return value;
}
