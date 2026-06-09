'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap, safeContext, gsapReady } from '@/lib/gsap';

const FAQ_ITEMS = [
  {
    question: 'AutoMage 是什么？',
    answer:
      'AutoMage 是一个 AI 驱动的组织管理平台。它不是聊天工具，不是项目管理工具，而是一个重构组织信息流的系统 — 从一线日报到决策生成到任务分配，形成完整的信息闭环。',
  },
  {
    question: '跟飞书/钉钉有什么区别？',
    answer:
      '飞书和钉钉解决的是沟通效率问题 — 让信息传递更快。AutoMage 解决的是信息结构问题 — 让信息不失真、不遗漏、自动流转。我们的核心能力不是「沟通」，而是「信息闭环」：一线数据直达决策层，决策自动转化为任务。',
  },
  {
    question: '数据安全怎么保证？',
    answer:
      '三层保障：第一，数据脱敏处理，AI 看到的不是原始数据；第二，支持本地私有化部署，数据不出你的服务器；第三，所有 AI 输出都是建议，最终决策由人确认。',
  },
  {
    question: 'AI 失控了怎么办？',
    answer:
      'AutoMage 的设计原则是「AI 建议，人类确认」。系统不自主做任何决策 — 它只负责信息聚合和方案生成。每一条决策都需要人类明确确认。你可以把 AutoMage 看作一个超级助理，不是一个自动驾驶系统。',
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileOpenIndex, setMobileOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = safeContext(() => {
      if (!reduced) {
        const items = Array.from(section.querySelectorAll<HTMLElement>('.faq-desktop'));
        if (!items.length) return;
        gsap.set(items, { opacity: 0, y: 20 });
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  // Cross-fade answer content
  useEffect(() => {
    if (!answerRef.current || !gsapReady()) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.fromTo(
      answerRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
    );
  }, [activeIndex]);

  return (
    <section
      id="section-faq"
      ref={sectionRef}
      className="am-narrative-section am-final-section"
      style={{
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
        background: 'transparent',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        <h2
          className="font-semibold text-center"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--color-text-on-dark)',
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          决策说明书
        </h2>
        <p
          className="text-center"
          style={{
            fontSize: '1.125rem',
            color: 'var(--color-text-on-dark-muted)',
            marginBottom: 64,
          }}
        >
          关于 AutoMage，你可能想知道的
        </p>

        {/* Desktop: Left-right layout */}
        <div className="hidden md:grid faq-desktop" style={{ gridTemplateColumns: '360px 1fr', gap: 24, minHeight: 300 }}>
          {/* Left: Question list */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.62)',
              border: '1px solid rgba(148, 163, 184, 0.14)',
              borderRadius: 'var(--radius-lg)',
              padding: 8,
            }}
          >
            {FAQ_ITEMS.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="w-full text-left"
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: activeIndex === i ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 200ms ease',
                  borderLeft: activeIndex === i ? '3px solid var(--color-brand-accent)' : '3px solid transparent',
                }}
              >
                {activeIndex === i && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: -4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--color-brand-accent)',
                      boxShadow: 'var(--shadow-node-glow)',
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: activeIndex === i ? 600 : 400,
                    color: activeIndex === i ? 'var(--color-text-on-dark)' : 'var(--color-text-secondary)',
                  }}
                >
                  {item.question}
                </span>
              </button>
            ))}
          </div>

          {/* Right: Answer panel */}
          <div
            ref={answerRef}
            style={{
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(11, 22, 40, 0.86))',
              border: '1px solid rgba(148, 163, 184, 0.16)',
              borderRadius: 'var(--radius-lg)',
              padding: 32,
            }}
          >
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-text-on-dark)',
                marginBottom: 20,
              }}
            >
              {FAQ_ITEMS[activeIndex].question}
            </h3>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-text-on-dark-muted)',
                lineHeight: 1.75,
              }}
            >
              {FAQ_ITEMS[activeIndex].answer}
            </p>
          </div>
        </div>

        {/* Mobile: Accordion */}
        <div className="md:hidden">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.16)' }}>
              <button
                onClick={() => setMobileOpenIndex(mobileOpenIndex === index ? null : index)}
                aria-expanded={mobileOpenIndex === index}
                className="w-full flex items-center justify-between text-left"
                style={{ cursor: 'pointer', background: 'none', border: 'none', padding: '24px 0' }}
              >
                <span
                  className="font-semibold"
                  style={{ fontSize: '1.125rem', color: 'var(--color-text-on-dark)' }}
                >
                  {item.question}
                </span>
                <svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none"
                  stroke="var(--color-text-on-dark-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{
                    transform: mobileOpenIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 300ms var(--ease-out)',
                    flexShrink: 0,
                    marginLeft: 16,
                  }}
                >
                  <polyline points="5,7 10,13 15,7" />
                </svg>
              </button>
              <div
                role="region"
                aria-hidden={mobileOpenIndex !== index}
                style={{
                  display: 'grid',
                  gridTemplateRows: mobileOpenIndex === index ? '1fr' : '0fr',
                  transition: 'grid-template-rows 300ms var(--ease-out)',
                }}
              >
                <div style={{ overflow: 'hidden', minHeight: 0 }}>
                  <p
                    style={{
                      color: 'var(--color-text-on-dark-muted)',
                      lineHeight: 1.65,
                      paddingBottom: 24,
                      fontSize: '0.95rem',
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
