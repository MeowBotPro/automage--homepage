import { cache } from "react";
import { bundledCatalog, createSkillCatalog, type SkillCatalog } from "@/lib/skill-catalog";
import { readSkillIndex } from "@/lib/skill-index";

/** How long a fetched index is kept before it is fetched again, in seconds: a skill published to the
    index shows on the site within about this long, with no release. Keep the index's Cache-Control on
    OSS/CDN no longer than this. */
const REFRESH_SECONDS = 60;
const TIMEOUT_MS = 4000;
/** After a failed read, how long the site keeps showing what it has before it tries again. */
const RETRY_MS = 60_000;

type Kept = { text: string; catalog: SkillCatalog };
type State = { kept: Kept | null; failedAt: number };
const state: State = ((globalThis as typeof globalThis & { __automageSkillIndex?: State }).__automageSkillIndex ??= { kept: null, failedAt: 0 });

/** The catalog every page shows. With SKILL_INDEX_URL set (at run time; no rebuild needed), it is read
    from the skill index on OSS, so a skill published there appears without a release. If the index
    cannot be read, the last good one stays up; before any has been read, the bundled snapshot.
    Media paths resolve against SKILL_ASSET_BASE, or, by default, the index's own folder. */
export const getSkillCatalog = cache(async (): Promise<SkillCatalog> => {
  const url = process.env.SKILL_INDEX_URL?.trim();
  if (!url) return bundledCatalog;
  const fallback = state.kept?.catalog ?? bundledCatalog;
  if (Date.now() - state.failedAt < RETRY_MS) return fallback;
  try {
    const response = await fetch(url, { next: { revalidate: REFRESH_SECONDS, tags: ["skill-index"] }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (state.kept?.text === text) return state.kept.catalog;
    const base = process.env.SKILL_ASSET_BASE?.trim() || new URL("./", url).href;
    const { skills, problems } = readSkillIndex(JSON.parse(text), base);
    if (problems.length) console.warn(`[skill-index] ${url}: ${problems.length} problem(s)\n  ${problems.slice(0, 30).join("\n  ")}`);
    if (!skills.length) throw new Error("the index lists no skill the site can show");
    state.kept = { text, catalog: createSkillCatalog(skills) };
    state.failedAt = 0;
    return state.kept.catalog;
  } catch (error) {
    state.failedAt = Date.now();
    console.error(`[skill-index] cannot read ${url}, showing the ${state.kept ? "last good index" : "bundled snapshot"}: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
});
