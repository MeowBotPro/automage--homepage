'use client';

import type React from 'react';
import { useRef, useEffect } from 'react';
import { gsap, safeContext } from '@/lib/gsap';
import { usePathDraw } from '@/hooks/usePathDraw';

export interface LoopNode {
  id: number;
  title: string;
  text: string;
}

interface LoopNodeCardProps {
  node: LoopNode;
  className?: string;
  dark?: boolean;
}

/* ── Inline SVG illustrations for each node ── */

function ReportLines() {
  return (
    <div className="flex flex-col gap-2 w-full">
      {[0.9, 0.75, 0.85, 0.6].map((w, i) => (
        <div
          key={i}
          className="h-[3px] rounded-full"
          data-fill-draw
          style={{
            width: `${w * 100}%`,
            background: `rgba(30, 58, 95, ${0.12 + i * 0.04})`,
          }}
        />
      ))}
    </div>
  );
}

function SummaryBullets() {
  return (
    <div className="flex flex-col gap-3 w-full">
      {[0.85, 0.7, 0.65].map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'rgba(59, 130, 246, 0.4)' }}
          />
          <div
            className="h-[3px] rounded-full"
            data-fill-draw
            style={{
              width: `${w * 100}%`,
              background: `rgba(30, 58, 95, ${0.1 + i * 0.05})`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ApprovalCheck() {
  return (
    <div className="flex items-center justify-center w-full">
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="28"
          cy="28"
          r="26"
          stroke="rgba(59, 130, 246, 0.2)"
          strokeWidth="2"
          data-stroke-draw
        />
        <path
          d="M18 28L25 35L38 22"
          style={{ stroke: 'var(--color-brand-accent)' }}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-stroke-draw
        />
      </svg>
    </div>
  );
}

function DecisionOptions() {
  return (
    <div className="flex gap-3 w-full">
      <div
        className="flex-1 rounded-lg p-3"
        style={{
          background: 'rgba(30, 58, 95, 0.04)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div className="flex flex-col gap-1.5">
          <div className="h-[3px] rounded-full" data-fill-draw style={{ width: '70%', background: 'rgba(30,58,95,0.15)' }} />
          <div className="h-[3px] rounded-full" data-fill-draw style={{ width: '50%', background: 'rgba(30,58,95,0.1)' }} />
        </div>
      </div>
      <div
        className="flex-1 rounded-lg p-3"
        style={{
          background: 'rgba(30, 58, 95, 0.04)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div className="flex flex-col gap-1.5">
          <div className="h-[3px] rounded-full" data-fill-draw style={{ width: '65%', background: 'rgba(30,58,95,0.15)' }} />
          <div className="h-[3px] rounded-full" data-fill-draw style={{ width: '55%', background: 'rgba(30,58,95,0.1)' }} />
        </div>
      </div>
    </div>
  );
}

function SelectedOption() {
  return (
    <div className="flex gap-3 w-full">
      <div
        className="flex-1 rounded-lg p-3"
        style={{
          background: 'rgba(59, 130, 246, 0.06)',
          border: '2px solid var(--color-brand-accent)',
        }}
      >
        <div className="flex flex-col gap-1.5">
          <div className="h-[3px] rounded-full" data-fill-draw style={{ width: '70%', background: 'rgba(59,130,246,0.3)' }} />
          <div className="h-[3px] rounded-full" data-fill-draw style={{ width: '50%', background: 'rgba(59,130,246,0.2)' }} />
        </div>
      </div>
      <div
        className="flex-1 rounded-lg p-3 opacity-40"
        style={{
          background: 'rgba(30, 58, 95, 0.02)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div className="flex flex-col gap-1.5">
          <div className="h-[3px] rounded-full" data-fill-draw style={{ width: '65%', background: 'rgba(30,58,95,0.1)' }} />
          <div className="h-[3px] rounded-full" data-fill-draw style={{ width: '55%', background: 'rgba(30,58,95,0.06)' }} />
        </div>
      </div>
    </div>
  );
}

function TaskCards() {
  const widths = [0.8, 0.65, 0.75, 0.55];
  return (
    <div className="flex flex-col gap-2 w-full">
      {widths.map((w, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md px-3 py-2"
          style={{
            background: `rgba(59, 130, 246, ${0.04 + i * 0.02})`,
            border: '1px solid var(--color-border-default)',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: 'var(--color-brand-accent)' }}
          />
          <div
            className="h-[2px] rounded-full"
            data-fill-draw
            style={{ width: `${w * 100}%`, background: 'rgba(30,58,95,0.12)' }}
          />
        </div>
      ))}
    </div>
  );
}

const VISUALS: Record<number, () => React.ReactElement> = {
  1: ReportLines,
  2: SummaryBullets,
  3: ApprovalCheck,
  4: DecisionOptions,
  5: SelectedOption,
  6: TaskCards,
};

export default function LoopNodeCard({ node, className = '', dark = false }: LoopNodeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Visual = VISUALS[node.id];

  /* SVG stroke-draw: targets [data-stroke-draw] SVG elements (circle, path) */
  usePathDraw(cardRef, {
    pathSelector: '[data-stroke-draw]',
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { start: 'top 80%' },
    once: true,
  });

  /* Card entrance (scale + opacity) and fill bar scaleX animation */
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = safeContext(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      const fills = Array.from(
        card.querySelectorAll<HTMLElement>('[data-fill-draw]'),
      );
      if (fills.length > 0 && !prefersReducedMotion) {
        gsap.set(fills, { scaleX: 0, transformOrigin: 'left center' });
        gsap.to(fills, {
          scaleX: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            once: true,
          },
        });
      }

      if (prefersReducedMotion) {
        gsap.set(card, { opacity: 0 });
        gsap.to(card, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.set(card, { scale: 0.92, opacity: 0 });
        gsap.to(card, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            once: true,
          },
        });
      }
    }, card);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        background: dark ? 'var(--color-surface-dark)' : 'var(--color-surface-card)',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 48,
        maxWidth: 640,
        boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : 'var(--shadow-sm)',
      }}
    >
      {/* Visual mock */}
      <div
        className="mb-8 flex items-center justify-center"
        style={{ height: 120, maxHeight: 120 }}
      >
        {Visual && <Visual />}
      </div>

      {/* Title */}
      <h3
        className="font-semibold mb-3"
        style={{
          fontSize: '1.5rem',
          color: dark ? 'var(--color-text-on-dark)' : 'var(--color-brand-primary)',
          lineHeight: 1.3,
        }}
      >
        {node.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '1rem',
          color: dark ? 'var(--color-text-on-dark-muted)' : 'var(--color-text-tertiary)',
          lineHeight: 1.65,
        }}
      >
        {node.text}
      </p>
    </div>
  );
}
