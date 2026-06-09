'use client';

import { useRef, useEffect } from 'react';
import { gsap, safeContext } from '@/lib/gsap';

/* ── Mini System Diagrams ── */

function FidelityDiagram() {
  return (
    <svg className="am-mini-diagram am-fidelity" viewBox="0 0 180 64" fill="none" aria-hidden="true">
      <circle className="am-node input n1" cx="18" cy="16" r="4" />
      <circle className="am-node input n2" cx="18" cy="32" r="4" />
      <circle className="am-node input n3" cx="18" cy="48" r="4" />

      <path className="am-path p1" d="M24 16C52 16 58 32 86 32" />
      <path className="am-path p2" d="M24 32H86" />
      <path className="am-path p3" d="M24 48C52 48 58 32 86 32" />

      <rect className="am-core" x="86" y="20" width="28" height="24" rx="12" />
      <path className="am-core-mark" d="M94 32H106" />

      <path className="am-path out" d="M114 32H148" />
      <circle className="am-node output" cx="158" cy="32" r="6" />
      <path className="am-check" d="M154.5 32L157.5 35L163 28.5" />
    </svg>
  );
}

function CompressionDiagram() {
  return (
    <svg className="am-mini-diagram am-compression" viewBox="0 0 180 64" fill="none" aria-hidden="true">
      <path className="am-data-line l1" d="M16 14H62" />
      <path className="am-data-line l2" d="M16 26H62" />
      <path className="am-data-line l3" d="M16 38H62" />
      <path className="am-data-line l4" d="M16 50H62" />

      <rect className="am-core tall" x="70" y="12" width="32" height="40" rx="14" />
      <circle className="am-core-dot" cx="86" cy="32" r="4" />

      <path className="am-path out" d="M102 32H128" />

      <rect className="am-brief" x="132" y="18" width="30" height="28" rx="8" />
      <path className="am-brief-line" d="M140 27H154" />
      <path className="am-brief-line short" d="M140 35H150" />
    </svg>
  );
}

function AuditDiagram() {
  return (
    <svg className="am-mini-diagram am-audit" viewBox="0 0 180 64" fill="none" aria-hidden="true">
      <path className="am-audit-path" d="M20 18H70C92 18 94 46 120 46H150" />

      <circle className="am-node checkpoint c1" cx="20" cy="18" r="5" />
      <circle className="am-node checkpoint c2" cx="78" cy="18" r="5" />
      <circle className="am-node checkpoint c3" cx="120" cy="46" r="5" />

      <circle className="am-seal-bg" cx="152" cy="46" r="11" />
      <path className="am-check" d="M147 46L151 50L158 41" />
    </svg>
  );
}

/* ── Card Data ── */

interface ValueCard {
  title: string;
  subtitle: string;
  diagram: React.ReactNode;
}

const VALUE_CARDS: ValueCard[] = [
  {
    title: '更少失真',
    subtitle: '一线信息直达决策层，不经过层层过滤',
    diagram: <FidelityDiagram />,
  },
  {
    title: '更快判断',
    subtitle: 'AI 压缩信息，管理者只做判断',
    diagram: <CompressionDiagram />,
  },
  {
    title: '可追踪执行',
    subtitle: '决策自动落地，每一步都有记录',
    diagram: <AuditDiagram />,
  },
];

/* ── Helpers ── */

function setLineAttr(
  el: SVGLineElement | undefined,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  if (!el) return;
  el.setAttribute('x1', String(Math.round(x1)));
  el.setAttribute('y1', String(Math.round(y1)));
  el.setAttribute('x2', String(Math.round(x2)));
  el.setAttribute('y2', String(Math.round(y2)));
}

function positionConnectionLines(grid: HTMLElement) {
  const svg = grid.querySelector<SVGSVGElement>('.conn-lines-svg');
  if (!svg) return;

  const cards = grid.querySelectorAll<HTMLElement>('.value-card');
  if (cards.length < 3) return;

  const w = grid.offsetWidth;
  const h = grid.offsetHeight;
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  const gridRect = grid.getBoundingClientRect();
  const rects = Array.from(cards).map((card) => {
    const r = card.getBoundingClientRect();
    return {
      left: r.left - gridRect.left,
      top: r.top - gridRect.top,
      right: r.right - gridRect.left,
      bottom: r.bottom - gridRect.top,
      cx: (r.left + r.right) / 2 - gridRect.left,
      cy: (r.top + r.bottom) / 2 - gridRect.top,
    };
  });

  const lines = svg.querySelectorAll<SVGLineElement>('.conn-line');
  const isTwoCol = rects[1].cx > rects[0].cx + 10;

  if (isTwoCol) {
    setLineAttr(lines[0], rects[0].right, rects[0].cy, rects[1].left, rects[1].cy);
    setLineAttr(lines[1], rects[1].right, rects[1].cy, rects[2].left, rects[2].cy);
    setLineAttr(lines[2], 0, 0, 0, 0);
  } else {
    for (let i = 0; i < 2; i++) {
      setLineAttr(
        lines[i],
        rects[i].cx,
        rects[i].bottom,
        rects[i + 1].cx,
        rects[i + 1].top,
      );
    }
    setLineAttr(lines[2], 0, 0, 0, 0);
  }
}

/* ── Section ── */

export default function ValueCardsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    positionConnectionLines(grid);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = safeContext(() => {
      const cards = section.querySelectorAll<HTMLElement>('.value-card');

      if (reduced) {
        gsap.set(cards, { opacity: 1, scale: 1 });
        const connLines = section.querySelectorAll<SVGLineElement>('.conn-line');
        gsap.set(connLines, { opacity: 0.06 });
        return;
      }

      gsap.set(cards, { opacity: 0, scale: 0.95 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      cards.forEach((card, i) => {
        tl.to(
          card,
          { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
          i * 0.12,
        );
      });

      const connLines = Array.from(
        section.querySelectorAll<SVGLineElement>('.conn-line'),
      );
      gsap.set(connLines, { opacity: 0 });
      tl.to(
        connLines,
        { opacity: 0.06, duration: 0.6, ease: 'power2.out' },
        0.6,
      );
    }, section);
    ctxRef.current = ctx;

    const onResize = () => positionConnectionLines(grid);
    window.addEventListener('resize', onResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section
      id="section-value"
      ref={sectionRef}
      className="am-narrative-section"
      style={{
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
        background: 'transparent',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <h2
          className="font-semibold text-center"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--color-text-on-dark)',
            lineHeight: 1.1,
            marginBottom: 64,
          }}
        >
          你关心的，我们已经想过了
        </h2>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ position: 'relative' }}
        >
          <svg
            className="conn-lines-svg"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            {[0, 1, 2].map((i) => (
              <line
                key={i}
                className="conn-line"
                x1="0" y1="0" x2="0" y2="0"
                stroke="var(--color-brand-primary)"
                strokeDasharray="4 8"
                strokeWidth="1"
                opacity={0}
              />
            ))}
          </svg>

          {VALUE_CARDS.map((card) => (
            <div
              key={card.title}
              className="value-card p-6 md:p-8"
              style={{
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(11, 22, 40, 0.88))',
                border: '1px solid rgba(148, 163, 184, 0.16)',
                borderTop: '3px solid var(--color-brand-accent)',
                borderRadius: 'var(--radius-md)',
                cursor: 'default',
                transition: 'transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out)',
                position: 'relative',
                zIndex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="am-card-visual">
                {card.diagram}
              </div>
              <h3
                className="font-semibold"
                style={{
                  fontSize: '1.25rem',
                  color: 'var(--color-text-on-dark)',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--color-text-on-dark-muted)',
                  marginTop: 8,
                }}
              >
                {card.subtitle}
              </p>
            </div>
          ))}
        </div>

        <style>{`
          .am-card-visual {
            width: 100%;
            height: 76px;
            margin-bottom: 22px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(circle at 30% 20%, rgba(96, 165, 250, 0.18), transparent 42%),
              linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(8, 17, 31, 0.72));
            border: 1px solid rgba(96, 165, 250, 0.20);
          }

          .am-mini-diagram {
            width: 180px;
            height: 64px;
            overflow: visible;
          }

          .am-mini-diagram .am-path,
          .am-mini-diagram .am-data-line,
          .am-mini-diagram .am-audit-path {
            fill: none;
            stroke: var(--color-glyph-stroke);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .am-mini-diagram .am-data-line {
            stroke: var(--color-glyph-stroke-light);
          }

          .am-mini-diagram .am-node {
            fill: var(--color-glyph-stroke);
          }

          .am-mini-diagram .input {
            fill: var(--color-glyph-stroke-light);
          }

          .am-mini-diagram .output,
          .am-mini-diagram .checkpoint {
            fill: var(--color-glyph-stroke-deep);
          }

          .am-mini-diagram .am-core {
            fill: rgba(37, 99, 235, 0.08);
            stroke: var(--color-glyph-stroke-deep);
            stroke-width: 1.5;
          }

          .am-mini-diagram .am-core-mark,
          .am-mini-diagram .am-check,
          .am-mini-diagram .am-brief-line {
            fill: none;
            stroke: var(--color-glyph-stroke-deep);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .am-mini-diagram .am-core-dot {
            fill: var(--color-glyph-stroke-deep);
          }

          .am-mini-diagram .am-brief {
            fill: var(--color-glyph-fill);
            stroke: var(--color-glyph-stroke-deep);
            stroke-width: 1.5;
          }

          .am-mini-diagram .am-seal-bg {
            fill: var(--color-glyph-fill);
            stroke: var(--color-glyph-stroke-deep);
            stroke-width: 1.5;
          }

          /* Animation */
          .am-mini-diagram .am-path,
          .am-mini-diagram .am-data-line,
          .am-mini-diagram .am-audit-path {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: amLineDraw 2.8s ease-in-out infinite;
          }

          .am-mini-diagram .p2,
          .am-mini-diagram .l2 {
            animation-delay: 0.12s;
          }

          .am-mini-diagram .p3,
          .am-mini-diagram .l3 {
            animation-delay: 0.24s;
          }

          .am-mini-diagram .l4 {
            animation-delay: 0.36s;
          }

          .am-mini-diagram .am-node,
          .am-mini-diagram .am-core-dot {
            transform-origin: center;
            animation: amNodePulse 2.8s ease-in-out infinite;
          }

          @keyframes amLineDraw {
            0% {
              stroke-dashoffset: 100;
              opacity: 0.18;
            }
            45% {
              stroke-dashoffset: 0;
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0.48;
            }
          }

          @keyframes amNodePulse {
            0%, 100% {
              opacity: 0.55;
            }
            50% {
              opacity: 1;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .am-mini-diagram * {
              animation: none !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
