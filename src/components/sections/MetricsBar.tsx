'use client';

import { useRef, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface MetricItem {
  value: string;
  numeric: number;
  suffix: string;
  label: string;
}

const METRICS: MetricItem[] = [
  { value: '500+', numeric: 500, suffix: '+', label: '团队信赖' },
  { value: '98%', numeric: 98, suffix: '%', label: '满意度' },
  { value: '10x', numeric: 10, suffix: 'x', label: '信息效率' },
  { value: '24/7', numeric: 24, suffix: '/7', label: '实时响应' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MetricsBar() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const animatedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Set initial state
    const cards = Array.from(section.querySelectorAll<HTMLElement>('.metric-card'));
    if (!cards.length) return;

    if (prefersReducedMotion) {
      cards.forEach((card) => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      });
      METRICS.forEach((m, i) => {
        const el = numberRefs.current[i];
        if (el) el.textContent = m.value;
      });
      return;
    }

    cards.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    });
    METRICS.forEach((m, i) => {
      const el = numberRefs.current[i];
      if (el) el.textContent = `0${m.suffix}`;
    });

    function animate() {
      if (animatedRef.current) return;
      animatedRef.current = true;

      cards.forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, i * 100);
      });

      METRICS.forEach((m, i) => {
        const el = numberRefs.current[i];
        if (!el) return;

        const duration = 1200;
        const delay = i * 100;
        const start = performance.now();

        function tick(now: number) {
          const elapsed = now - start - delay;
          if (elapsed < 0) {
            requestAnimationFrame(tick);
            return;
          }
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          if (el) el.textContent = `${Math.round(eased * m.numeric)}${m.suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-metrics"
      className="am-narrative-section w-full"
      style={{
        padding: '56px 48px',
        background: 'transparent',
      }}
    >
      <div
        className="mx-auto grid gap-6"
        style={{
          maxWidth: 1200,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        }}
      >
        {METRICS.map((m, i) => (
          <div
            key={m.label}
            className="metric-card text-center"
            style={{
              background: 'rgba(15, 23, 42, 0.52)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: 'var(--radius-md)',
              padding: '48px 24px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <span
              ref={(el) => {
                numberRefs.current[i] = el;
              }}
              suppressHydrationWarning
              style={{
                display: 'block',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: 'var(--color-brand-cyan)',
                lineHeight: 1.2,
              }}
            >
              {m.value}
            </span>
            <span
              style={{
                display: 'block',
                marginTop: 12,
                fontSize: '1rem',
                color: 'var(--color-text-on-dark-muted)',
              }}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
