'use client';

import { useRef } from 'react';
import { useSyncExternalStore } from 'react';
import { useParticles, type PathConfig } from '@/hooks/useParticles';

/* ------------------------------------------------------------------ */
/*  Path definitions (viewBox 0 0 1920 1080)                           */
/* ------------------------------------------------------------------ */

const DESKTOP_PATHS: PathConfig[] = [
  { id: 'pp1', pathSelector: '[data-pp="1"]', speed: [3, 5] },
  { id: 'pp2', pathSelector: '[data-pp="2"]', speed: [3, 5] },
  { id: 'pp3', pathSelector: '[data-pp="3"]', speed: [3, 5] },
  { id: 'pp4', pathSelector: '[data-pp="4"]', speed: [3, 5] },
  { id: 'pp5', pathSelector: '[data-pp="5"]', speed: [3, 5] },
];

const MOBILE_PATHS: PathConfig[] = [
  { id: 'pp1', pathSelector: '[data-pp="1"]', speed: [3, 5] },
  { id: 'pp3', pathSelector: '[data-pp="3"]', speed: [3, 5] },
  { id: 'pp5', pathSelector: '[data-pp="5"]', speed: [3, 5] },
];

const PATH_D = [
  'M 200,0 C 250,200 150,400 220,600 S 180,800 200,1080',
  'M 600,0 C 550,180 680,350 620,540 S 700,750 640,1080',
  'M 960,0 C 1000,250 920,450 980,650 S 900,850 960,1080',
  'M 1300,0 C 1350,220 1250,420 1320,620 S 1280,820 1300,1080',
  'M 1700,0 C 1650,300 1750,500 1680,700 S 1720,900 1700,1080',
] as const;

/* ------------------------------------------------------------------ */
/*  Responsive hook                                                     */
/* ------------------------------------------------------------------ */

function useIsDesktop() {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(min-width: 1024px)');
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    () => window.matchMedia('(min-width: 1024px)').matches,
    () => false,
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function PageParticles() {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDesktop = useIsDesktop();

  const paths = isDesktop ? DESKTOP_PATHS : MOBILE_PATHS;

  useParticles(
    svgRef,
    {
      paths,
      particlesPerPath: isDesktop ? 2 : 1,
      radius: [2, 4],
      color: '#3B82F6',
      opacity: [0.2, 0.5],
      trailCount: 1,
      trailDelay: 0.08,
      trailScale: 0.6,
      trailOpacity: 0.3,
    },
    [isDesktop],
  );

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1920 1080"
      preserveAspectRatio="none"
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {PATH_D.map((d, i) => (
        <path
          key={i}
          data-pp={i + 1}
          d={d}
          fill="none"
          style={{ stroke: 'var(--color-brand-accent)' }}
          strokeWidth={1}
          opacity={0.06}
        />
      ))}
    </svg>
  );
}
