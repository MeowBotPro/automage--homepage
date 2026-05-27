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
      invite_code_status?: string;
    };
  };
};

type FieldKind = 'select' | 'textarea' | 'text';

type BetaFormField = {
  name: 'occupation' | 'workBackground' | 'useCase' | 'contact' | 'inviteCode';
  label: string;
  required: boolean;
  kind: FieldKind;
  placeholder?: string;
  options?: string[];
};

const occupationOptions = [
  '开发者 / 技术负责人',
  '产品经理',
  '运营 / 增长',
  '创业者 / 企业管理者',
  '咨询 / 交付 / 项目管理',
  '内容 / 市场 / 销售',
  '其他',
];

const useCaseOptions = [
  '企业内部知识库 / 文档自动化',
  '飞书 / 办公流程自动化',
  '项目管理 / 团队协作',
  '内容生产 / 营销自动化',
  '客服 / 销售支持',
  '研发 / 代码或工程提效',
  '个人效率工具',
  '其他，请补充说明',
];

const betaFormFields: BetaFormField[] = [
  {
    name: 'occupation',
    label: '职业 / 身份',
    required: true,
    kind: 'select',
    placeholder: '选择你的职业 / 身份',
    options: occupationOptions,
  },
  {
    name: 'workBackground',
    label: '工作背景',
    required: false,
    kind: 'textarea',
    placeholder: '简单说说你的行业、团队或过往相关经验',
  },
  {
    name: 'useCase',
    label: '应用场景',
    required: true,
    kind: 'select',
    placeholder: '选择你最想用 AutoMage 做什么',
    options: useCaseOptions,
  },
  {
    name: 'contact',
    label: '联系方式',
    required: true,
    kind: 'text',
    placeholder: '微信 / 手机 / 邮箱',
  },
  {
    name: 'inviteCode',
    label: '邀请码',
    required: false,
    kind: 'text',
    placeholder: '邀请码，可选；有效邀请码会优先处理',
  },
];

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
    const occupation = String(formData.get('occupation') ?? '').trim();
    const workBackground = String(formData.get('workBackground') ?? '').trim();
    const useCase = String(formData.get('useCase') ?? '').trim();
    const contact = String(formData.get('contact') ?? '').trim();
    const inviteCode = String(formData.get('inviteCode') ?? '').trim();

    try {
      const response = await fetch('/api/v1/beta-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          occupation,
          work_background: workBackground || undefined,
          use_case: useCase,
          contact,
          invite_code: inviteCode || undefined,
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

  const controlStyle: CSSProperties = {
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

  const selectStyle: CSSProperties = {
    ...controlStyle,
    appearance: 'none',
    cursor: 'pointer',
  };

  const textareaStyle: CSSProperties = {
    ...controlStyle,
    minHeight: 96,
    resize: 'vertical',
    lineHeight: 1.6,
  };

  const renderField = (field: BetaFormField, index: number) => {
    if (field.kind === 'select') {
      return (
        <select
          name={field.name}
          aria-label={field.label}
          required={field.required}
          defaultValue=""
          style={selectStyle}
          onFocus={() => handleFocus(index)}
          onBlur={() => handleBlur(index)}
        >
          <option value="" disabled>
            {field.placeholder}
          </option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.kind === 'textarea') {
      return (
        <textarea
          name={field.name}
          placeholder={field.placeholder}
          aria-label={field.label}
          required={field.required}
          style={textareaStyle}
          onFocus={() => handleFocus(index)}
          onBlur={() => handleBlur(index)}
        />
      );
    }

    return (
      <input
        type="text"
        name={field.name}
        placeholder={field.placeholder}
        aria-label={field.label}
        required={field.required}
        style={controlStyle}
        onFocus={() => handleFocus(index)}
        onBlur={() => handleBlur(index)}
      />
    );
  };

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
            我们正在开放第一批 AutoMage 内测名额。告诉我们你的身份、场景和联系方式，我们会优先邀请最匹配的用户体验。
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
              {betaFormFields.map((field, index) => (
                <div
                  key={field.name}
                  ref={(element) => {
                    if (element) wrapperRefs.current[index] = element;
                  }}
                  style={{ position: 'relative' }}
                >
                  <label
                    style={{
                      display: 'block',
                      color: 'var(--color-text-tertiary)',
                      fontSize: '0.78rem',
                      letterSpacing: '0.04em',
                      marginBottom: 2,
                    }}
                  >
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  {renderField(field, index)}
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
