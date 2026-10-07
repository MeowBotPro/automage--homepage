"use client";

import Lenis from "lenis";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { CHANGE, CLAIMS, FIELD_NOTE, FRAGMENTS, LANDING, type Fragment } from "@/lib/home-stage";
import { ChangedCard, WorkCard } from "./WorkObject";
import Fork from "./Fork";
import styles from "./Home.module.css";

/* The homepage stage makes two claims with one piece of work: scattered messages become work AutoMage
   can take on, and the same change ends differently under two delegation boundaries. On wide screens the
   stage is a runway with a frame that stays in view; the scroll position is the stage's progress --p, in
   screens scrolled, and everything on the stage is drawn from it: the left column's text, the messages
   flying onto the record, the change landing, the fork. So any scroll shows at once, scrolling back plays
   it backwards, and no input is held or swallowed. Lenis only smooths the wheel. Reduced motion gets
   native scrolling and each part shown settled; phones and short screens get the same parts as stills. */

const LIVE = "(min-width: 1024px) and (min-height: 620px)";
/** How far the page scrolls while the stage stays in view, in screens. */
const RUNWAY = 3;
/** Progress at which each part is complete and at rest (shown as is under reduced motion). */
const REST = [0, 1, 2.6] as const;
/** Progress at which the next part takes over the left column: halfway through each change of text. */
const SWITCH = [0.42, 1.44] as const;
/** When each part's text comes in and goes out, in stage progress: [in start, in length, out start, out length]. */
const TEXT: [number, number, number, number][] = [[-1, 1, 0.02, 0.24], [0.3, 0.24, 1.18, 0.2], [1.44, 0.24, 99, 1]];
const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const expoOut = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t));

/** Scroll position at which the frame starts to stay in view. */
function anchorOf(stage: HTMLElement, frame: HTMLElement) {
  const head = parseFloat(getComputedStyle(frame).top) || 0;
  return Math.round(stage.getBoundingClientRect().top + window.scrollY - head);
}

/** Layout position of an element inside `root`, ignoring transforms (the stage moves things with them). */
function offsetIn(element: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return node === root ? { x, y } : null;
}

/** Where each message lands: the alert lands on the work's title (it is what started the work); every
    other message, and later the change, shrinks into the source tag of the line it became. */
function measure(visual: HTMLElement) {
  const field = visual.querySelector<HTMLElement>("[data-field]");
  if (!field) return;
  field.querySelectorAll<HTMLElement>("[data-frag]").forEach((frag) => {
    const place = visual.querySelector<HTMLElement>(`[data-land="${frag.dataset.to}"]`);
    const target = (frag.dataset.to === "head" ? place?.querySelector<HTMLElement>("h3") : place?.querySelector<HTMLElement>("button")) ?? place;
    const at = target && offsetIn(target, visual);
    if (!target || !at || target.offsetWidth === 0) return;
    const scale = Math.min(1, target.offsetWidth / frag.offsetWidth);
    frag.style.setProperty("--dx", `${Math.round(at.x - field.offsetLeft - frag.offsetLeft)}px`);
    frag.style.setProperty("--dy", `${Math.round(at.y - field.offsetTop - frag.offsetTop + (target.offsetHeight - frag.offsetHeight * scale) / 2)}px`);
    frag.style.setProperty("--sx", scale.toFixed(3));
  });
}

function Message({ frag, n, change = false }: { frag: Fragment; n: number; change?: boolean }) {
  return <div className={styles.frag} data-frag data-to={frag.to} data-far={frag.far || undefined} data-alert={frag.alert || undefined} data-change={change || undefined}
    style={{ left: `${frag.x}%`, top: `${frag.y}%`, "--i": change ? 0 : LANDING.indexOf(frag.to), "--r": frag.r, "--n": n } as CSSProperties}>
    <small>{frag.who} · {frag.via} · {frag.at}</small>{frag.text}
  </div>;
}

function NoiseStill() {
  return <div className={styles.noiseStill}>
    <p className={styles.stillNote}><span className={styles.demoChip}>演示</span>{FIELD_NOTE}</p>
    <ul>{FRAGMENTS.map((frag) => <li key={frag.id} data-alert={frag.alert || undefined}><small>{frag.who} · {frag.via} · {frag.at}</small>{frag.text}</li>)}</ul>
  </div>;
}

const textWindow = ([si, li, so, lo]: [number, number, number, number]) => ({ "--si": si, "--li": li, "--so": so, "--lo": lo }) as CSSProperties;

export default function HomeStage() {
  const stageRef = useRef<HTMLElement>(null);
  const toRef = useRef<(part: number) => void>(() => {});
  const [scene, setScene] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const frame = stage?.querySelector<HTMLElement>("[data-frame]");
    const visual = stage?.querySelector<HTMLElement>("[data-visual]");
    if (!stage || !frame || !visual) return;
    const liveQuery = window.matchMedia(LIVE);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let anchor = anchorOf(stage, frame);
    let screen = window.innerHeight;
    let raf = 0;
    let current = 0;

    const update = () => {
      raf = 0;
      if (!liveQuery.matches) return;
      const p = clamp((window.scrollY - anchor) / screen, 0, RUNWAY);
      const next = p < SWITCH[0] ? 0 : p < SWITCH[1] ? 1 : 2;
      stage.style.setProperty("--p", (reduce.matches ? REST[next] : p).toFixed(4));
      if (next !== current) {
        current = next;
        setScene(next);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    toRef.current = (part: number) => {
      const top = anchor + REST[part] * screen;
      if (lenis) lenis.scrollTo(top, { duration: 1.4 });
      else window.scrollTo({ top });
    };

    const startLenis = () => {
      if (lenis || reduce.matches) return;
      lenis = new Lenis({ autoRaf: true, duration: 1.1, easing: expoOut, smoothWheel: true });
    };
    const stopLenis = () => {
      lenis?.destroy();
      lenis = null;
    };

    const remeasure = () => {
      anchor = anchorOf(stage, frame);
      screen = window.innerHeight;
      lenis?.resize();
      setLive(liveQuery.matches);
      if (liveQuery.matches) measure(visual);
      schedule();
    };
    /** A new screen size moves the runway; keep the stage where it was. Only for real resizes of a live
        stage: a page restored mid-stage keeps its own scroll position. */
    const onResize = () => {
      const wasLive = liveQuery.matches;
      const before = (window.scrollY - anchor) / screen;
      remeasure();
      if (!wasLive || !liveQuery.matches || before <= 0 || before >= RUNWAY) return;
      const top = Math.round(anchor + before * screen);
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
    };
    const onMotion = () => {
      if (reduce.matches) stopLenis();
      else startLenis();
      schedule();
    };

    startLenis();
    remeasure();
    document.fonts?.ready.then(remeasure).catch(() => {});
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    liveQuery.addEventListener("change", remeasure);
    reduce.addEventListener("change", onMotion);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      liveQuery.removeEventListener("change", remeasure);
      reduce.removeEventListener("change", onMotion);
      stopLenis();
      toRef.current = () => {};
    };
  }, []);

  const hidden = (k: number) => live && k !== scene;
  const toFirst = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia(LIVE).matches) return;
    event.preventDefault();
    toRef.current(1);
  };

  return <section ref={stageRef} className={styles.stage} style={{ "--runway": RUNWAY } as CSSProperties} aria-labelledby="home-title">
    <div className={styles.frame} data-frame>
      <div className={styles.story}>
        <div className={`${styles.scene} ${styles.opening}`} style={textWindow(TEXT[0])} data-active={scene === 0 || undefined}>
          <h1 id="home-title" className={styles.title}>把工作交给 AutoMage，<span>规矩由你们定。</span></h1>
          <p className={styles.lead}>AutoMage 是给企业用的 AI。把一件具体的工作交给它，它从群聊和业务系统里拼齐事实，一路跟进到底；哪些事它可以自己办、哪些必须回来找人，按你们定的规矩。</p>
          <a className={styles.hint} href="#claim-work" onClick={toFirst} tabIndex={hidden(0) ? -1 : undefined}>往下看：八条消息，怎么接成一件工作 <span aria-hidden="true">↓</span></a>
          <div className={styles.still}><NoiseStill /></div>
        </div>
        {CLAIMS.map((claim, index) => {
          const k = index + 1;
          return <article key={claim.id} id={`claim-${claim.id}`} className={`${styles.scene} ${styles.claim}`} style={textWindow(TEXT[k])} data-active={scene === k || undefined}>
            <p className={styles.kicker}>{claim.kicker}{"tag" in claim && <span className={styles.dirTag}>{claim.tag}</span>}</p>
            <h2>{claim.title}</h2>
            <p className={styles.claimText}>{claim.text}</p>
            <div className={styles.still}>{k === 1 ? <WorkCard still /> : <><ChangedCard still /><Fork still /></>}</div>
          </article>;
        })}
      </div>

      <div className={styles.visual} data-visual role="group" aria-label="演示：同一件工作随这一页往下变化">
        <p className={styles.visualCaption}><span className={styles.demoChip}>演示</span>基于真实企业业务场景重构，数据与过程为模拟</p>
        <div className={styles.field} data-field aria-hidden="true">
          {FRAGMENTS.map((frag, n) => <Message key={frag.id} frag={frag} n={n} />)}
          <Message frag={CHANGE} n={0} change />
          <p className={styles.fieldNote}><b><span className={styles.demoChip}>演示</span></b>{FIELD_NOTE}</p>
        </div>
        <div className={styles.slot}>
          <div className={styles.workView} inert={live && scene !== 1}><WorkCard /></div>
          <div className={styles.changeView} inert={live && scene !== 2}><ChangedCard /><Fork /></div>
        </div>
        <p className={styles.srOnly} aria-live="polite">{scene === 0 ? "" : CLAIMS[scene - 1].status}</p>
      </div>
    </div>
  </section>;
}
