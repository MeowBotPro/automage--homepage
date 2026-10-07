import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { parseIntentCookie, SKILL_INTENT_COOKIE } from "@/lib/skill-intent";
import styles from "./MarketPage.module.css";

export default async function MarketChrome({ active }: { active: "home" | "market" | "detail" | "scenario" | "contact" }) {
  const jar = await cookies();
  const count = parseIntentCookie(jar.get(SKILL_INTENT_COOKIE)?.value).length;
  return <div className={styles.topbarWrap}><header className={styles.topbar}>
    <Link className={styles.brandLink} href="/" aria-label="AutoMage 首页"><Image className={styles.wordmark} src="/automage-logo-wordmark-white-2.svg" width={437} height={107} alt="AutoMage" priority /></Link>
    <nav className={styles.topnav} aria-label="主导航">
      <Link href="/" className={styles.topnavLink} aria-current={active === "home" ? "page" : undefined}>产品</Link>
      <Link href="/scenarios/supply-chain" className={styles.topnavLink} aria-current={active === "scenario" ? "page" : undefined}>场景</Link>
      <Link href="/market" className={styles.topnavLink} aria-current={active === "market" || active === "detail" ? "page" : undefined}>能力</Link>
    </nav>
    <Link className={styles.headerContact} href="/contact" aria-current={active === "contact" ? "page" : undefined}>{count ? "咨询清单" : "与我们聊聊"}<span className={styles.countBadge}>{count || "↗"}</span></Link>
  </header></div>;
}

export function MarketFooter() {
  return <footer className={styles.footer}><span>AutoMage · 让信息连接工作</span><nav aria-label="页脚"><Link href="/">了解产品</Link><Link href="/market">探索 Skills</Link><Link href="/contact">联系我们</Link></nav></footer>;
}
