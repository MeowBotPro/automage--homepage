import { SKILL_RECORDS as RAW_SKILL_RECORDS } from "./skill-catalog.data";

export type SkillDomain =
  | "法律"
  | "财税"
  | "销售"
  | "外贸"
  | "电商"
  | "图文"
  | "视频"
  | "CRM"
  | "客服"
  | "交付";

export type SkillKind = "atomic" | "role" | "pack" | "tool";
export type SkillStatus = "demo" | "third_party" | "walkthrough";

export interface SkillRecord {
  id: string;
  domain: SkillDomain;
  title: string;
  summary: string;
  inputs: string[];
  output: string;
  gate: string | null;
  sourceRef: string;
  kind: SkillKind;
  status: SkillStatus;
  nestedCount: number;
  videoUrl: string | null;
  posterUrl: string | null;
}

export interface SkillCatalog {
  getAll(): SkillRecord[];
  getById(id: string): SkillRecord | null;
  getByDomain(domain: SkillDomain): SkillRecord[];
  search(query: string, domain?: SkillDomain | "全部"): SkillRecord[];
}

export const SKILL_DOMAINS: SkillDomain[] = [
  "销售",
  "CRM",
  "客服",
  "外贸",
  "电商",
  "法律",
  "财税",
  "图文",
  "视频",
  "交付",
];

export const SKILL_KIND_LABEL: Record<SkillKind, string> = {
  atomic: "一项工作能力",
  role: "角色顾问",
  pack: "一组配套能力",
  tool: "办事工具",
};

export const SKILL_STATUS_LABEL: Record<SkillStatus, string> = {
  demo: "演示说明",
  third_party: "已收录技能说明",
  walkthrough: "已收录，附讲解材料",
};

export const SKILL_INTENT_STORAGE_KEY = "automage.public.skill-intent.v1";

const SKILL_RECORDS: SkillRecord[] = RAW_SKILL_RECORDS;
const byId = new Map(SKILL_RECORDS.map((item) => [item.id, item]));

function matchesQuery(skill: SkillRecord, query: string): boolean {
  if (!query) return true;
  const haystack = [
    skill.id,
    skill.title,
    skill.summary,
    skill.domain,
    skill.output,
    ...skill.inputs,
    skill.gate ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export const hardcodedSkillCatalog: SkillCatalog = {
  getAll() {
    return SKILL_RECORDS;
  },
  getById(id: string) {
    return byId.get(id) ?? null;
  },
  getByDomain(domain: SkillDomain) {
    return SKILL_RECORDS.filter((item) => item.domain === domain);
  },
  search(query: string, domain: SkillDomain | "全部" = "全部") {
    const needle = query.trim().toLowerCase();
    return SKILL_RECORDS.filter((item) => {
      if (domain !== "全部" && item.domain !== domain) return false;
      return matchesQuery(item, needle);
    });
  },
};

export const skillCatalog: SkillCatalog = hardcodedSkillCatalog;
