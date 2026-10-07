"use client";

import { useEffect, useId, useRef } from "react";
import type { Source } from "@/lib/supply-chain-world";
import styles from "./SupplyChain.module.css";

export default function SourceTag({ source }: { source: Source }) {
  const popId = `source-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLSpanElement | null>(null);
  const who = source.who.split(" · ")[0];
  const when = source.at.replace(/ \d{2}:\d{2}$/, "");

  useEffect(() => {
    const pop = popRef.current;
    if (!pop) return;
    const close = () => pop.hidePopover();
    const onToggle = (event: Event) => {
      if ((event as ToggleEvent).newState === "open") window.addEventListener("scroll", close, { passive: true, once: true });
      else window.removeEventListener("scroll", close);
    };
    pop.addEventListener("toggle", onToggle);
    return () => {
      pop.removeEventListener("toggle", onToggle);
      window.removeEventListener("scroll", close);
    };
  }, []);

  const place = () => {
    const button = buttonRef.current;
    const pop = popRef.current;
    if (!button || !pop) return;
    const rect = button.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    pop.style.width = `${width}px`;
    pop.style.left = `${Math.min(Math.max(12, rect.left), window.innerWidth - width - 12)}px`;
    const above = rect.bottom + 150 > window.innerHeight;
    pop.style.top = above ? "auto" : `${rect.bottom + 6}px`;
    pop.style.bottom = above ? `${window.innerHeight - rect.top + 6}px` : "auto";
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.sourceTag}
        popoverTarget={popId}
        onClick={place}
        aria-label={`查看来源：${source.who}，${source.at}`}
      >
        {who} · {when}
      </button>
      <span ref={popRef} id={popId} popover="auto" className={styles.sourcePop} role="dialog" aria-label="来源">
        <span className={styles.sourceRow}><span>谁给出</span><span>{source.who}</span></span>
        <span className={styles.sourceRow}><span>何时</span><span>{source.at}</span></span>
        <span className={styles.sourceRow}><span>从哪来</span><span>{source.via}</span></span>
        {source.ref && <span className={styles.sourceRow}><span>编号</span><span>{source.ref}</span></span>}
        <span className={styles.sourceNote}>演示数据，不来自真实企业系统。</span>
      </span>
    </>
  );
}
