import { z } from "zod";
import { SKILL_DOMAINS, type SkillRecord } from "./skill-catalog";
import { SKILL_GROUPS } from "./skill-groups";

/** The skill index: the one file on OSS the site reads to know which skills to show and where their
    videos are. The publishing pipeline writes it (for the first fill, scripts/skills/export-index.cjs);
    docs/skill-delivery/ describes it for the people who make skills. Media paths in it are relative to
    the asset base, by default the folder the index is in, so moving the files moves only that base.
    Limits here are loose on purpose: the package check before publishing holds the stricter ones,
    and the site only refuses what it cannot show. */
export const SKILL_INDEX_FORMAT = "automage.skill-index/1";

const text = (max: number) => z.string().trim().min(1).max(max);
const texts = (max: number, length: number) => z.array(text(length)).max(max);

const StorySchema = z.object({
  scenario: text(120),
  description: text(300),
  audience: text(120),
  inputs: texts(8, 120).min(1),
  outcomes: texts(8, 120).min(1),
  steps: z.array(z.object({ title: text(30), text: text(200) })).min(1).max(8),
  requirements: text(300),
  boundary: text(300),
  preview: z.enum(["report", "sourcing", "script", "lead", "document"]),
});

const MediaSchema = z.object({ video: text(500), poster: text(500).optional() });

export const SkillIndexEntrySchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/, "id: letters, digits, - and _ only"),
  version: text(40),
  domain: z.enum(SKILL_DOMAINS),
  title: text(60),
  summary: text(200),
  inputs: texts(8, 120),
  output: text(80),
  groups: z.array(z.string()).max(8),
  keywords: z.array(z.string().trim().max(40)).max(30).default([]),
  subSkills: z.number().int().min(0).default(0),
  story: StorySchema.nullable().default(null),
  media: MediaSchema.nullable().default(null),
  updatedAt: z.string().optional(),
});
export type SkillIndexEntry = z.infer<typeof SkillIndexEntrySchema>;

const SkillIndexSchema = z.object({
  format: z.literal(SKILL_INDEX_FORMAT),
  generatedAt: z.string(),
  skills: z.array(z.unknown()),
});

export type SkillIndex = { format: typeof SKILL_INDEX_FORMAT; generatedAt: string; skills: SkillIndexEntry[] };

const KNOWN_GROUPS = new Set(SKILL_GROUPS.map((group) => group.id));

/** A relative path resolved against the asset base (absolute http(s) URLs are kept as they are). */
function resolveMedia(path: string, base: string): string | null {
  try {
    const url = new URL(path, base.endsWith("/") ? base : `${base}/`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

/** Reads an index into the site's records. A malformed entry is left out and reported while the rest
    still show; a repeated id keeps its first entry; a media path that cannot be resolved leaves the skill
    on its cover. Nothing here throws: what cannot be read is reported in `problems`. */
export function readSkillIndex(raw: unknown, assetBase: string): { skills: SkillRecord[]; problems: string[] } {
  const index = SkillIndexSchema.safeParse(raw);
  if (!index.success) return { skills: [], problems: [`not a ${SKILL_INDEX_FORMAT} index: ${z.prettifyError(index.error)}`] };
  const problems: string[] = [];
  const skills: SkillRecord[] = [];
  const seen = new Set<string>();
  index.data.skills.forEach((item, at) => {
    const parsed = SkillIndexEntrySchema.safeParse(item);
    const label = `skills[${at}]${typeof (item as { id?: unknown })?.id === "string" ? ` (${(item as { id: string }).id})` : ""}`;
    if (!parsed.success) {
      problems.push(`${label} left out: ${z.prettifyError(parsed.error).replaceAll("\n", " ")}`);
      return;
    }
    const entry = parsed.data;
    if (seen.has(entry.id)) {
      problems.push(`${label} left out: id already listed`);
      return;
    }
    seen.add(entry.id);
    const unknown = entry.groups.filter((id) => !KNOWN_GROUPS.has(id));
    if (unknown.length) problems.push(`${label}: unknown group ${unknown.join(", ")}, ignored`);
    let video: SkillRecord["video"] = null;
    if (entry.media) {
      const src = resolveMedia(entry.media.video, assetBase);
      const poster = entry.media.poster ? resolveMedia(entry.media.poster, assetBase) : null;
      if (src) video = poster ? { src, poster } : { src };
      else problems.push(`${label}: video path ${entry.media.video} cannot be resolved, shown without video`);
    }
    skills.push({
      id: entry.id,
      domain: entry.domain,
      title: entry.title,
      summary: entry.summary,
      inputs: entry.inputs,
      output: entry.output,
      nestedCount: entry.subSkills,
      groups: entry.groups.filter((id) => KNOWN_GROUPS.has(id)),
      keywords: entry.keywords.filter(Boolean),
      story: entry.story,
      video,
    });
  });
  return { skills, problems };
}

/** The index entry for a record, the other way round: for whatever writes an index from records. */
export function toSkillIndexEntry(skill: SkillRecord, version: string, media: SkillIndexEntry["media"], updatedAt?: string): SkillIndexEntry {
  return {
    id: skill.id,
    version,
    domain: skill.domain,
    title: skill.title,
    summary: skill.summary,
    inputs: skill.inputs,
    output: skill.output,
    groups: skill.groups,
    keywords: skill.keywords,
    subSkills: skill.nestedCount,
    story: skill.story,
    media,
    ...(updatedAt ? { updatedAt } : {}),
  };
}
