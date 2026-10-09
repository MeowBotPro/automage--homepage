"use client";

import Lenis from "lenis";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { BEATS, BEFORE, COPY, DAYS, LINES, weekPoint } from "@/lib/home-stage";
import { Feed, LINE_TIMES, Phrases, ROWS, StillTalk, StillWorks, Talk, Works } from "./WeekField";
import styles from "./Home.module.css";

/* The homepage stage: one company's week, told twice. Without AutoMage, the state of each work lives in
   people's heads and chats, so the week is a long run of asking, passing on and chasing. With AutoMage,
   the same week: the works keep their own state, with where it came from, and the talk that only
   carried it folds away into them. What is left between people is what needs people; on Friday two
   works reach a line and arrive, with their evidence, at the person that line names.
   On wide screens the stage is a runway whose frame stays in view; the scroll position is the stage's
   progress --p, in screens, and drives everything continuously: the text, the week's talk coming in,
   the talk folding into the works, the works filling. Lenis only smooths the wheel; no input is held.
   Reduced motion gets native scrolling and each part shown settled; phones and short screens get each
   part as a still. */

const LIVE = "(min-width: 1200px) and (min-height: 620px)";
/** How far the page scrolls while the stage stays in view, in screens. */
const RUNWAY = 4.2;
/** Where each part is complete and at rest (shown as is under reduced motion). */
const REST = [0, 1.72, 3, 3.75] as const;
/** Progress at which the next part takes over: the week's talk; the same week with AutoMage; Friday. */
const SWITCH = [0.45, 1.86, 3.08] as const;
/** When each part's text comes in and goes out: [in start, in length, out start, out length]. */
const TEXT: [number, number, number, number][] = [[-1, 1, 0.36, 0.12], [0.5, 0.16, 1.8, 0.1], [1.92, 0.16, 3, 0.1], [3.1, 0.16, 99, 1]];
/** The talk scrolls back to Monday between these, when the week starts again with AutoMage. */
const REWIND = [1.82, 2.02] as const;
const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const expoOut = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** A 0→1 ramp starting at `start`, or `none` when there is no start. Matches the stylesheet's ramps. */
const ramp = (p: number, start: number | undefined, length: number, none: number) => (start === undefined ? none : clamp((p - start) / length));

/** The week's clock. Without AutoMage it follows the lines as they come in; with AutoMage, the beats.
    Each point is [progress, place in the week, time of day]. */
const BEFORE_CLOCK: [number, number, string][] = LINES.flatMap((line, i) => {
  const rv = LINE_TIMES[i].rv;
  return rv === undefined ? [] : [[rv, weekPoint(line.day, line.time), line.time ?? "12:00"] as [number, number, string]];
});
const AFTER_CLOCK: [number, number, string][] = [[REWIND[1], 0, "08:00"], ...BEATS.map((beat) => [beat.p, weekPoint(beat.day, beat.time), beat.time] as [number, number, string]), [REST[3], weekPoint(4, "11:30"), "11:30"]];

/** Where the clock is at `p` on a list of points: the place in the week runs on between points, the
    time of day shows the last point reached. */
function clockOn(points: [number, number, string][], p: number) {
  if (p <= points[0][0]) return { week: points[0][1], time: points[0][2] };
  for (let i = 1; i < points.length; i++) {
    const [p1, w1] = points[i];
    if (p < p1) {
      const [p0, w0, time] = points[i - 1];
      return { week: w0 + ((w1 - w0) * (p - p0)) / (p1 - p0), time };
    }
  }
  const last = points[points.length - 1];
  return { week: last[1], time: last[2] };
}

/** Which part a progress value shows, and the clock: the place in the week on each pass (the first
    pass stays full once the week starts again), the day the clock shows, and the time. */
function weekAt(p: number) {
  const phase = p < SWITCH[0] ? 0 : p < SWITCH[1] ? 1 : p < SWITCH[2] ? 2 : 3;
  const first = clockOn(BEFORE_CLOCK, Math.min(p, REWIND[0]));
  const second = clockOn(AFTER_CLOCK, p);
  const back = smooth(clamp((p - REWIND[0]) / (REWIND[1] - REWIND[0])));
  const shown = p < REWIND[1] ? first.week * (1 - back) : second.week;
  const day = Math.min(4, Math.floor(shown + 1e-4));
  /* The day's name rolls over only near the turn of a day, like a counter. */
  const roll = Math.min(4, day + smooth(clamp((shown - day - 0.9) / 0.1)));
  return { phase, day, roll, before: first.week, after: p < REWIND[1] ? 0 : second.week, time: back < 0.5 ? first.time : second.time };
}

/** How far the talk is scrolled up at `p`: without AutoMage the newest line stays in view; then it
    goes back to Monday; on Friday, if what is still said does not fit, the newest stays in view. */
function talkOffset(p: number, heights: number[], view: number) {
  const height = (q: number, folded: boolean) => heights.reduce((sum, h, i) => {
    const row = ROWS[i];
    if (row.kind === "day") return sum + h * (folded ? 1 : ramp(q, row.rv, BEFORE.step, 0));
    const t = LINE_TIMES[row.index];
    if (!folded) return sum + h * ramp(q, t.rv, BEFORE.step, 0);
    return sum + h * (1 - clamp((ramp(q, t.fd, 0.1, 0) - 0.3) / 0.7)) * Math.min(1, ramp(q, t.ad, 0.1, 1) / 0.7);
  }, 0);
  if (p <= REWIND[0]) return Math.max(0, height(p, false) - view);
  if (p < REWIND[1]) return Math.max(0, height(REWIND[0], false) - view) * (1 - smooth((p - REWIND[0]) / (REWIND[1] - REWIND[0])));
  if (p < SWITCH[2]) return 0;
  return Math.max(0, height(p, true) - view) * smooth(clamp((p - SWITCH[2]) / 0.15));
}

function anchorOf(stage: HTMLElement, frame: HTMLElement) {
  const head = parseFloat(getComputedStyle(frame).top) || 0;
  return Math.round(stage.getBoundingClientRect().top + window.scrollY - head);
}

const textWindow = ([si, li, so, lo]: [number, number, number, number]) => ({ "--si": si, "--li": li, "--so": so, "--lo": lo }) as CSSProperties;

export default function HomeStage() {
  const stageRef = useRef<HTMLElement>(null);
  const toRef = useRef<(part: number) => void>(() => {});
  const [week, setWeek] = useState({ phase: 0, day: 0, time: "08:00" });
  const [live, setLive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const frame = stage?.querySelector<HTMLElement>("[data-frame]");
    const field = stage?.querySelector<HTMLElement>("[data-field]");
    const talk = stage?.querySelector<HTMLElement>("[data-talk]");
    const view = talk?.parentElement;
    if (!stage || !frame || !field || !talk || !view) return;
    const liveQuery = window.matchMedia(LIVE);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let anchor = anchorOf(stage, frame);
    let screen = window.innerHeight;
    let heights: number[] = [];
    let viewHeight = 0;
    let raf = 0;
    let shown = { phase: 0, day: 0, time: "08:00" };

    const update = () => {
      raf = 0;
      if (!liveQuery.matches) return;
      const raw = clamp((window.scrollY - anchor) / screen, 0, RUNWAY);
      const part = raw < SWITCH[0] ? 0 : raw < SWITCH[1] ? 1 : raw < SWITCH[2] ? 2 : 3;
      const p = reduce.matches ? REST[part] : raw;
      stage.style.setProperty("--p", p.toFixed(4));
      view.style.setProperty("--scroll", talkOffset(p, heights, viewHeight).toFixed(1));
      const clock = weekAt(p);
      stage.style.setProperty("--week-before", clock.before.toFixed(3));
      stage.style.setProperty("--week-after", clock.after.toFixed(3));
      stage.style.setProperty("--roll", clock.roll.toFixed(3));
      if (clock.phase !== shown.phase || clock.day !== shown.day || clock.time !== shown.time) {
        shown = { phase: clock.phase, day: clock.day, time: clock.time };
        setWeek(shown);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    /* Everything that grows or folds does so between zero and its natural height, measured here. */
    const measure = () => {
      if (!liveQuery.matches) return;
      field.querySelectorAll<HTMLElement>("[data-grow]").forEach((element) => {
        const inner = element.firstElementChild as HTMLElement | null;
        if (inner) element.style.setProperty("--h", `${inner.offsetHeight}px`);
      });
      heights = [...talk.querySelectorAll<HTMLElement>("[data-row]")].map((element) => (element.firstElementChild as HTMLElement).offsetHeight);
      viewHeight = view.clientHeight;
      field.dataset.measured = "";
    };

    toRef.current = (part: number) => {
      const top = anchor + REST[part] * screen;
      if (lenis) lenis.scrollTo(top, { duration: 1.6 });
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
      measure();
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

  const hidden = (k: number) => live && k !== week.phase;
  const toWeek = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia(LIVE).matches) return;
    event.preventDefault();
    toRef.current(1);
  };
  const mode = week.phase <= 1 ? "没有 AutoMage 时" : "有了 AutoMage · 同一周";
  const clock = <div className={styles.clock} aria-hidden="true">
    <p className={styles.clockMode}><span className={styles.demoChip}>示例</span>{mode}</p>
    <p className={styles.clockNow}>
      <span className={styles.odometer}><span>{DAYS.map((d) => <i key={d}>{d}</i>)}</span></span>
      <time>{week.time}</time>
    </p>
    <div className={styles.strip}>
      <span className={styles.track}><i data-pass="before" /><i data-pass="after" /></span>
      <ol>{DAYS.map((d, i) => <li key={d} data-on={i === week.day || undefined}>{d}</li>)}</ol>
    </div>
  </div>;

  return <section ref={stageRef} className={styles.stage} style={{ "--runway": RUNWAY } as CSSProperties} data-phase={week.phase} aria-labelledby="home-title">
    <div className={styles.frame} data-frame>
      <div className={styles.story}>
        {clock}
        <div className={`${styles.part} ${styles.opening}`} style={textWindow(TEXT[0])} data-active={week.phase === 0 || undefined}>
          <p className={styles.kicker}>AI for Work · 新公司运行模式</p>
          <h1 id="home-title" className={styles.title}>{COPY.title[0]}<br />{COPY.title[1]}</h1>
          <p className={styles.category}>{COPY.category}</p>
          <a className={styles.hint} href="#home-week" onClick={toWeek} tabIndex={hidden(0) ? -1 : undefined}>{COPY.hint} <span aria-hidden="true">↓</span></a>
          <div className={styles.still}><Phrases /></div>
        </div>
        <article id="home-week" className={styles.part} style={textWindow(TEXT[1])} data-active={week.phase === 1 || undefined}>
          <p className={styles.kicker}>{COPY.before.kicker}</p>
          <h2>{COPY.before.title}</h2>
          <p className={styles.partText}>{COPY.before.text}</p>
          <div className={styles.still}>
            <p className={styles.stillCaption}><span className={styles.demoChip}>示例</span>想知道客户 A 那批货哪天到</p>
            <StillTalk mode="before" />
            <p className={styles.stillCaption}>这一周，这几件事的进展在哪</p>
            <StillWorks mode="before" />
          </div>
        </article>
        <article className={styles.part} style={textWindow(TEXT[2])} data-active={week.phase === 2 || undefined}>
          <p className={styles.kicker}>{COPY.after.kicker}</p>
          <h2>{COPY.after.title}</h2>
          <p className={styles.partText}>{COPY.after.text}</p>
          <div className={styles.still}>
            <p className={styles.stillNote}>上面那一串九句传话，这一周不用说了：它直接问了供应商，回复连同出处记在“客户 A 的订单”上。</p>
            <p className={styles.stillCaption}><span className={styles.demoChip}>示例</span>同一周，到周四，记在工作上的</p>
            <StillWorks mode="after" />
          </div>
        </article>
        <article className={styles.part} style={textWindow(TEXT[3])} data-active={week.phase === 3 || undefined}>
          <p className={styles.kicker}>{COPY.friday.kicker}</p>
          <h2>{COPY.friday.title}</h2>
          <p className={styles.partText}>{COPY.friday.text}</p>
          <div className={styles.still}>
            <p className={styles.stillCaption}><span className={styles.demoChip}>示例</span>同一周，大家还在说的</p>
            <StillTalk mode="friday" />
          </div>
        </article>
      </div>

      <div className={styles.field} data-field aria-hidden="true">
        <Feed />
        <div className={styles.columns}>
          <section className={styles.talk}>
            <h3 className={styles.colHead}>大家说的话</h3>
            <div className={styles.talkWindow}><Talk /></div>
          </section>
          <section className={styles.works}>
            <h3 className={styles.colHead}>每件事的进展</h3>
            <Works />
          </section>
        </div>
      </div>
      <p className={styles.srOnly} aria-live="polite">{COPY.status[week.phase]}</p>
    </div>
  </section>;
}
