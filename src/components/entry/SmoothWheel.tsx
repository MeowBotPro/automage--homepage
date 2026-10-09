"use client";

import Lenis from "lenis";
import { useEffect } from "react";

const expoOut = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t));

/** Smooths the wheel, with the same feel as AI for Work, and nothing else. Off under reduced motion. */
export default function SmoothWheel() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    const sync = () => {
      if (reduce.matches) {
        lenis?.destroy();
        lenis = null;
      } else if (!lenis) {
        lenis = new Lenis({ autoRaf: true, duration: 1.1, easing: expoOut, smoothWheel: true });
      }
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      lenis?.destroy();
    };
  }, []);
  return null;
}
