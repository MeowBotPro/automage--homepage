import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSkillCatalog } from "@/lib/server/skill-source";
import { parseIntentCookie, SKILL_INTENT_COOKIE } from "@/lib/skill-intent";
import styles from "./MarketPage.module.css";

/** The three tabs, each a page of its own; the default entry is reached from the logo and is none of them. */
const TABS = [
  { href: "/work", label: "AI for Work 新公司运行模式", match: ["work"] },
  { href: "/scenarios/supply-chain", label: "AI+供应链", match: ["scenario"] },
  { href: "/market", label: "AI 自动化能力库", match: ["market", "detail"] },
] as const;

export default async function MarketChrome({ active }: { active: "entry" | "work" | "market" | "detail" | "scenario" | "contact" }) {
  const jar = await cookies();
  const count = parseIntentCookie(jar.get(SKILL_INTENT_COOKIE)?.value, await getSkillCatalog()).length;
  return <div className={styles.topbarWrap}><header className={styles.topbar}>
    <Link className={styles.brandLink} href="/" aria-label="AutoMage 首页" aria-current={active === "entry" ? "page" : undefined}><Image className={styles.wordmark} src="/automage-logo-wordmark-white-2.svg" width={437} height={107} alt="AutoMage" priority /></Link>
    <nav className={styles.topnav} aria-label="主导航">
      {TABS.map((tab) => <Link key={tab.href} href={tab.href} className={styles.topnavLink} aria-current={(tab.match as readonly string[]).includes(active) ? "page" : undefined}>{tab.label}</Link>)}
    </nav>
    <Link className={styles.headerContact} href="/contact" aria-current={active === "contact" ? "page" : undefined}>{count ? "咨询清单" : "与我们聊聊"}<span className={styles.countBadge}>{count || "↗"}</span></Link>
  </header></div>;
}

export function MarketFooter() {
  return <footer className={styles.footer}><span>AutoMage · 让信息连接工作</span><nav aria-label="页脚"><Link href="/">首页</Link>{TABS.map((tab) => <Link key={tab.href} href={tab.href}>{tab.label}</Link>)}<Link href="/contact">联系我们</Link></nav></footer>;
}
