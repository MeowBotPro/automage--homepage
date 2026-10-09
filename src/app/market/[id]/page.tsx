import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import SkillDetail from "@/components/market/SkillDetail";
import { getSkillCatalog } from "@/lib/server/skill-source";
import { SKILL_INTENT_COOKIE, parseIntentCookie, safeReturnTo } from "@/lib/skill-intent";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const skill = (await getSkillCatalog()).getById(id);
  if (!skill) {
    return { title: "Skill · AutoMage" };
  }
  return {
    title: `${skill.title} · AI 自动化能力库 · AutoMage`,
    description: `AI 自动化能力库 · ${skill.summary}`,
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const catalog = await getSkillCatalog();
  const skill = catalog.getById(id);
  if (!skill) notFound();
  const jar = await cookies();
  const selected = parseIntentCookie(jar.get(SKILL_INTENT_COOKIE)?.value, catalog).includes(skill.id);
  const query = await searchParams;
  return <SkillDetail skill={skill} catalog={catalog} selected={selected} returnTo={safeReturnTo(query.returnTo)} />;
}
