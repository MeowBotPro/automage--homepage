'use client';

import { useRef, useState, useEffect, type FormEvent } from 'react';
import { gsap, safeContext, gsapReady } from '@/lib/gsap';

export default function BetaSection() {
  const [submitted, setSubmitted] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const wrapperRefs = useRef<HTMLDivElement[]>([]);
  const underlineRefs = useRef<HTMLDivElement[]>([]);
  const particleRefs = useRef<HTMLDivElement[]>([]);
  const submitRef = useRef<HTMLButtonElement>(null);

  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const form = formRef.current;
    const submit = submitRef.current;
    if (!section || !form || !submit) return;

    const ctx = safeContext(() => {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion.current) {
        wrapperRefs.current.forEach((w) => {
          if (w) gsap.set(w, { opacity: 1, y: 0 });
        });
        underlineRefs.current.forEach((u) => {
          if (u) gsap.set(u, { width: '100%', background: 'var(--color-border-default)' });
        });
        gsap.set(submit, { scale: 1 });
        return;
      }

      const wrappers = wrapperRefs.current.filter(Boolean);
      const underlines = underlineRefs.current.filter(Boolean);

      gsap.set(wrappers, { opacity: 0, y: 12 });
      gsap.set(underlines, { width: '0%', background: 'var(--color-border-default)' });
      gsap.set(submit, { scale: 0.95 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.to(wrappers, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.15,
        ease: 'power2.out',
      });

      wrappers.forEach((_, i) => {
        tl.to(
          underlines[i],
          {
            width: '100%',
            background: 'var(--color-border-default)',
            duration: 0.5,
            ease: 'power2.out',
          },
          0.4 + i * 0.15,
        );
      });

      tl.to(
        submit,
        {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        },
        0.4 + (wrappers.length - 1) * 0.15 + 0.3,
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleFocus = (index: number) => {
    if (prefersReducedMotion.current || !gsapReady()) return;

    const wrapper = wrapperRefs.current[index];
    const underline = underlineRefs.current[index];
    const particle = particleRefs.current[index];
    if (!wrapper || !underline || !particle) return;

    const drawWidth = parseFloat(gsap.getProperty(underline, 'width') as string) || 0;
    const wrapperWidth = wrapper.offsetWidth;
    const isDrawn = drawWidth >= wrapperWidth * 0.9;

    // Show underline in accent color
    if (!isDrawn) {
      gsap.to(underline, {
        width: '100%',
        background: 'var(--color-brand-accent)',
        duration: 0.2,
        ease: 'power2.out',
      });
    } else {
      gsap.to(underline, {
        background: 'var(--color-brand-accent)',
        duration: 0.15,
      });
    }

    // Kill any running particle animation
    gsap.killTweensOf(particle);

    // Focus travel particle
    const tl = gsap.timeline();
    tl.set(particle, { x: 0, opacity: 0 })
      .to(particle, { opacity: 1, duration: 0.1 })
      .to(particle, {
        x: wrapperWidth - 6,
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(particle, { opacity: 0, duration: 0.15 })
      .set(particle, { x: 0 });
  };

  const handleBlur = (index: number) => {
    if (prefersReducedMotion.current || !gsapReady()) return;

    const underline = underlineRefs.current[index];
    const particle = particleRefs.current[index];
    if (!underline || !particle) return;

    gsap.killTweensOf(particle);
    gsap.to(particle, { opacity: 0, duration: 0.1 });
    gsap.to(underline, { background: 'var(--color-border-default)', duration: 0.2 });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    borderBottom: 'none',
    padding: '12px 0',
    fontSize: '1rem',
    background: 'transparent',
    color: 'var(--color-text-primary)',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
  };

  const inputNames = ['name', 'company', 'contact', 'teamSize'] as const;
  const inputPlaceholders = ['你的名字', '公司名称', '手机号或微信', '团队人数'];
  const inputRequired = [true, true, true, false];

  return (
    <section
      ref={sectionRef}
      id="section-beta"
      style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
        {/* Title */}
        <h2
          className="font-semibold text-center"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
          }}
        >
          申请内测
        </h2>

        {/* Description */}
        <p
          className="text-center"
          style={{
            color: 'var(--color-text-tertiary)',
            lineHeight: 1.75,
            marginTop: 16,
            marginBottom: 48,
          }}
        >
          我们正在寻找愿意一起探索组织管理新方式的团队。如果你也觉得现在的方式有问题，欢迎聊聊。
        </p>

        {submitted ? (
          <div
            className="text-center"
            role="status"
            aria-live="polite"
            style={{
              padding: '48px 0',
              color: 'var(--color-brand-accent)',
              fontSize: '1.25rem',
              fontWeight: 500,
            }}
          >
            感谢您的申请！
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
          >
            {inputNames.map((name, i) => (
              <div
                key={name}
                ref={(el) => {
                  if (el) wrapperRefs.current[i] = el;
                }}
                style={{ position: 'relative' }}
              >
                <input
                  type="text"
                  name={name}
                  placeholder={inputPlaceholders[i]}
                  aria-label={inputPlaceholders[i]}
                  required={inputRequired[i]}
                  style={inputStyle}
                  onFocus={() => handleFocus(i)}
                  onBlur={() => handleBlur(i)}
                />
                <div
                  ref={(el) => {
                    if (el) underlineRefs.current[i] = el;
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0%',
                    height: 1,
                    background: 'var(--color-border-default)',
                  }}
                >
                  <div
                    ref={(el) => {
                      if (el) particleRefs.current[i] = el;
                    }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: -2.5,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--color-brand-accent)',
                      opacity: 0,
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Submit */}
            <button
              ref={submitRef}
              type="submit"
              style={{
                width: '100%',
                background: 'var(--color-brand-primary)',
                color: 'var(--color-text-on-dark)',
                padding: '14px 48px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'background 200ms var(--ease-out), box-shadow 200ms var(--ease-out)',
                marginTop: 16,
                transform: 'scale(0.95)',
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-accent)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-primary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              提交申请
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
