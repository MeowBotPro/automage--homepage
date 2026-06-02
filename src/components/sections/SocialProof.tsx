'use client';

import { useRef, useEffect } from 'react';
import { gsap, safeContext } from '@/lib/gsap';

const testimonials = [
  {
    quote: 'AutoMage 让我们第一次把日报、风险和决策放进同一条链路里，管理层看到的是判断材料，不是信息堆积。',
    author: '张总监',
    role: '科技公司研发管理',
    metric: '23 signals / 1 brief',
  },
  {
    quote: '它没有替我们拍板，但把每个选项的风险、负责人和截止日讲清楚。这个边界感对企业很重要。',
    author: '李 VP',
    role: '制造业集团运营',
    metric: '4 risks / human gate',
  },
  {
    quote: '以前复盘靠会议纪要，现在每次确认都有执行回流。我们能追到一条决策为什么发生、后来怎样收口。',
    author: '王总',
    role: '互联网业务负责人',
    metric: 'closed loop / audit',
  },
];

export default function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = safeContext(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cards = cardRefs.current.filter(Boolean);

      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 22 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-social"
      data-social-proof-section
      style={{
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
        background: 'var(--color-surface-page)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ maxWidth: 720, marginBottom: 44 }}>
          <p
            style={{
              margin: '0 0 12px',
              fontFamily: 'var(--font-console)',
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-brand-accent)',
            }}
          >
            Customer signal
          </p>
          <h2
            className="font-semibold"
            style={{
              margin: 0,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.15,
              letterSpacing: 0,
            }}
          >
            从真实系统环境，落到真实业务判断
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((item, i) => (
            <div
              key={item.author}
              ref={(element) => {
                if (element) cardRefs.current[i] = element;
              }}
              data-testimonial-card
              style={{
                minWidth: 0,
                background: 'var(--color-surface-dark)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md)',
                padding: 28,
                opacity: 0,
                boxShadow: '0 24px 70px rgba(15, 23, 42, 0.18)',
                color: 'var(--color-text-on-dark)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-console)',
                    fontSize: '0.72rem',
                    color: 'var(--color-brand-cyan)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item.metric}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: 'var(--color-signal-success)',
                    boxShadow: '0 0 12px rgba(34,197,94,0.55)',
                    flex: '0 0 auto',
                  }}
                />
              </div>
              <p
                style={{
                  margin: 0,
                  color: 'var(--color-text-on-dark)',
                  lineHeight: 1.75,
                  fontSize: '1rem',
                  overflowWrap: 'anywhere',
                }}
              >
                “{item.quote}”
              </p>
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop: '1px solid rgba(148,163,184,0.16)',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: 'var(--color-text-on-dark)',
                    fontWeight: 650,
                    fontSize: '0.95rem',
                  }}
                >
                  {item.author}
                </p>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: 'var(--color-text-on-dark-muted)',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
