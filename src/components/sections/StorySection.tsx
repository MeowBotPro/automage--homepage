'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger, safeContext } from '@/lib/gsap';

export default function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLSpanElement>(null);
  const quoteTextRef = useRef<HTMLParagraphElement>(null);
  const videoContentRef = useRef<HTMLDivElement>(null);
  const borderDrawRef = useRef<HTMLDivElement>(null);
  const insightTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = safeContext(() => {
      ScrollTrigger.matchMedia({
        '(prefers-reduced-motion: no-preference)': () => {
          const storyActs = section.querySelectorAll<HTMLElement>('.story-act');

          const intro = gsap.timeline({
            scrollTrigger: {
              trigger: storyActs[0],
              start: 'top 80%',
              toggleActions: 'play none none none',
              once: true,
            },
          });

          intro.fromTo(
            quoteRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' },
          );

          intro.fromTo(
            quoteTextRef.current,
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power2.out' },
          );

          if (videoContentRef.current) {
            gsap.to(videoContentRef.current, {
              y: -20,
              ease: 'none',
              scrollTrigger: {
                trigger: videoContentRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });
          }

          if (storyActs[2] && borderDrawRef.current && insightTextRef.current) {
            gsap.set(borderDrawRef.current, { scaleY: 0 });
            gsap.set(insightTextRef.current, { opacity: 0 });

            const insight = gsap.timeline({
              scrollTrigger: {
                trigger: storyActs[2],
                start: 'top 80%',
                toggleActions: 'play none none none',
                once: true,
              },
            });

            insight
              .to(borderDrawRef.current, { scaleY: 1, duration: 0.8, ease: 'power2.out' })
              .to(insightTextRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
          }
        },

        '(prefers-reduced-motion: reduce)': () => {
          gsap.set([quoteRef.current, quoteTextRef.current, borderDrawRef.current, insightTextRef.current].filter(Boolean), {
            opacity: 1,
            y: 0,
            scaleY: 1,
            clipPath: 'inset(0 0% 0 0)',
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="section-story"
      ref={sectionRef}
      data-dark-story-section
      className="am-narrative-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'calc(var(--space-section) + 16px)',
        paddingBottom: 'calc(var(--space-section) + 24px)',
        background: 'transparent',
        color: 'var(--color-text-on-dark)',
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 760"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.32,
        }}
      >
        <path d="M110 0C150 170 60 310 120 520S140 680 98 760" stroke="rgba(59,130,246,0.22)" strokeWidth="1" fill="none" />
        <path d="M520 0C570 180 470 300 540 485S610 650 560 760" stroke="rgba(59,130,246,0.16)" strokeWidth="1" fill="none" />
        <path d="M900 0C970 190 860 340 930 540S960 650 928 760" stroke="rgba(56,189,248,0.14)" strokeWidth="1" fill="none" />
        <circle cx="180" cy="140" r="3" fill="var(--color-brand-accent)" opacity="0.6" />
        <circle cx="760" cy="290" r="3" fill="var(--color-brand-cyan)" opacity="0.5" />
        <circle cx="1040" cy="520" r="3" fill="var(--color-brand-accent)" opacity="0.45" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <h2
          className="font-semibold text-center"
          style={{
            maxWidth: 760,
            margin: '0 auto 68px',
            fontSize: 'clamp(2rem, 4.2vw, 3rem)',
            lineHeight: 1.18,
            letterSpacing: 0,
            color: 'var(--color-text-on-dark)',
          }}
        >
          我们正在用 AutoMage 管理 AutoMage 的开发
        </h2>

        <div
          className="story-act"
          data-story-quote-card
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '44px 48px',
            marginBottom: 48,
            background: 'rgba(15, 23, 42, 0.86)',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            boxShadow: '0 26px 86px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <span
            ref={quoteRef}
            aria-hidden="true"
            style={{
              display: 'block',
              marginBottom: 18,
              fontSize: '4rem',
              lineHeight: 0.8,
              color: 'var(--color-brand-accent)',
              opacity: 0.9,
              fontFamily: 'Georgia, serif',
              userSelect: 'none',
            }}
          >
            &ldquo;
          </span>
          <p
            ref={quoteTextRef}
            data-story-quote-text
            style={{
              margin: 0,
              fontSize: '1.08rem',
              lineHeight: 1.8,
              color: 'rgba(226, 232, 240, 0.9)',
            }}
          >
            组织管理中，信息经过层层过滤才到达决策者。每一层都是延迟和失真。
          </p>
        </div>

        <div className="story-act" style={{ marginBottom: 48 }}>
          <h3
            className="font-semibold"
            style={{
              margin: '0 0 24px',
              fontSize: '1.25rem',
              color: 'var(--color-text-on-dark)',
            }}
          >
            我们做了一个实验
          </h3>

          <div
            data-story-video-shell
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(96, 165, 250, 0.24)',
              boxShadow: '0 30px 96px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              style={{
                height: 36,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 14px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
                background: 'rgba(15, 23, 42, 0.78)',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-chrome-close)' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-chrome-minimize)' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-chrome-maximize)' }} />
              <span
                style={{
                  marginLeft: 8,
                  fontFamily: 'var(--font-console)',
                  fontSize: '0.72rem',
                  color: 'rgba(148, 163, 184, 0.78)',
                }}
              >
                automage-product-film.mp4
              </span>
            </div>

            <div
              ref={videoContentRef}
              data-story-video-placeholder
              style={{
                position: 'relative',
                minHeight: 360,
                display: 'grid',
                placeItems: 'center',
                background:
                  'linear-gradient(135deg, rgba(30,58,95,0.28), rgba(59,130,246,0.1)), var(--color-surface-dark)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 28,
                  border: '1px solid rgba(96, 165, 250, 0.18)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  width: '76%',
                  height: 1,
                  top: '42%',
                  background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent)',
                }}
              />
              <div
                data-story-play-button
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(241,245,249,0.96)',
                  boxShadow: '0 0 36px rgba(59, 130, 246, 0.28)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '12px solid transparent',
                    borderBottom: '12px solid transparent',
                    borderLeft: '18px solid var(--color-surface-dark)',
                    marginLeft: 5,
                  }}
                />
              </div>
              <p
                style={{
                  position: 'absolute',
                  left: 28,
                  right: 28,
                  bottom: 24,
                  margin: 0,
                  textAlign: 'center',
                  color: 'rgba(148, 163, 184, 0.78)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                }}
              >
                宣传视频占位 / Product film placeholder
              </p>
            </div>
          </div>

          <p
            style={{
              margin: '18px 0 0',
              fontSize: '0.9rem',
              color: 'rgba(148, 163, 184, 0.78)',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            用 AutoMage 管理 AutoMage 的开发 — 真实使用，不是演示
          </p>
        </div>

        <div
          className="story-act"
          style={{
            position: 'relative',
            paddingLeft: 32,
            maxWidth: 760,
            margin: '0 auto',
          }}
        >
          <div
            ref={borderDrawRef}
            data-story-insight-line
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 3,
              height: '100%',
              background: 'var(--color-brand-accent)',
              transformOrigin: 'top',
              boxShadow: '0 0 18px rgba(59, 130, 246, 0.35)',
            }}
          />
          <p
            ref={insightTextRef}
            data-story-insight
            style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 560,
              color: 'var(--color-text-on-dark)',
              lineHeight: 1.75,
            }}
          >
            AI 替代低价值管理劳动，不替代人。让人回归判断本身。
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          [data-story-quote-card] {
            padding: 32px 24px !important;
          }

          [data-story-video-placeholder] {
            min-height: 260px !important;
          }
        }
      `}</style>
    </section>
  );
}
