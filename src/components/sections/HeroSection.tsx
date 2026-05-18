'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, safeContext } from '@/lib/gsap';

const TITLE_CHARS = '重塑组织管理的'.split('');

/* ── Signal Console Data ── */
const SIGNAL_CHIPS = [
  { label: '日报提交', status: 'success', icon: '✓' },
  { label: '风险升高', status: 'warning', icon: '⚠' },
  { label: '决策待确认', status: 'active', icon: '●' },
];

const BAR_DATA = [
  { label: 'Signals', value: 78, color: 'var(--color-signal-success)' },
  { label: 'Risks', value: 42, color: 'var(--color-signal-warning)' },
  { label: 'Decisions', value: 65, color: 'var(--color-brand-accent)' },
];

const PIPELINE_STAGES = ['Signal intake', 'Risk detected', 'Decision pending', 'Confirmed'];

const STATUS_DOT_COLORS: Record<string, string> = {
  success: 'var(--color-signal-success)',
  warning: 'var(--color-signal-warning)',
  active: 'var(--color-brand-accent)',
};

/* ── Console Component ── */
function SignalConsole() {
  const consoleRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement[]>([]);
  const barsRef = useRef<HTMLDivElement[]>([]);
  const [pipelineIndex, setPipelineIndex] = useState(0);

  useEffect(() => {
    const consoleEl = consoleRef.current;
    if (!consoleEl) return;

    const ctx = safeContext(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      const tl = gsap.timeline({ delay: 1.2 });

      if (consoleRef.current) {
        tl.fromTo(consoleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      }

      chipsRef.current.forEach((chip, i) => {
        if (!chip) return;
        tl.fromTo(chip, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, 0.4 + i * 0.1);
      });

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.set(bar, { scaleY: 0, transformOrigin: 'bottom' });
        tl.to(bar, { scaleY: 1, duration: 0.6, ease: 'power2.out' }, 0.7 + i * 0.1);
      });
    }, consoleEl);

    return () => ctx.revert();
  }, []);

  // Pipeline rotation
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const interval = setInterval(() => {
      setPipelineIndex((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={consoleRef}
      role="img"
      aria-label="AutoMage 组织信号控制台"
      style={{
        background: 'var(--color-surface-deep)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        opacity: 0,
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-chrome-close)' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-chrome-minimize)' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-chrome-maximize)' }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-on-dark-muted)', fontFamily: 'var(--font-console)', letterSpacing: '0.02em' }}>
          Decision Console
        </span>
      </div>

      {/* Signal chips */}
      <div className="flex flex-wrap gap-2 mb-5" aria-hidden="true">
        {SIGNAL_CHIPS.map((chip, i) => (
          <div
            key={i}
            ref={(el) => { if (el) chipsRef.current[i] = el; }}
            className="inline-flex items-center gap-2"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)',
              fontSize: '0.75rem',
              color: 'var(--color-text-on-dark-muted)',
              opacity: 0,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: STATUS_DOT_COLORS[chip.status],
                boxShadow: chip.status === 'active' ? '0 0 6px var(--color-brand-accent)' : 'none',
                animation: chip.status === 'active' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
              }}
            />
            {chip.label}
          </div>
        ))}
      </div>

      {/* Bar charts */}
      <div className="flex gap-4 mb-5" aria-hidden="true">
        {BAR_DATA.map((bar, i) => (
          <div key={i} className="flex-1">
            <div
              style={{
                height: 64,
                display: 'flex',
                alignItems: 'flex-end',
                marginBottom: 6,
              }}
            >
              <div
                ref={(el) => { if (el) barsRef.current[i] = el; }}
                style={{
                  width: '100%',
                  height: `${bar.value}%`,
                  background: `linear-gradient(to top, ${bar.color}, transparent)`,
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.6,
                }}
              />
            </div>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-on-dark-muted)' }}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>

      {/* Processing indicator */}
      <div
        style={{
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--color-text-on-dark-muted)',
          fontFamily: 'var(--font-console)',
          letterSpacing: '0.02em',
          marginBottom: 12,
        }}
      >
        3 signals compressed into 1 decision brief
        <span style={{ animation: 'blink-dots 1.5s step-end infinite' }}>...</span>
      </div>

      {/* Mini pipeline */}
      <div className="flex items-center gap-1" aria-hidden="true">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={i} className="flex items-center gap-1">
            <span
              style={{
                fontSize: '0.625rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: i === pipelineIndex ? 'var(--color-brand-accent)' : 'rgba(255,255,255,0.06)',
                color: i === pipelineIndex ? 'var(--color-text-on-dark)' : 'var(--color-text-on-dark-muted)',
                transition: 'all 300ms ease',
                fontWeight: i === pipelineIndex ? 600 : 400,
              }}
            >
              {stage}
            </span>
            {i < PIPELINE_STAGES.length - 1 && (
              <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.2)' }}>→</span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes blink-dots {
          0% { content: ''; opacity: 0; }
          33% { opacity: 1; }
          66% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .signal-console * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Hero Section ── */
export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const titleCharsRef = useRef<HTMLSpanElement[]>([]);
  const gradientRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = safeContext(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set([...titleCharsRef.current, gradientRef.current, subtitleRef.current, ctaRef.current], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({ delay: 0.5 });

      tl.fromTo(
        titleCharsRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.03 },
      );

      tl.fromTo(
        gradientRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '+=0.2',
      );

      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '+=0.3',
      );

      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '+=0.2',
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="section-hero"
      className="relative flex items-center"
      style={{ minHeight: '80vh' }}
    >
      <div
        className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        style={{ paddingTop: 160, paddingBottom: 120, paddingLeft: 24, paddingRight: 24 }}
      >
        <div className="lg:col-span-7 text-center lg:text-left">
          <h1
            className="font-semibold"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
            }}
          >
            {TITLE_CHARS.map((char, i) => (
              <span
                key={i}
                ref={(el) => {
                  if (el) titleCharsRef.current[i] = el;
                }}
                style={{ display: 'inline-block', opacity: 0 }}
              >
                {char}
              </span>
            ))}
            <span
              ref={gradientRef}
              style={{
                background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
                opacity: 0,
              }}
            >
              信息逻辑
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="mt-6"
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-text-tertiary)',
              lineHeight: 1.65,
              opacity: 0,
            }}
          >
            当 AI 接管信息处理，人回归判断本身
          </p>

          <div ref={ctaRef} className="mt-10 flex justify-center lg:justify-start" style={{ opacity: 0 }}>
            <a
              href="#section-beta"
              className="group inline-flex items-center gap-2 font-medium text-white transition-colors duration-200 cursor-pointer"
              style={{
                background: 'var(--color-brand-primary)',
                padding: '12px 32px',
                borderRadius: 'var(--radius-md)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-primary)';
              }}
            >
              申请内测演示
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 hidden lg:block">
          <SignalConsole />
        </div>
      </div>
    </section>
  );
}
