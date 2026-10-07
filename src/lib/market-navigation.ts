export type CatalogQuery = { area?: string; q?: string; domain?: string; page?: string; group?: string; view?: string };

export function normalizeCatalogQuery(raw: Record<string, string | string[] | undefined>): CatalogQuery {
  const result: CatalogQuery = {};
  for (const key of ["area", "q", "domain", "page", "group", "view"] as const) {
    const value = raw[key];
    result[key] = Array.isArray(value) ? value[0] : value;
  }
  if (raw.all === "1") result.view = "all";
  return result;
}

export function catalogUrl(state: CatalogQuery): string {
  const params = new URLSearchParams({ view: "all" });
  for (const key of ["area", "q", "domain", "group"] as const) {
    const value = state[key]?.trim();
    if (value) params.set(key, value);
  }
  const page = Number(state.page);
  if (Number.isFinite(page) && page > 1) params.set("page", String(Math.floor(page)));
  return `/market?${params.toString()}`;
}

export function detailUrl(id: string, returnTo?: string): string {
  return `/market/${encodeURIComponent(id)}${returnTo ? `?${new URLSearchParams({ returnTo })}` : ""}`;
}

export function pageWindow(total: number, requested: string | undefined, size = 6) {
  const pages = Math.max(1, Math.ceil(total / size));
  const value = Number(requested);
  const page = Number.isFinite(value) ? Math.min(pages, Math.max(1, Math.floor(value))) : 1;
  return { page, pages, start: (page - 1) * size, end: page * size };
}
