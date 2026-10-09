import { SKILL_RECORDS as BUNDLED_RECORDS } from "./skill-catalog.data";
import { SKILL_GROUPS } from "./skill-groups";
import { SKILL_STORIES, type SkillStory } from "./skill-stories";

export const SKILL_DOMAINS = ["销售", "CRM", "客服", "外贸", "电商", "法律", "财税", "图文", "视频", "交付"] as const;
export type SkillDomain = (typeof SKILL_DOMAINS)[number];

export type SkillVideoSource = { src: string; poster?: string };

/** A skill as the site shows it, and nothing more: only what is public. Where the records come from —
    the skill index on OSS, or the snapshot bundled with the site — is decided by the loader in
    src/lib/server/skill-source.ts; everything else receives a catalog and does not care. */
export interface SkillRecord {
  id: string;
  domain: SkillDomain;
  title: string;
  summary: string;
  inputs: string[];
  output: string;
  /** Sub-skills in a pack; 0 for a single skill. */
  nestedCount: number;
  /** The work groups it is listed under (ids from skill-groups), the first being its main one. */
  groups: string[];
  /** Extra search words, beyond its title, summary and output. */
  keywords: string[];
  /** The detail page's longer explanation, when one has been written. */
  story: SkillStory | null;
  video: SkillVideoSource | null;
}

export interface SkillCatalog {
  getAll(): SkillRecord[];
  getById(id: string): SkillRecord | null;
  getByDomain(domain: SkillDomain): SkillRecord[];
  search(query: string, domain?: SkillDomain | "全部"): SkillRecord[];
}

/** The bundled inventory's shape, as it was compiled, internal provenance included. Only the public
    fields reach a SkillRecord. */
export interface BundledSkillRecord {
  id: string;
  domain: SkillDomain;
  title: string;
  summary: string;
  inputs: string[];
  output: string;
  gate: string | null;
  sourceRef: string;
  kind: "atomic" | "role" | "pack" | "tool";
  status: "demo" | "third_party" | "walkthrough";
  nestedCount: number;
  videoUrl: string | null;
  posterUrl: string | null;
}

export const SKILL_INTENT_STORAGE_KEY = "automage.public.skill-intent.v1";

function matchesQuery(skill: SkillRecord, query: string): boolean {
  if (!query) return true;
  return [skill.id, skill.title, skill.summary, skill.domain, skill.output, ...skill.inputs, ...skill.keywords]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function createSkillCatalog(records: SkillRecord[]): SkillCatalog {
  const byId = new Map(records.map((item) => [item.id, item]));
  return {
    getAll() {
      return records;
    },
    getById(id: string) {
      return byId.get(id) ?? null;
    },
    getByDomain(domain: SkillDomain) {
      return records.filter((item) => item.domain === domain);
    },
    search(query: string, domain: SkillDomain | "全部" = "全部") {
      const needle = query.trim().toLowerCase();
      return records.filter((item) => (domain === "全部" || item.domain === domain) && matchesQuery(item, needle));
    },
  };
}

/** The snapshot that ships with the site: what it shows when no index is configured or none can be read. */
export const BUNDLED_SKILLS: SkillRecord[] = BUNDLED_RECORDS.map((raw) => ({
  id: raw.id,
  domain: raw.domain,
  title: raw.title,
  summary: raw.summary,
  inputs: raw.inputs,
  output: raw.output,
  nestedCount: raw.nestedCount,
  groups: SKILL_GROUPS.filter((group) => group.skillIds.includes(raw.id)).map((group) => group.id),
  keywords: [],
  story: SKILL_STORIES[raw.id] ?? null,
  video: raw.videoUrl ? { src: raw.videoUrl, poster: raw.posterUrl ?? undefined } : null,
}));

export const bundledCatalog = createSkillCatalog(BUNDLED_SKILLS);
