"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** Wide enough for a part to stay in view while the page scrolls past it. Below this it is a still. */
export const LIVE = "(min-width: 1200px) and (min-height: 620px)";

/** A part of the page that stays in view while the page scrolls past it, as on AI for Work: the scroll
    position becomes its progress --p, in screens from 0 to `runway`, and the stylesheet draws every
    state from it. Progress only follows the scroll; no input is held. Reduced motion shows the nearest
    settled state (`rest`) instead of the frames between. Below LIVE nothing is set and the
    stylesheet shows the part as a still. The frame that stays in view is the `[data-frame]` child. */
export default function ScrollStage({ id, runway, rest, className, labelledBy, children }: {
  id?: string;
  runway: number;
  rest: readonly number[];
  className: string;
  labelledBy: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const restKey = rest.join(",");

  useEffect(() => {
    const stage = ref.current;
    const frame = stage?.querySelector<HTMLElement>("[data-frame]");
    if (!stage || !frame) return;
    const points = restKey.split(",").map(Number);
    const live = window.matchMedia(LIVE);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let anchor = 0;
    let screen = 1;
    let raf = 0;

    const settled = (raw: number) => points.reduce((best, point) => (Math.abs(point - raw) < Math.abs(best - raw) ? point : best), points[0]);
    const update = () => {
      raf = 0;
      if (!live.matches) {
        stage.style.removeProperty("--p");
        return;
      }
      const raw = Math.min(runway, Math.max(0, (window.scrollY - anchor) / screen));
      stage.style.setProperty("--p", (reduce.matches ? settled(raw) : raw).toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    /* The frame sticks below the header; progress 0 is when the stage's top reaches that line. */
    const measure = () => {
      const head = parseFloat(getComputedStyle(frame).top) || 0;
      anchor = stage.getBoundingClientRect().top + window.scrollY - head;
      screen = window.innerHeight;
      schedule();
    };

    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    const resized = new ResizeObserver(measure);
    resized.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    live.addEventListener("change", measure);
    reduce.addEventListener("change", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      resized.disconnect();
      window.removeEventListener("scroll", schedule);
      live.removeEventListener("change", measure);
      reduce.removeEventListener("change", schedule);
    };
  }, [runway, restKey]);

  return <section ref={ref} id={id} className={className} style={{ "--runway": runway } as CSSProperties} aria-labelledby={labelledBy}>
    {children}
  </section>;
}
