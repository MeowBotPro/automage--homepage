import Image from "next/image";
import Link from "next/link";
import styles from "./MarketConsolePrototype.module.css";

export default function PrototypeHeader({ active }: { active: "market" | "console" }) {
  return (
    <div className={styles.topbarWrap}>
      <header className={styles.topbar}>
        <Link className={styles.brandLink} href="/" aria-label="返回 AutoMage 官网">
          <Image
            className={styles.wordmark}
            src="/automage-logo-wordmark-white-2.svg"
            width={437}
            height={107}
            alt="AutoMage"
            priority
          />
        </Link>
        <nav className={styles.topnav} aria-label="原型导航">
          <Link href="/" className={styles.topnavLink}>现有官网</Link>
          <Link href="/market" className={styles.topnavLink} data-active={active === "market"}>能力中心</Link>
          <Link href="/console" className={styles.topnavLink} data-active={active === "console"}>Console</Link>
        </nav>
        <div className={styles.prototypeBadge}>
          <span aria-hidden="true" />
          PROTOTYPE · LOCAL
        </div>
      </header>
    </div>
  );
}
