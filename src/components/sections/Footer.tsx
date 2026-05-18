'use client';

import { useRef, useMemo, useEffect } from 'react';
import { gsap, safeContext, motionPathTo } from '@/lib/gsap';
import { useParticles } from '@/hooks/useParticles';
import type { PathConfig } from '@/hooks/useParticles';

/* ------------------------------------------------------------------ */
/*  Network geometry                                                   */
/* ------------------------------------------------------------------ */

const NETWORK_W = 1440;
const NETWORK_H = 800;

function generateNodes(): { x: number; y: number }[] {
  return [
    { x: 120, y: 80 }, { x: 360, y: 180 }, { x: 640, y: 60 },
    { x: 900, y: 200 }, { x: 1200, y: 100 }, { x: 200, y: 350 },
    { x: 500, y: 420 }, { x: 780, y: 320 }, { x: 1050, y: 380 },
    { x: 1320, y: 280 },
  ];
}

function generateNetworkPaths(nodes: { x: number; y: number }[]): string[] {
  const connections: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [5, 6], [6, 7], [7, 8], [8, 9],
    [0, 5], [1, 6], [3, 8], [4, 9],
  ];
  return connections.map(([a, b]) => {
    const ax = nodes[a].x, ay = nodes[a].y;
    const bx = nodes[b].x, by = nodes[b].y;
    const mx = (ax + bx) / 2;
    const dy = (by - ay) * 0.4;
    return `M${ax},${ay} C${ax + (mx - ax) * 0.5},${ay + dy} ${bx - (bx - mx) * 0.5},${by - dy} ${bx},${by}`;
  });
}

const NET_NODES = generateNodes();
const PATH_D_LIST = generateNetworkPaths(NET_NODES);

/* ------------------------------------------------------------------ */
/*  Loop Seal geometry                                                 */
/* ------------------------------------------------------------------ */

const RING_CX = 260;
const RING_CY = 260;
const RING_R = 180;

const LOOP_STEPS = [
  { label: 'Signal',   angle: -90 },
  { label: 'Compress', angle: -30 },
  { label: 'Review',   angle: 30 },
  { label: 'Decide',   angle: 90 },
  { label: 'Execute',  angle: 150 },
  { label: 'Learn',    angle: 210 },
];

const LOOP_NODES = LOOP_STEPS.map((s) => {
  const rad = (s.angle * Math.PI) / 180;
  return { ...s, x: RING_CX + RING_R * Math.cos(rad), y: RING_CY + RING_R * Math.sin(rad) };
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const FOOTER_HEIGHT = '100vh';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const orbitPathRef = useRef<SVGCircleElement>(null);
  const nodeRefs = useRef<SVGGElement[]>([]);
  const signalDotRef = useRef<SVGCircleElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const btnContainerRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const particlePaths: PathConfig[] = useMemo(
    () => PATH_D_LIST.map((_, i) => ({
      id: `net-${i}`,
      pathSelector: `[data-net-path="${i}"]`,
      speed: [5, 9],
    })),
    [],
  );

  useParticles(
    svgRef,
    {
      paths: particlePaths,
      particlesPerPath: 1,
      radius: [1.5, 3],
      color: '#3B82F6',
      opacity: [0.15, 0.25],
    },
    [prefersReducedMotion],
  );

  /* -- GSAP animations -- */
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const ctx = safeContext(() => {

      if (prefersReducedMotion) {
        // Reduced motion: show final state immediately
        nodeRefs.current.forEach((node) => {
          if (node) {
            const outer = node.querySelector<SVGCircleElement>('.node-outer');
            const inner = node.querySelector<SVGCircleElement>('.node-inner');
            if (outer) gsap.set(outer, { attr: { r: 18 }, opacity: 0.2 });
            if (inner) gsap.set(inner, { attr: { r: 6 }, opacity: 1 });
          }
        });
        gsap.set([titleRef.current, subtitleRef.current], { opacity: 1, y: 0 });
        if (btnContainerRef.current) {
          const btns = Array.from(btnContainerRef.current.querySelectorAll('a'));
          gsap.set(btns, { opacity: 1, scale: 1 });
        }
        return;
      }

      const orbitLen = 2 * Math.PI * RING_R;
      if (orbitPathRef.current) {
        gsap.set(orbitPathRef.current, {
          strokeDasharray: orbitLen,
          strokeDashoffset: orbitLen,
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footer,
          start: 'top 80%',
          end: 'top 10%',
          scrub: 0.6,
        },
      });

      // 1. Draw orbit path
      if (orbitPathRef.current) {
        tl.to(orbitPathRef.current, {
          strokeDashoffset: 0,
          duration: 0.5,
          ease: 'none',
        }, 0);
      }

      // 2. Light up nodes sequentially
      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        const outer = node.querySelector<SVGCircleElement>('.node-outer');
        const inner = node.querySelector<SVGCircleElement>('.node-inner');
        if (!outer || !inner) return;

        const start = 0.05 + i * 0.08;
        tl.fromTo(outer,
          { attr: { r: 8 }, opacity: 0 },
          { attr: { r: 18 }, opacity: 0.2, duration: 0.08, ease: 'power2.out' },
          start,
        );
        tl.fromTo(inner,
          { attr: { r: 0 }, opacity: 0 },
          { attr: { r: 6 }, opacity: 1, duration: 0.08, ease: 'back.out(2)' },
          start + 0.02,
        );
      });

      // 3. Signal dot travels along orbit (native SVG path)
      if (signalDotRef.current && orbitPathRef.current) {
        const dot = signalDotRef.current;
        const orbitEl = orbitPathRef.current;
        const orbitProgress = { value: 0 };

        tl.fromTo(dot,
          { opacity: 0 },
          { opacity: 0.9, duration: 0.05, ease: 'power1.in' },
          0.05,
        );
        tl.fromTo(orbitProgress,
          { value: 0 },
          { value: 1, duration: 0.6, ease: 'none' },
          0.05,
        );
        // Update dot position at each step
        for (let step = 0.05; step <= 0.65; step += 0.01) {
          tl.call(() => {
            const point = orbitEl.getPointAtLength(orbitProgress.value * orbitEl.getTotalLength());
            dot.setAttribute('cx', String(point.x));
            dot.setAttribute('cy', String(point.y));
          }, undefined, step);
        }
        tl.to(dot,
          { opacity: 0, duration: 0.05, ease: 'power1.in' },
          0.65,
        );
      }

      // 4. Text fade in
      tl.fromTo(titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' },
        0.55,
      );
      tl.fromTo(subtitleRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' },
        0.6,
      );

      // 5. Buttons fade in
      if (btnContainerRef.current) {
        const btns = btnContainerRef.current.querySelectorAll('a');
        tl.fromTo(btns,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out', stagger: 0.05 },
          0.7,
        );
      }

      // 6. Footer bar links
      const links = footer.querySelectorAll('.footer-link');
      tl.fromTo(links,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.03, duration: 0.1, ease: 'power2.out' },
        0.8,
      );
    }, footer);

    return () => ctx.revert();
  }, []);

  const handleBtnEnter = (e: React.MouseEvent<HTMLAnchorElement>, baseBg: string) => {
    e.currentTarget.style.transform = 'scale(1.02)';
    e.currentTarget.style.background = baseBg === '#FFFFFF' ? '#E2E8F0' : 'rgba(255,255,255,0.1)';
    e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.15)';
  };
  const handleBtnLeave = (e: React.MouseEvent<HTMLAnchorElement>, baseBg: string) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.background = baseBg;
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <footer
      ref={footerRef}
      className="site-footer"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 0,
        background: 'var(--color-surface-dark)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* -- Particle network background -- */}
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        viewBox={`0 0 ${NETWORK_W} ${NETWORK_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        aria-hidden="true"
        suppressHydrationWarning
      >
        {PATH_D_LIST.map((d, i) => (
          <path key={i} d={d} fill="none" style={{ stroke: 'var(--color-brand-accent)' }} strokeWidth={1} opacity={0.06} data-net-path={i} />
        ))}
        {NET_NODES.map((node, i) => (
          <circle key={i} cx={node.x} cy={node.y} r={3} style={{ fill: 'var(--color-brand-accent)' }} opacity={0.08} />
        ))}
      </svg>

      {/* -- Slogan (top) -- */}
      <div
        className="relative w-full text-center"
        style={{ zIndex: 1, paddingTop: 'clamp(60px, 10vh, 120px)' }}
      >
        <p
          style={{
            fontFamily: 'var(--font-console)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'var(--color-glyph-stroke)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Close the Loop
        </p>
        <h2
          ref={titleRef}
          className="font-semibold"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            color: 'var(--color-text-on-dark)',
            lineHeight: 1.15,
            opacity: 0,
          }}
        >
          让组织信息，最终回到行动
        </h2>
        <p
          ref={subtitleRef}
          style={{
            marginTop: 20,
            fontSize: '1rem',
            color: 'var(--color-text-on-dark-muted)',
            lineHeight: 1.7,
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
            opacity: 0,
          }}
        >
          AutoMage 把一线信号压缩成判断，把决策回流成任务，让每一步都有负责人、截止时间和追踪记录。
        </p>
        <div
          ref={btnContainerRef}
          className="flex flex-wrap justify-center"
          style={{ marginTop: 36, gap: 16 }}
        >
          <a
            href="#"
            className="font-medium cursor-pointer"
            style={{
              background: '#FFFFFF',
              color: 'var(--color-surface-dark)',
              padding: '14px 36px',
              borderRadius: 'var(--radius-md)',
              transition: 'transform 200ms ease, background 200ms ease, box-shadow 200ms ease',
              opacity: 0,
            }}
            onMouseEnter={(e) => handleBtnEnter(e, '#FFFFFF')}
            onMouseLeave={(e) => handleBtnLeave(e, '#FFFFFF')}
          >
            预约演示
          </a>
          <a
            href="#"
            className="font-medium cursor-pointer"
            style={{
              background: 'transparent',
              color: 'var(--color-text-on-dark)',
              padding: '14px 36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'transform 200ms ease, background 200ms ease, box-shadow 200ms ease',
              opacity: 0,
            }}
            onMouseEnter={(e) => handleBtnEnter(e, 'transparent')}
            onMouseLeave={(e) => handleBtnLeave(e, 'transparent')}
          >
            联系我们
          </a>
        </div>
      </div>

      {/* -- Loop Seal (center, fills remaining space) -- */}
      <div
        className="flex-1 flex items-center justify-center relative"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      >
        <svg
          width={RING_CX * 2}
          height={RING_CY * 2}
          viewBox={`0 0 ${RING_CX * 2} ${RING_CY * 2}`}
          fill="none"
          style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}
        >
          {/* Orbit path */}
          <circle
            ref={orbitPathRef}
            cx={RING_CX}
            cy={RING_CY}
            r={RING_R}
            style={{ stroke: 'var(--color-brand-accent)' }}
            strokeWidth={1.5}
            opacity={0.25}
            fill="none"
          />

          {/* Nodes */}
          {LOOP_NODES.map((node, i) => (
            <g
              key={node.label}
              ref={(el) => { if (el) nodeRefs.current[i] = el; }}
            >
              <circle
                className="node-outer"
                cx={node.x}
                cy={node.y}
                r={8}
                style={{ fill: 'var(--color-brand-accent)' }}
                opacity={0}
              />
              <circle
                className="node-inner"
                cx={node.x}
                cy={node.y}
                r={0}
                style={{ fill: 'var(--color-glyph-stroke)' }}
                opacity={0}
              />
              <text
                x={node.x}
                y={node.y + (node.y > RING_CY ? 32 : -22)}
                textAnchor="middle"
                style={{ fill: 'var(--color-text-on-dark-muted)' }}
                fontSize="11"
                fontFamily="var(--font-console)"
                letterSpacing="0.04em"
              >
                {node.label}
              </text>
            </g>
          ))}

          {/* Signal dot */}
          <circle
            ref={signalDotRef}
            cx={RING_CX}
            cy={RING_CY - RING_R}
            r={5}
            style={{ fill: 'var(--color-brand-accent)' }}
            opacity={0}
          />
        </svg>
      </div>

      {/* -- Decision Receipt + Footer bar (bottom) -- */}
      <div
        className="relative w-full"
        style={{ zIndex: 1 }}
      >
        {/* Decision Receipt */}
        <div
          className="mx-auto"
          style={{
            maxWidth: 560,
            margin: '0 auto 20px',
            padding: '0 24px',
          }}
        >
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-console)',
                fontSize: '0.7rem',
                letterSpacing: '0.06em',
                color: 'var(--color-text-tertiary)',
                marginBottom: 10,
              }}
            >
              Decision Receipt #AM-2026
            </div>
            {[
              ['Signal intake', 'Completed'],
              ['Human approval', 'Required'],
              ['Execution loop', 'Active'],
              ['Audit trail', 'Enabled'],
            ].map(([key, val]) => (
              <div
                key={key}
                className="flex justify-between items-center"
                style={{
                  fontFamily: 'var(--font-console)',
                  fontSize: '0.7rem',
                  padding: '3px 0',
                }}
              >
                <span style={{ color: 'var(--color-text-tertiary)' }}>{key}</span>
                <span style={{ color: 'var(--color-brand-accent)' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '20px 24px 28px',
          }}
        >
          <div
            className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ maxWidth: 1200 }}
          >
            <span
              className="font-semibold footer-link"
              style={{ color: 'var(--color-text-on-dark)', fontSize: '1rem' }}
            >
              AutoMage
            </span>
            <div className="flex flex-wrap justify-center" style={{ gap: 24 }}>
              {['隐私政策', '使用条款', '联系我们'].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="cursor-pointer footer-link"
                  style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem', transition: 'color 200ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-on-dark)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
                >
                  {label}
                </a>
              ))}
            </div>
            <span className="footer-link" style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>
              &copy; 2026 AutoMage. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
