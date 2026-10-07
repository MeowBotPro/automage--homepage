"use client";

import { useState } from "react";
import styles from "@/components/homepage-vnext/HomepageJourney.module.css";

const NAV = [
  ["事件路径", "#section-compare"],
  ["Explore", "#section-loop"],
  ["授权与执行", "#section-security"],
  ["系统边界", "#section-faq"],
] as const;

export default function CommandHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className={styles.commandHeader}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="#section-hero" aria-label="AutoMage 首页">Auto<span>Mage</span></a>
          <nav className={styles.headerNav} aria-label="主页路径">
            {NAV.map(([label, href]) => <a className={styles.headerLink} href={href} key={href}>{label}</a>)}
          </nav>
          <div className={styles.headerRight}>
            <span className={styles.headerStatus}><i /> DEMO TRACE</span>
            <a className={styles.headerCta} href="#section-beta">带来一条事件</a>
            <button
              className={styles.menuButton}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "关闭导航" : "打开导航"}
              aria-expanded={open}
            >
              {open ? "×" : "≡"}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <nav className={styles.mobileMenu} aria-label="移动端主页路径">
          {NAV.map(([label, href]) => (
            <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a href="#section-beta" onClick={() => setOpen(false)}>带来一条事件</a>
        </nav>
      )}
    </>
  );
}
