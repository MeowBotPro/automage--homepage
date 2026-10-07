import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import SkillDetail from "@/components/market/SkillDetail";
import { skillCatalog } from "@/lib/skill-catalog";
import { SKILL_INTENT_COOKIE, parseIntentCookie, safeReturnTo } from "@/lib/skill-intent";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export function generateStaticParams() {
  return skillCatalog.getAll().map((skill) => ({ id: skill.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const skill = skillCatalog.getById(id);
  if (!skill) {
    return { title: "Skill · AutoMage" };
  }
  return {
    title: `${skill.title} · AutoMage 能力库`,
    description: `AutoMage 能力库 · 当前公开能力。${skill.summary}`,
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const skill = skillCatalog.getById(id);
  if (!skill) notFound();
  const jar = await cookies();
  const selected = parseIntentCookie(jar.get(SKILL_INTENT_COOKIE)?.value).includes(skill.id);
  const query = await searchParams;
  return <SkillDetail skill={skill} selected={selected} returnTo={safeReturnTo(query.returnTo)} />;
}
