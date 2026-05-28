'use client';

import { useEffect, useRef, createContext, useContext } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from '@/lib/gsap';

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    // Sync Lenis → ScrollTrigger (try/catch for Turbopack MotionPathPlugin crashes)
    lenis.on('scroll', () => {
      try { ScrollTrigger.update(); } catch { /* MotionPathPlugin crash in Turbopack */ }
    });

    // Native RAF loop — avoids gsap.ticker which is broken in Turbopack
    let rafId: number;
    function loop(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
