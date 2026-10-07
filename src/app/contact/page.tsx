import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import MarketChrome, { MarketFooter } from "@/components/market/MarketChrome";
import ContactForm from "@/components/market/ContactForm";
import SkillIntentButton from "@/components/market/SkillIntentButton";
import { skillCatalog } from "@/lib/skill-catalog";
import { parseIntentCookie, SKILL_INTENT_COOKIE } from "@/lib/skill-intent";
import styles from "@/components/market/MarketPage.module.css";

export const metadata: Metadata = { title: "聊聊你的工作场景 · AutoMage", description: "带着具体问题与感兴趣的 Skills，和 AutoMage 一起讨论适合的使用方式。" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ skill?: string; need?: string }> }) {
  const params = await searchParams;
  const jar = await cookies();
  const saved = parseIntentCookie(jar.get(SKILL_INTENT_COOKIE)?.value);
  const extra = params.skill && skillCatalog.getById(params.skill) ? [params.skill] : [];
  const skills = [...new Set([...saved, ...extra])].map((id) => skillCatalog.getById(id)).filter((skill) => skill !== null);
  return <div className={styles.page}><MarketChrome active="contact" /><main className={styles.main}><div className={styles.contactGrid}>
    <div className={styles.contactIntro}><p className={styles.kicker}>Let’s make it work</p><h1>从你的工作出发，<br />聊聊合适的做法。</h1><p>带一个具体问题就好。我们一起确认需要什么能力、已有资料如何接入，以及适合从哪里开始。</p>
      <section className={styles.contactSelection}><h2>已保存的咨询清单 · {saved.length} 项</h2>{saved.length ? skills.filter((skill) => saved.includes(skill.id)).map((skill) => <div className={styles.intentItem} key={skill.id}><Link href={`/market/${encodeURIComponent(skill.id)}`}>{skill.title}</Link><SkillIntentButton id={skill.id} selected returnTo="/contact" compact /></div>) : <p style={{ fontSize: 13, color: "#8fa7c1", lineHeight: 1.9 }}>还没有选定 Skill 也可以直接描述需求。</p>}<Link className={styles.textLink} href="/market" style={{ marginTop: 23 }}>继续探索能力 ↗</Link></section>
    </div><ContactForm skills={skills.map(({ id, title, summary }) => ({ id, title, summary }))} initialNeed={params.need?.slice(0, 1000) ?? ""} />
  </div></main><MarketFooter /></div>;
}
