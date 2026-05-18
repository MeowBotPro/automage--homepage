'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger, safeContext } from '@/lib/gsap';

export default function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLSpanElement>(null);
  const quoteTextRef = useRef<HTMLParagraphElement>(null);
  const screenshotContentRef = useRef<HTMLDivElement>(null);
  const borderDrawRef = useRef<HTMLDivElement>(null);
  const insightTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = safeContext(() => {
      ScrollTrigger.matchMedia({
        '(prefers-reduced-motion: no-preference)': () => {
          // Act 1 — Quote mark reveal, then text sweep
          const tl1 = gsap.timeline({
            scrollTrigger: {
              trigger: section.querySelector('.story-act'),
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          });

          tl1.fromTo(
            quoteRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' },
          );

          tl1.fromTo(
            quoteTextRef.current,
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power2.out' },
          );

          // Act 2 — Parallax on screenshot content
          gsap.to(screenshotContentRef.current, {
            y: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: screenshotContentRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });

          // Act 3 — Border draw then text fade
          const acts = section.querySelectorAll<HTMLElement>('.story-act');
          const act3 = acts[2];
          if (act3 && borderDrawRef.current && insightTextRef.current) {
            gsap.set(borderDrawRef.current, { scaleY: 0 });
            gsap.set(insightTextRef.current, { opacity: 0 });

            const tl3 = gsap.timeline({
              scrollTrigger: {
                trigger: act3,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            });

            tl3.to(borderDrawRef.current, {
              scaleY: 1,
              duration: 0.8,
              ease: 'power2.out',
            });

            tl3.to(insightTextRef.current, {
              opacity: 1,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
        },

        '(prefers-reduced-motion: reduce)': () => {
          /* no animations — everything stays visible */
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="section-story"
      ref={sectionRef}
      style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {/* Title */}
        <h2
          className="font-semibold text-center"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
            marginBottom: 80,
          }}
        >
          我们正在用 AutoMage 管理 AutoMage 的开发
        </h2>

        {/* Act 1 — Pain */}
        <div
          className="story-act"
          style={{
            background: 'var(--color-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            padding: 48,
            marginBottom: 48,
          }}
        >
          <span
            ref={quoteRef}
            aria-hidden="true"
            style={{
              fontSize: '4rem',
              color: 'var(--color-brand-accent)',
              opacity: 0.3,
              lineHeight: 1,
              display: 'block',
              marginBottom: 16,
              fontFamily: 'Georgia, serif',
              userSelect: 'none',
            }}
          >
            &ldquo;
          </span>
          <p
            ref={quoteTextRef}
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.75,
            }}
          >
            组织管理中，信息经过层层过滤才到达决策者。每一层都是延迟和失真。
          </p>
        </div>

        {/* Act 2 — Experiment */}
        <div className="story-act" style={{ marginBottom: 48 }}>
          <h3
            className="font-semibold"
            style={{
              fontSize: '1.25rem',
              color: 'var(--color-brand-primary)',
              marginBottom: 24,
            }}
          >
            我们做了一个实验
          </h3>

          {/* Browser window mockup */}
          <div
            style={{
              border: '1px solid var(--color-brand-primary)',
              opacity: 0.1,
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: 16,
              background: 'var(--color-surface-card)',
            }}
          >
            {/* Title bar */}
            <div
              style={{
                height: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 12px',
                borderBottom: '1px solid var(--color-border-default)',
              }}
            >
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-chrome-close)' }}
              />
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-chrome-minimize)' }}
              />
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-chrome-maximize)' }}
              />
            </div>
            {/* Content area */}
            <div
              ref={screenshotContentRef}
              style={{
                height: 268,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: '0.875rem',
              }}
            >
              截图占位
            </div>
          </div>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-tertiary)',
              textAlign: 'center',
            }}
          >
            用 AutoMage 管理 AutoMage 的开发 — 真实使用，不是演示
          </p>
        </div>

        {/* Act 3 — Insight */}
        <div
          className="story-act"
          style={{
            position: 'relative',
            paddingLeft: 32,
          }}
        >
          {/* Animated left border */}
          <div
            ref={borderDrawRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 3,
              height: '100%',
              background: 'var(--color-brand-accent)',
              transformOrigin: 'top',
            }}
          />
          <p
            ref={insightTextRef}
            style={{
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              lineHeight: 1.75,
            }}
          >
            AI 替代低价值管理劳动，不替代人。让人回归判断本身。
          </p>
        </div>
      </div>
    </section>
  );
}
