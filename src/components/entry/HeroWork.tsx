"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { HERO_WORKS } from "@/lib/entry";
import styles from "./Entry.module.css";

/** One work's beats, in ms from its start: its talk drifts in and lands as its sources, AutoMage's
    information work is written on it, then the line, the person (or nobody), and what happens next. */
const BEAT = {
  talk: [500, 1500, 2600],
  land: [1100, 2100, 3200],
  act: [2400, 3400, 4300],
  line: 5200,
  person: 6100,
  after: 7000,
  leave: 10200,
  next: 10900,
} as const;
const TIMES = [0, ...BEAT.talk, ...BEAT.land, ...BEAT.act, BEAT.line, BEAT.person, BEAT.after, BEAT.leave].sort((a, b) => a - b);
/** The page arrives with the first work already being carried, so there is something to read before
    any script runs; the motion picks up from there, with no reset. */
const ARRIVE = BEAT.act[1];
const DONE = Number.POSITIVE_INFINITY;
/** Where each note first appears, in the space above the work. */
const TALK_AT = [["0%", "0px"], ["46%", "16px"], ["16%", "44px"]] as const;

type Shown = { index: number; t: number; from: number };
const advance = (now: Shown): Shown => ({ index: (now.index + 1) % HERO_WORKS.length, t: -1, from: 0 });

/** The hero's right side: one work at a time, being carried. Its cells sit in the hero's grid next to
    the clause each answers — AutoMage's row beside "当 AI 接管信息处理", the person's row beside
    "人回归判断本身" — with the line between them. A new work starts only while the hero is in view.
    Reduced motion shows the first work complete. */
export default function HeroWork() {
  /* `from`: where on its timeline the current work started — mid-way for the first, 0 for the rest. */
  const [{ index, t, from }, setState] = useState<Shown>({ index: 0, t: ARRIVE, from: ARRIVE });
  const [still, setStill] = useState(false);
  const workRef = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const waiting = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setStill(reduce.matches);
      if (reduce.matches) setState({ index: 0, t: DONE, from: DONE });
    };
    sync();
    reduce.addEventListener("change", sync);
    const seen = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (visible.current && waiting.current) {
        waiting.current = false;
        setState(advance);
      }
    });
    if (workRef.current) seen.observe(workRef.current);
    return () => {
      reduce.removeEventListener("change", sync);
      seen.disconnect();
    };
  }, []);

  /* Each note flies to its own source tag: measured once the work is laid out, before it starts. */
  useLayoutEffect(() => {
    const cell = workRef.current;
    if (!cell) return;
    const tags = cell.querySelectorAll<HTMLElement>("[data-tag]");
    cell.querySelectorAll<HTMLElement>("[data-note]").forEach((note, i) => {
      const tag = tags[i];
      if (!tag) return;
      const a = note.getBoundingClientRect();
      const b = tag.getBoundingClientRect();
      note.style.setProperty("--dx", `${(b.left + b.width / 2 - (a.left + a.width / 2)).toFixed(1)}px`);
      note.style.setProperty("--dy", `${(b.top + b.height / 2 - (a.top + a.height / 2)).toFixed(1)}px`);
    });
  }, [index]);

  useEffect(() => {
    if (still) return;
    const timers = TIMES.filter((time) => (from === 0 ? true : time > from)).map((time) => window.setTimeout(() => setState((now) => ({ ...now, t: time })), Math.max(0, time - from)));
    timers.push(window.setTimeout(() => {
      if (visible.current) setState(advance);
      else waiting.current = true;
    }, Math.max(0, BEAT.next - from)));
    return () => timers.forEach(clearTimeout);
  }, [index, from, still]);

  const work = HERO_WORKS[index];
  const on = (time: number) => (t >= time ? true : undefined);
  const leaving = t >= BEAT.leave && t !== DONE ? true : undefined;
  return <>
    <div ref={workRef} className={`${styles.heroCell} ${styles.heroWork}`} data-leaving={leaving} aria-hidden="true">
      <ul className={styles.talk}>{work.talk.map((note, f) => <li key={`${index}-${f}`} data-note data-on={on(BEAT.talk[f])} data-landed={on(BEAT.land[f])} style={{ "--fx": TALK_AT[f][0], "--fy": TALK_AT[f][1] } as CSSProperties}>
        <span>{note.source}</span>{note.text}
      </li>)}</ul>
      <p key={`title-${index}`} className={styles.heroWorkTitle} data-on={on(0)}>{work.title}</p>
      <p key={`state-${index}`} className={styles.heroWorkState} data-on={on(0)}><span>到哪了</span>{work.state}</p>
      <p key={`sources-${index}`} className={styles.heroWorkSources} data-on={on(BEAT.land[0])}><span>出处</span>{work.talk.map((note, f) => <i key={`${index}-${f}`} data-tag data-on={on(BEAT.land[f])}>{note.source}</i>)}</p>
    </div>
    <p key={`ai-${index}`} className={`${styles.heroCell} ${styles.heroAi}`} data-leaving={leaving} aria-hidden="true">
      <span className={styles.heroWho}>AutoMage</span>{work.actions.map((action, k) => <i key={`${index}-${action}`} data-on={on(BEAT.act[k])}>{action}</i>)}
    </p>
    <p key={`line-${index}`} className={`${styles.heroCell} ${styles.heroLine}`} data-leaving={leaving} data-hit={work.line.hit || undefined} data-on={on(BEAT.line)} aria-hidden="true">
      <span>{work.line.text}</span>
    </p>
    <p key={`person-${index}`} className={`${styles.heroCell} ${styles.heroPerson}`} data-leaving={leaving} data-none={work.person ? undefined : true} data-on={on(BEAT.person)} aria-hidden="true">
      {work.person ? <><span>{work.person.role}</span><b>{work.person.text}</b></> : <><span>人</span><b>不用找人。</b></>}
    </p>
    <p key={`after-${index}`} className={`${styles.heroCell} ${styles.heroAfter}`} data-leaving={leaving} data-on={on(BEAT.after)} aria-hidden="true">→ {work.after}</p>
  </>;
}
