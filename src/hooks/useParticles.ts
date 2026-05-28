'use client';

import { useEffect } from 'react';
import { gsap, safeContext, motionPathTo } from '@/lib/gsap';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PathConfig {
  id: string;
  /** CSS selector relative to the SVG container, e.g. `[data-motion-path="p1"]` */
  pathSelector: string;
  /** Min / max animation duration (seconds) – each particle is randomised */
  speed: [number, number];
}

export interface ParticleConfig {
  paths: PathConfig[];
  /** Particles spawned per path. Default 1. */
  particlesPerPath?: number;
  /** Circle radius range. Default [3, 5]. */
  radius?: [number, number];
  /** Fill colour. Default '#3B82F6'. */
  color?: string;
  /** Opacity range while visible. Default [0.3, 0.6]. */
  opacity?: [number, number];
  /** Number of trailing circles behind each particle. Default 0. */
  trailCount?: number;
  /** Time offset (seconds) between each trail element. Default 0.08. */
  trailDelay?: number;
  /** Radius multiplier per successive trail. Default 0.6. */
  trailScale?: number;
  /** Opacity multiplier per successive trail. Default 0.3. */
  trailOpacity?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * Spawns SVG circle particles that travel along `<path>` elements inside the
 * given SVG container using native SVG path geometry (no MotionPathPlugin).
 */
export function useParticles(
  svgRef: React.RefObject<SVGSVGElement | null>,
  config: ParticleConfig,
  deps?: readonly unknown[],
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    const svg = svgRef.current;
    if (!svg) return;

    const ctx = safeContext(() => {
      const {
        paths,
        particlesPerPath = 1,
        radius: radiusRange = [3, 5],
        color = '#3B82F6',
        opacity: opacityRange = [0.3, 0.6],
        trailCount = 0,
        trailDelay = 0.08,
        trailScale = 0.6,
        trailOpacity = 0.3,
      } = config;

      /* -- Build timeline ------------------------------------------ */
      const tl = gsap.timeline({ repeat: -1, delay: 0.5 });

      /* -- Populate particles -------------------------------------- */
      paths.forEach((pathCfg, pathIdx) => {
        const pathEl = svg.querySelector<SVGGeometryElement>(pathCfg.pathSelector);
        if (!pathEl) return;

        for (let p = 0; p < particlesPerPath; p++) {
          const speed = rand(pathCfg.speed[0], pathCfg.speed[1]);
          const r = rand(radiusRange[0], radiusRange[1]);
          const peakOpacity = rand(opacityRange[0], opacityRange[1]);
          const offset = pathIdx * 0.4 + p * 0.25;

          /* -- Main particle --------------------------------------- */
          const ns = 'http://www.w3.org/2000/svg';
          const circle = document.createElementNS(ns, 'circle');
          circle.setAttribute('r', String(r));
          circle.setAttribute('fill', color);
          circle.setAttribute('opacity', '0');
          svg.appendChild(circle);

          // Use native SVG path animation
          const progress = { value: 0 };
          const pathAnim = motionPathTo(circle, pathEl, progress);
          if (!pathAnim) continue;

          // Animate progress from 0 to 1
          tl.fromTo(
            progress,
            { value: 0 },
            {
              value: 1,
              duration: speed,
              ease: 'none',
              delay: offset,
              onUpdate: pathAnim.update,
            },
            0,
          );
          tl.fromTo(
            circle,
            { opacity: 0 },
            { opacity: peakOpacity, duration: 0.3 },
            offset,
          );
          tl.to(
            circle,
            { opacity: 0, duration: 0.3 },
            offset + speed - 0.3,
          );

          /* -- Trail particles ------------------------------------- */
          for (let t = 1; t <= trailCount; t++) {
            const trail = document.createElementNS(ns, 'circle');
            trail.setAttribute('r', String(r * Math.pow(trailScale, t)));
            trail.setAttribute('fill', color);
            trail.setAttribute('opacity', '0');
            svg.appendChild(trail);

            const trailPeak = peakOpacity * Math.pow(trailOpacity, t);
            const trailOffset = offset + t * trailDelay;

            const trailProgress = { value: 0 };
            const trailAnim = motionPathTo(trail, pathEl, trailProgress);
            if (!trailAnim) continue;

            tl.fromTo(
              trailProgress,
              { value: 0 },
              {
                value: 1,
                duration: speed,
                ease: 'none',
                delay: trailOffset,
                onUpdate: trailAnim.update,
              },
              0,
            );
            tl.fromTo(
              trail,
              { opacity: 0 },
              { opacity: trailPeak, duration: 0.3 },
              trailOffset,
            );
            tl.to(
              trail,
              { opacity: 0, duration: 0.3 },
              trailOffset + speed - 0.3,
            );
          }
        }
      });
    }, svg);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ? [...deps] : []);
}
