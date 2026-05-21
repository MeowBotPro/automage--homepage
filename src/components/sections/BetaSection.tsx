'use client';

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { gsap, safeContext, gsapReady } from '@/lib/gsap';
import BetaSuccessModal from '@/components/ui/BetaSuccessModal';

type BetaApplicationResponse = {
  code?: number;
  msg?: string;
  data?: {
    record?: {
      application_public_id?: string;
    };
  };
};

export default function BetaSection() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [applicationPublicId, setApplicationPublicId] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
        wrapperRefs.current.forEach((wrapper) => {
          if (wrapper) gsap.set(wrapper, { opacity: 1, y: 0 });
        });
        underlineRefs.current.forEach((underline) => {
          if (underline) {
            gsap.set(underline, { width: '100%', background: 'var(--color-border-default)' });
          }
        });
        gsap.set(submit, { scale: 1 });
        return;
      }

      const wrappers = wrapperRefs.current.filter(Boolean);
      const underlines = underlineRefs.current.filter(Boolean);

      gsap.set(wrappers, { opacity: 0, y: 12 });
      gsap.set(underlines, { width: '0%', background: 'var(--color-border-default)' });
      gsap.set(submit, { scale: 0.95 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      timeline.to(wrappers, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.15,
        ease: 'power2.out',
      });

      wrappers.forEach((_, index) => {
        timeline.to(
          underlines[index],
          {
            width: '100%',
            background: 'var(--color-border-default)',
            duration: 0.5,
            ease: 'power2.out',
          },
          0.4 + index * 0.15,
        );
      });

      timeline.to(
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

    gsap.killTweensOf(particle);

    const timeline = gsap.timeline();
    timeline
      .set(particle, { x: 0, opacity: 0 })
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const companyName = String(formData.get('company') ?? '').trim();
    const contact = String(formData.get('contact') ?? '').trim();
    const teamSize = String(formData.get('teamSize') ?? '').trim();

    try {
      const response = await fetch('/api/v1/beta-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          company_name: companyName,
          contact,
          team_size: teamSize || undefined,
          source: 'landing_page',
        }),
      });

      const result: BetaApplicationResponse = await response.json().catch(() => ({}));
      const publicId = result.data?.record?.application_public_id;

      if (!response.ok || !publicId) {
        setSubmitError(result.msg ?? '提交失败，请稍后重试。');
        return;
      }

      setApplicationPublicId(publicId);
      setSubmitted(true);
      setIsSuccessModalOpen(true);
      form.reset();
    } catch {
      setSubmitError('提交失败，请检查网络后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: CSSProperties = {
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
    <>
      <section
        ref={sectionRef}
        id="section-beta"
        style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
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
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>感谢你的申请！</div>
              <div
                style={{
                  marginTop: 12,
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                申请编号：
                <span
                  style={{
                    fontFamily: 'var(--font-console)',
                    color: 'var(--color-text-primary)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {applicationPublicId}
                </span>
              </div>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
              style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
            >
              {inputNames.map((name, index) => (
                <div
                  key={name}
                  ref={(element) => {
                    if (element) wrapperRefs.current[index] = element;
                  }}
                  style={{ position: 'relative' }}
                >
                  <input
                    type="text"
                    name={name}
                    placeholder={inputPlaceholders[index]}
                    aria-label={inputPlaceholders[index]}
                    required={inputRequired[index]}
                    style={inputStyle}
                    onFocus={() => handleFocus(index)}
                    onBlur={() => handleBlur(index)}
                  />
                  <div
                    ref={(element) => {
                      if (element) underlineRefs.current[index] = element;
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
                      ref={(element) => {
                        if (element) particleRefs.current[index] = element;
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

              {submitError ? (
                <p
                  role="alert"
                  aria-live="polite"
                  style={{
                    marginTop: -8,
                    color: 'var(--color-signal-warning)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  }}
                >
                  {submitError}
                </p>
              ) : null}

              <button
                ref={submitRef}
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: isSubmitting
                    ? 'var(--color-text-tertiary)'
                    : 'var(--color-brand-primary)',
                  color: 'var(--color-text-on-dark)',
                  padding: '14px 48px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 200ms var(--ease-out), box-shadow 200ms var(--ease-out)',
                  marginTop: 16,
                  transform: 'scale(0.95)',
                  boxShadow: 'none',
                  opacity: isSubmitting ? 0.88 : 1,
                }}
                onMouseEnter={(event) => {
                  if (isSubmitting) return;
                  event.currentTarget.style.background = 'var(--color-brand-accent)';
                  event.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.15)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = isSubmitting
                    ? 'var(--color-text-tertiary)'
                    : 'var(--color-brand-primary)';
                  event.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isSubmitting ? '提交中...' : '提交申请'}
              </button>
            </form>
          )}
        </div>
      </section>

      <BetaSuccessModal
        key={`${applicationPublicId}-${isSuccessModalOpen ? 'open' : 'closed'}`}
        applicationPublicId={applicationPublicId}
        isOpen={isSuccessModalOpen && applicationPublicId.length > 0}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </>
  );
}
