"use client";

import { useEffect, useRef, useState } from "react";
import { BOUNDARIES } from "@/lib/home-stage";
import styles from "./Home.module.css";

/** Height of the drawn fork, px; the branches sit right under its two ends. */
const DROP = 60;
/** Gap between the two branches, px (matches .branches). */
const GAP = 16;

/* Where the same change goes under each of two delegation boundaries. On the stage the line leaves the
   work, splits, and each branch reaches the result its boundary allows; the stage's --p draws it, so it
   follows the scroll both ways. A still frame shows both branches without the drawing. */
export default function Fork({ still = false }: { still?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const box = ref.current;
    if (!box || still) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(box);
    return () => observer.disconnect();
  }, [still]);

  const mid = width / 2;
  const side = (width - GAP) / 4;
  const ends = [side, width - side];
  const knee = 18;

  return <div ref={ref} className={styles.fork} data-still={still || undefined}>
    {!still && <svg className={styles.forkLines} width={width} height={DROP} viewBox={`0 0 ${width} ${DROP}`} fill="none" aria-hidden="true">
      <path data-seg="trunk" d={`M${mid} 0 V${knee}`} pathLength={1} />
      {ends.map((end, k) => (
        <path key={end} data-seg={k === 0 ? "back" : "within"} d={`M${mid} ${knee} C${mid} ${knee + 20} ${end} ${knee + 10} ${end} ${DROP - 6} V${DROP}`} pathLength={1} />
      ))}
    </svg>}
    <div className={styles.branches}>
      {BOUNDARIES.map((branch) => <section key={branch.id} className={styles.branch} data-branch={branch.id} data-tone={branch.tone} aria-label={`委托边界：${branch.rule}`}>
        <p className={styles.branchRule}><span>委托写的是</span>{branch.rule}</p>
        <p className={styles.branchResult}><b>{branch.result}</b><span className={styles.objStatus} data-tone={branch.tone}>{branch.status}</span></p>
        <p className={styles.branchDetail}>{branch.detail}</p>
      </section>)}
    </div>
  </div>;
}
