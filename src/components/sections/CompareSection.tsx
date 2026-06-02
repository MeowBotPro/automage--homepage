'use client';

import { useRef, useEffect } from 'react';
import { gsap, safeContext } from '@/lib/gsap';

/* ── Noise Fragments ── */
type NoiseMode = 'convert' | 'retain' | 'queue';

interface NoiseFragment {
  text: string;
  x: string;
  y: string;
  rotate: number;
  mode: NoiseMode;
  settledX: string;
  settledY: string;
  settledRotate: number;
  settledScale: number;
  settledOpacity: number;
}

const NOISE_FRAGMENTS = [
  {
    text: '日报：今天客户说交付要延期…',
    x: '5%',
    y: '10%',
    rotate: -3,
    mode: 'convert',
    settledX: '122%',
    settledY: '18%',
    settledRotate: 0,
    settledScale: 0.3,
    settledOpacity: 0,
  },
  {
    text: '群聊消息：@所有人 项目进度？',
    x: '60%',
    y: '5%',
    rotate: 2,
    mode: 'retain',
    settledX: '-6%',
    settledY: '-2%',
    settledRotate: 1,
    settledScale: 0.9,
    settledOpacity: 0.62,
  },
  {
    text: 'Excel：Q2预算表_v3_最终版_改',
    x: '15%',
    y: '45%',
    rotate: -2,
    mode: 'convert',
    settledX: '118%',
    settledY: '-4%',
    settledRotate: 0,
    settledScale: 0.3,
    settledOpacity: 0,
  },
  {
    text: '会议纪要：讨论了但没结论',
    x: '55%',
    y: '40%',
    rotate: 4,
    mode: 'convert',
    settledX: '112%',
    settledY: '-18%',
    settledRotate: 0,
    settledScale: 0.3,
    settledOpacity: 0,
  },
  {
    text: '口头传达：老板说尽快搞定',
    x: '8%',
    y: '75%',
    rotate: -1,
    mode: 'queue',
    settledX: '26%',
    settledY: '-8%',
    settledRotate: -1,
    settledScale: 0.96,
    settledOpacity: 0.86,
  },
  {
    text: '邮件：FW: FW: FW: 请确认',
    x: '65%',
    y: '70%',
    rotate: 3,
    mode: 'retain',
    settledX: '-12%',
    settledY: '4%',
    settledRotate: 2,
    settledScale: 0.9,
    settledOpacity: 0.6,
  },
  {
    text: '钉钉：已读未回',
    x: '35%',
    y: '20%',
    rotate: -4,
    mode: 'retain',
    settledX: '-10%',
    settledY: '8%',
    settledRotate: -2,
    settledScale: 0.88,
    settledOpacity: 0.58,
  },
  {
    text: '周报：这周做了很多事情…',
    x: '40%',
    y: '60%',
    rotate: 1,
    mode: 'retain',
    settledX: '-18%',
    settledY: '10%',
    settledRotate: 1,
    settledScale: 0.9,
    settledOpacity: 0.62,
  },
] satisfies NoiseFragment[];

const TRANSFORMED_NOISE_COUNT = NOISE_FRAGMENTS.filter((frag) => frag.mode === 'convert').length;
const RETAINED_NOISE_COUNT = NOISE_FRAGMENTS.length - TRANSFORMED_NOISE_COUNT;

/* ── Decision Cards ── */
const DECISIONS = [
  { owner: '张明', deadline: '5月15日', risk: '高', action: '协调交付资源，通知客户', riskColor: 'var(--color-signal-risk)' },
  { owner: '李华', deadline: '5月18日', risk: '中', action: '更新Q2预算，提交审批', riskColor: 'var(--color-signal-warning)' },
  { owner: '王磊', deadline: '5月20日', risk: '低', action: '安排下周复盘会议', riskColor: 'var(--color-signal-success)' },
];

export default function CompareSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const noiseRefs = useRef<HTMLDivElement[]>([]);
  const coreRef = useRef<HTMLDivElement>(null);
  const decisionRefs = useRef<HTMLDivElement[]>([]);
  const connectingLinesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = safeContext(() => {
      const setNoiseSettledState = (el: HTMLDivElement, i: number) => {
        const frag = NOISE_FRAGMENTS[i];
        gsap.set(el, {
          x: frag.settledX,
          y: frag.settledY,
          rotation: frag.settledRotate,
          scale: frag.settledScale,
          opacity: frag.settledOpacity,
        });
      };

      const setCoreRestingState = () => {
        if (!coreRef.current) return;
        const rings = Array.from(coreRef.current.querySelectorAll('.core-ring'));
        gsap.set(rings, { scale: 1, opacity: 1 });
        gsap.set(coreRef.current.querySelector('.core-center'), { scale: 1 });
      };

      if (reduced) {
        // Show the same partial-conversion end state immediately.
        noiseRefs.current.forEach((el, i) => {
          if (el) setNoiseSettledState(el, i);
        });
        decisionRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, x: 0 });
        });
        setCoreRestingState();
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      // 1. Noise fragments appear with stagger
      noiseRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, scale: 0.8, rotation: NOISE_FRAGMENTS[i].rotate, x: 0, y: 0 });
        tl.to(
          el,
          { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
          i * 0.08,
        );
      });

      // 2. Core pulses
      if (coreRef.current) {
        const rings = Array.from(coreRef.current.querySelectorAll('.core-ring'));
        tl.fromTo(
          rings,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
          0.8,
        );
      }

      // 3. Only selected signal fragments compress; ambient noise stays visible.
      noiseRefs.current.forEach((el, i) => {
        if (!el) return;
        const frag = NOISE_FRAGMENTS[i];
        const timing = frag.mode === 'convert' ? 1.42 + i * 0.02 : 1.34 + i * 0.02;

        if (frag.mode !== 'convert') {
          tl.to(
            el,
            {
              x: frag.settledX,
              y: frag.settledY,
              rotation: frag.settledRotate,
              scale: frag.settledScale,
              opacity: frag.settledOpacity,
              duration: 0.5,
              ease: 'power2.out',
            },
            timing,
          );
          return;
        }

        tl.to(
          el,
          { opacity: 1, scale: 1.06, duration: 0.2, ease: 'power2.out' },
          1.22 + i * 0.03,
        );
        tl.to(
          el,
          {
            x: frag.settledX,
            y: frag.settledY,
            rotation: frag.settledRotate,
            scale: frag.settledScale,
            opacity: frag.settledOpacity,
            duration: 0.6,
            ease: 'power2.in',
          },
          timing,
        );
      });

      // 4. Core flash
      if (coreRef.current) {
        tl.to(
          coreRef.current.querySelector('.core-center'),
          { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' },
          2.0,
        );
      }

      // 5. Decision cards slide in from center
      decisionRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, x: '-30%' });
        tl.to(
          el,
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
          2.2 + i * 0.15,
        );
      });

      // 6. Connection lines draw
      const lines = connectingLinesRef.current?.querySelectorAll('line');
      if (lines) {
        lines.forEach((line, i) => {
          const length = line.getTotalLength?.() ?? 100;
          gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
          tl.to(
            line,
            { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' },
            2.8 + i * 0.1,
          );
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="section-compare"
      ref={sectionRef}
      className="relative"
      data-transformed-noise-count={TRANSFORMED_NOISE_COUNT}
      data-retained-noise-count={RETAINED_NOISE_COUNT}
      style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}
    >
      <h2
        className="font-semibold text-center mx-auto px-6"
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.2,
          marginBottom: 64,
        }}
      >
        从噪声到决策
      </h2>

      {/* Desktop: 3-zone layout */}
      <div
        className="hidden md:grid mx-auto px-6 relative"
        data-compare-desktop
        style={{
          maxWidth: 1100,
          gridTemplateColumns: '1fr 200px 1fr',
          gap: '0 32px',
          minHeight: 420,
        }}
      >
        {/* Left Zone: Noise */}
        <div className="relative" style={{ minHeight: 400 }}>
          {NOISE_FRAGMENTS.map((frag, i) => (
            <div
              key={i}
              ref={(el) => { if (el) noiseRefs.current[i] = el; }}
              className="absolute"
              data-noise-card
              data-noise-mode={frag.mode}
              style={{
                left: frag.x,
                top: frag.y,
                transform: `rotate(${frag.rotate}deg)`,
                background: 'var(--color-surface-elevated)',
                border: frag.mode === 'queue'
                  ? '1px solid var(--color-brand-accent)'
                  : '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '0.8125rem',
                color: frag.mode === 'convert'
                  ? 'var(--color-text-tertiary)'
                  : 'var(--color-text-secondary)',
                maxWidth: 200,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                boxShadow: frag.mode === 'queue' ? '0 8px 24px rgba(59, 130, 246, 0.08)' : undefined,
              }}
            >
              {frag.text}
            </div>
          ))}
        </div>

        {/* Center Zone: AutoMage Core */}
        <div className="flex items-center justify-center">
          <div ref={coreRef} className="relative" style={{ width: 160, height: 160 }}>
            <div className="core-ring absolute inset-0 flex items-center justify-center" style={{ opacity: 0 }}>
              <div style={{
                width: 160, height: 160, borderRadius: '50%',
                border: '1px solid var(--color-brand-accent)',
                opacity: 0.1,
              }} />
            </div>
            <div className="core-ring absolute inset-0 flex items-center justify-center" style={{ opacity: 0 }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                border: '1px solid var(--color-brand-accent)',
                opacity: 0.2,
              }} />
            </div>
            <div className="core-ring absolute inset-0 flex items-center justify-center" style={{ opacity: 0 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '1px solid var(--color-brand-accent)',
                opacity: 0.3,
              }} />
            </div>
            <div className="core-center absolute inset-0 flex items-center justify-center">
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-accent))',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
              }} />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
              AutoMage Core
            </div>
          </div>
        </div>

        {/* Right Zone: Decision Cards */}
        <div className="flex flex-col justify-center gap-4">
          {DECISIONS.map((d, i) => (
            <div
              key={i}
              ref={(el) => { if (el) decisionRefs.current[i] = el; }}
              data-decision-card
              style={{
                background: 'var(--color-surface-card)',
                borderLeft: '3px solid var(--color-brand-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>责任人</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{d.owner}</span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: d.riskColor,
                    color: 'var(--color-text-on-dark)',
                    fontWeight: 600,
                  }}
                >
                  {d.risk}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>截止</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{d.deadline}</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>行动</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{d.action}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Connection lines overlay */}
        <svg
          ref={connectingLinesRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <line x1="33%" y1="50%" x2="45%" y2="50%" stroke="var(--color-brand-accent)" strokeWidth="1" opacity="0.15" />
          <line x1="55%" y1="50%" x2="67%" y2="50%" stroke="var(--color-brand-accent)" strokeWidth="1" opacity="0.15" />
        </svg>
      </div>

      {/* Mobile: Vertical stack */}
      <div className="md:hidden px-6 mx-auto" style={{ maxWidth: 480 }}>
        <div className="text-center mb-8">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)', marginBottom: 16 }}>组织噪声</p>
          <div className="flex flex-wrap justify-center gap-2">
            {NOISE_FRAGMENTS.slice(0, 4).map((frag, i) => (
              <span
                key={i}
                style={{
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                {frag.text.split('：')[0]}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center my-6">
          <svg width="2" height="40" aria-hidden="true">
            <line x1="1" y1="0" x2="1" y2="40" stroke="var(--color-brand-accent)" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="text-center mb-6">
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto',
            background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-accent))',
          }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 8 }}>AutoMage Core</p>
        </div>

        <div className="flex justify-center my-6">
          <svg width="2" height="40" aria-hidden="true">
            <line x1="1" y1="0" x2="1" y2="40" stroke="var(--color-brand-accent)" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="flex flex-col gap-3">
          {DECISIONS.map((d, i) => (
            <div
              key={i}
              style={{
                background: 'var(--color-surface-card)',
                borderLeft: `3px solid ${d.riskColor}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.owner}</span>
                <span style={{ fontSize: '0.6875rem', padding: '2px 6px', borderRadius: 'var(--radius-full)', background: d.riskColor, color: 'var(--color-text-on-dark)' }}>{d.risk}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>{d.action}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
