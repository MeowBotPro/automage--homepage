"use client";

import { useEffect, useState } from "react";
import styles from "@/components/homepage-vnext/HomepageJourney.module.css";

const NODES = [
  ["Incident", "section-hero"],
  ["Burden", "section-compare"],
  ["Explore", "section-loop"],
  ["Gate", "section-security"],
  ["Commit", "section-story"],
  ["Core", "section-value"],
] as const;

export default function FlowNavigation() {
  const [active, setActive] = useState("section-hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-34% 0px -55% 0px", threshold: [0, 0.12, 0.35] },
    );

    NODES.forEach(([, id]) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className={styles.flowNav} aria-label="事件路径导航">
      {NODES.map(([label, id]) => (
        <button
          className={`${styles.flowDot} ${active === id ? styles.flowDotActive : ""}`}
          key={id}
          type="button"
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
          aria-label={`前往 ${label}`}
        >
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
