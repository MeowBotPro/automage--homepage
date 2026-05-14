'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap, safeContext } from '@/lib/gsap';
import {
  ClipboardPenLine,
  BotMessageSquare,
  UserRoundCheck,
  FilePenLine,
  BadgeCheck,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

/* ── Flow Step ── */
interface FlowStep {
  id: string;
  label: string;
  Icon: LucideIcon;
  iconType: 'staff' | 'ai' | 'manager' | 'draft' | 'boss' | 'workflow';
  title: string;
  text: string;
  angle: number;
}

const STEPS: FlowStep[] = [
  { id: 'staff', label: 'Staff', Icon: ClipboardPenLine, iconType: 'staff', title: 'Staff 提交日报', text: '今天提交了 23 条一线记录', angle: 0 },
  { id: 'ai', label: 'AI', Icon: BotMessageSquare, iconType: 'ai', title: 'AI 自动汇总', text: '识别 4 个风险、2 个依赖、1 个异常', angle: 60 },
  { id: 'manager', label: 'Manager', Icon: UserRoundCheck, iconType: 'manager', title: 'Manager 审阅确认', text: '审阅通过 3 条，标记 1 条需补充', angle: 120 },
  { id: 'dream', label: 'Dream', Icon: FilePenLine, iconType: 'draft', title: 'Dream 生成草案', text: '生成 A/B 两个决策选项', angle: 180 },
  { id: 'boss', label: 'Boss', Icon: BadgeCheck, iconType: 'boss', title: 'Boss 确认决策', text: '选择 B，并设定优先级', angle: 240 },
  { id: 'task', label: 'Task', Icon: Workflow, iconType: 'workflow', title: '任务自动回流', text: '自动生成 5 个任务，分配到 3 人', angle: 300 },
];

/* ── Orbit geometry ── */
const LOOP_RADIUS = 180;
const CENTER = 250;
const SVG_SIZE = 500;
const SLOT_SIZE = 44; // fixed foreignObject size for slot-based positioning

function nodePosition(angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + LOOP_RADIUS * Math.cos(rad),
    y: CENTER + LOOP_RADIUS * Math.sin(rad),
  };
}

function buildCirclePath(): string {
  const r = LOOP_RADIUS;
  return `M ${CENTER} ${CENTER - r} A ${r} ${r} 0 1 1 ${CENTER - 0.001} ${CENTER - r}`;
}

const CIRCLE_PATH_D = buildCirclePath();

/* ── Component ── */
export default function InfoLoopSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);
  const trail1Ref = useRef<SVGCircleElement>(null);
  const trail2Ref = useRef<SVGCircleElement>(null);
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const glowRefs = useRef<(SVGCircleElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);
  const loopBackRef = useRef<SVGPathElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const prefersReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // ── Scroll-driven animation ──
  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const reduced = prefersReducedMotion();
    const ctx = safeContext(() => {
      if (reduced) return;

      const trailEls = [trail1Ref.current, trail2Ref.current].filter(Boolean) as SVGCircleElement[];
      const PARTICLE_DURATION = 6;

      const placeAtProgress = (el: SVGCircleElement, p: number) => {
        const angleDeg = Math.min(1, Math.max(0, p)) * 360;
        const rad = ((angleDeg - 90) * Math.PI) / 180;
        el.setAttribute('cx', String(CENTER + LOOP_RADIUS * Math.cos(rad)));
        el.setAttribute('cy', String(CENTER + LOOP_RADIUS * Math.sin(rad)));
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          pinSpacing: true,
          scrub: true,
          start: 'top top',
          end: '+=2000',
        },
      });

      // Initialize particle + trail
      if (particleRef.current) {
        const startRad = ((-90) * Math.PI) / 180;
        const startX = CENTER + LOOP_RADIUS * Math.cos(startRad);
        const startY = CENTER + LOOP_RADIUS * Math.sin(startRad);
        [particleRef.current, ...trailEls].forEach((el) => {
          el.setAttribute('cx', String(startX));
          el.setAttribute('cy', String(startY));
          el.setAttribute('opacity', '0');
        });
      }

      // Particle position + opacity driven by rAF
      let rafId = 0;
      const updateParticle = () => {
        rafId = 0;
        if (!particleRef.current) return;
        const scrubP = tl.progress();
        const pTime = scrubP * (tl.duration() || 7);
        const particleP = Math.min(1, pTime / PARTICLE_DURATION);

        placeAtProgress(particleRef.current, particleP);
        trailEls.forEach((trail, i) => {
          placeAtProgress(trail, Math.max(0, particleP - (i + 1) * 0.02));
        });

        const fadeIn = Math.min(1, scrubP / 0.05);
        const fadeOut = Math.min(1, (1 - scrubP) / 0.05);
        const opacity = Math.min(fadeIn, fadeOut);
        particleRef.current.setAttribute('opacity', String(opacity));
        trailEls.forEach((trail, i) => {
          trail.setAttribute('opacity', String(opacity * (0.3 - i * 0.1)));
        });
      };
      const scheduleUpdate = () => {
        if (!rafId) rafId = requestAnimationFrame(updateParticle);
      };
      window.addEventListener('scroll', scheduleUpdate, { passive: true });
      scheduleUpdate();

      // Node activation
      const nodeCount = STEPS.length;
      for (let i = 0; i < nodeCount; i++) {
        const startTime = (i / nodeCount) * 6;

        tl.call(() => setActiveIndex(i), undefined, startTime);

        // Scale inner node (slot-based: structural size stays fixed)
        if (innerRefs.current[i]) {
          tl.to(innerRefs.current[i], { scale: 1.15, duration: 0.3, ease: 'power2.out' }, startTime);
          if (i > 0 && innerRefs.current[i - 1]) {
            tl.to(innerRefs.current[i - 1], { scale: 1, duration: 0.3, ease: 'power2.out' }, startTime);
          }
        }

        // Glow pulse
        if (glowRefs.current[i]) {
          tl.fromTo(
            glowRefs.current[i],
            { attr: { r: 20 }, opacity: 0.4 },
            { attr: { r: 32 }, opacity: 0, duration: 0.6, ease: 'power2.out' },
            startTime,
          );
        }

        // Label opacity
        if (labelRefs.current[i]) {
          tl.to(labelRefs.current[i], { opacity: 1, duration: 0.3 }, startTime);
          if (i > 0 && labelRefs.current[i - 1]) {
            tl.to(labelRefs.current[i - 1], { opacity: 0.65, duration: 0.3 }, startTime);
          }
        }
      }

      // Completion
      tl.call(() => setIsComplete(true), undefined, 6);

      // All nodes pulse
      innerRefs.current.forEach((node) => {
        if (!node) return;
        tl.to(node, { scale: 1.1, duration: 0.15, yoyo: true, repeat: 1 }, 6);
      });

      // Loop-back path draws
      if (loopBackRef.current) {
        const len = loopBackRef.current.getTotalLength();
        gsap.set(loopBackRef.current, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(loopBackRef.current, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 6.2);
      }

      // Particle fades out
      if (particleRef.current) {
        tl.to(particleRef.current, { opacity: 0, duration: 0.3 }, 6.8);
      }

      return () => {
        window.removeEventListener('scroll', scheduleUpdate);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // ── Inspector cross-fade ──
  useEffect(() => {
    if (!inspectorRef.current) return;
    if (prefersReducedMotion()) return;

    gsap.fromTo(
      inspectorRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
    );
  }, [activeIndex, prefersReducedMotion]);

  const currentStep = STEPS[activeIndex];

  return (
    <section
      id="section-loop"
      ref={sectionRef}
      aria-label="组织信息回路模拟器"
      style={{
        background: 'var(--color-surface-deep)',
        paddingTop: 'calc(var(--space-section) + 60px)',
        paddingBottom: 'var(--space-section)',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        {/* Title */}
        <h2
          className="font-semibold text-center"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--color-text-on-dark)',
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          信息如何在你的组织中流动
        </h2>
        <p
          className="text-center"
          style={{
            fontSize: '1.125rem',
            color: 'var(--color-text-on-dark-muted)',
            marginBottom: 48,
          }}
        >
          六个节点，一个闭环
        </p>

        {/* ═══ Desktop: Orbit + Inspector ═══ */}
        <div
          className="desktop-flow items-center justify-center"
          style={{
            gap: 72,
            maxWidth: 1040,
            margin: '0 auto',
          }}
        >
          {/* SVG Orbit */}
          <div style={{ width: 'clamp(300px, 28vw, 380px)', flexShrink: 0, aspectRatio: '1' }}>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              fill="none"
              style={{ overflow: 'visible' }}
            >
              {/* Background circle */}
              <path
                d={CIRCLE_PATH_D}
                stroke="var(--color-loop-path)"
                strokeWidth={2}
                fill="none"
                opacity={0.3}
              />

              {/* Loop-back dashed path */}
              <path
                ref={loopBackRef}
                d={CIRCLE_PATH_D}
                stroke="var(--color-loop-path-active)"
                strokeWidth={2}
                fill="none"
                strokeDasharray="6 4"
                opacity={0.5}
              />

              {/* Motion path (invisible) */}
              <path d={CIRCLE_PATH_D} fill="none" stroke="transparent" data-loop-circle />

              {/* Nodes — slot-based: fixed foreignObject, GSAP scales inner div */}
              {STEPS.map((step, i) => {
                const pos = nodePosition(step.angle);
                const isActive = i === activeIndex;
                const isDone = i < activeIndex;
                const StepIcon = step.Icon;
                return (
                  <g key={step.id}>
                    {/* Glow ring */}
                    <circle
                      ref={(el) => { glowRefs.current[i] = el; }}
                      cx={pos.x}
                      cy={pos.y}
                      r={20}
                      fill="var(--color-loop-node-glow)"
                      opacity={0}
                    />

                    {/* Slot: fixed-size foreignObject, position never changes */}
                    <foreignObject
                      x={pos.x - SLOT_SIZE / 2}
                      y={pos.y - SLOT_SIZE / 2}
                      width={SLOT_SIZE}
                      height={SLOT_SIZE}
                      className="pointer-events-none"
                      style={{ overflow: 'visible' }}
                    >
                      <div
                        ref={(el) => { innerRefs.current[i] = el; }}
                        data-active={isActive}
                        data-done={isDone}
                        style={{
                          width: 40,
                          height: 40,
                          margin: 2, // center 40px in 44px slot
                          borderRadius: '999px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          transformOrigin: 'center center',
                          background: isActive
                            ? 'radial-gradient(circle at 35% 20%, rgba(147,197,253,0.28), transparent 42%), linear-gradient(180deg, rgba(30,64,175,0.55), rgba(15,23,42,0.92))'
                            : 'var(--node-bg)',
                          border: `1px solid ${isActive
                            ? 'var(--node-border-active)'
                            : isDone
                              ? 'var(--node-border-done)'
                              : 'var(--node-border)'}`,
                          boxShadow: isActive
                            ? '0 0 0 1px rgba(147,197,253,0.18), 0 0 0 8px rgba(59,130,246,0.08), 0 18px 48px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.16)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 28px rgba(0,0,0,0.18)',
                          transition: 'background 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
                        }}
                      >
                        <StepIcon
                          size={isActive ? 20 : 18}
                          strokeWidth={1.85}
                          style={{
                            color: isActive
                              ? 'var(--node-icon-color-active)'
                              : isDone
                                ? 'var(--node-icon-color-done)'
                                : 'var(--node-icon-color)',
                            transition: 'color 300ms ease',
                          }}
                        />
                      </div>
                    </foreignObject>

                    {/* Label */}
                    <text
                      ref={(el) => { labelRefs.current[i] = el; }}
                      x={pos.x}
                      y={pos.y + 30}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={isActive ? 700 : 400}
                      fill="var(--color-text-on-dark)"
                      opacity={0.65}
                      className="pointer-events-none select-none"
                    >
                      {step.label}
                    </text>
                  </g>
                );
              })}

              {/* Particle */}
              <circle ref={particleRef} r={6} fill="var(--color-loop-particle)" />
              <circle ref={trail1Ref} r={4} fill="var(--color-loop-particle)" />
              <circle ref={trail2Ref} r={2} fill="var(--color-loop-particle)" />
            </svg>
          </div>

          {/* Inspector Panel */}
          <div
            ref={inspectorRef}
            role="status"
            aria-live="polite"
            style={{
              width: 360,
              minHeight: 220,
              background: 'linear-gradient(180deg, rgba(15,23,42,0.78), rgba(15,23,42,0.56))',
              border: '1px solid rgba(148,163,184,0.16)',
              borderRadius: 24,
              padding: 28,
              flexShrink: 0,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 28px 80px rgba(0,0,0,0.18)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '999px',
                  background: 'var(--node-bg)',
                  border: '1px solid var(--node-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <currentStep.Icon size={20} strokeWidth={1.85} style={{ color: 'var(--node-icon-color-done)' }} />
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-on-dark)' }}>
                {currentStep.title}
              </span>
            </div>

            {/* Data */}
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-on-dark-muted)', lineHeight: 1.65, marginBottom: 24 }}>
              {currentStep.text}
            </p>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {STEPS.map((step, i) => (
                <div
                  key={step.id}
                  style={{
                    width: i === activeIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 'var(--radius-full)',
                    background: i === activeIndex
                      ? 'var(--color-brand-accent)'
                      : i < activeIndex
                        ? 'rgba(96,165,250,0.4)'
                        : 'rgba(255,255,255,0.12)',
                    opacity: i < activeIndex ? 0.7 : 1,
                    transition: 'all 300ms ease',
                  }}
                />
              ))}
            </div>

            {/* Completion */}
            {isComplete && (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-signal-success)',
                }}
              >
                闭环完成 — 信息从一线回到一线
              </div>
            )}
          </div>
        </div>

        {/* ═══ Mobile: Timeline ═══ */}
        <div
          className="mobile-flow flex-col items-center"
          style={{ position: 'relative', gap: 32 }}
        >
          {/* Info flow main line */}
          <div
            className="pointer-events-none"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 'calc(24px - 0.5px)',
              top: 24,
              bottom: 24,
              width: 1,
              background: 'linear-gradient(to bottom, rgba(96,165,250,0.05), rgba(96,165,250,0.3), rgba(96,165,250,0.05))',
            }}
          />
          {/* Signal dot */}
          <div
            className="pointer-events-none"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 'calc(24px - 2.5px)',
              top: 28,
              width: 5,
              height: 5,
              borderRadius: '999px',
              background: '#60a5fa',
              boxShadow: '0 0 16px rgba(96,165,250,0.9)',
              animation: 'loop-signal-flow 5s ease-in-out infinite',
            }}
          />

          {STEPS.map((step, i) => {
            const isActive = i === activeIndex;
            const isDone = i < activeIndex;
            const StepIcon = step.Icon;
            return (
              <div key={step.id} className="flex items-center gap-4 w-full" style={{ maxWidth: 360 }}>
                {/* Node */}
                <div
                  data-type={step.iconType}
                  style={{
                    width: isActive ? 48 : 44,
                    height: isActive ? 48 : 44,
                    borderRadius: '999px',
                    background: isActive
                      ? 'radial-gradient(circle at 35% 20%, rgba(147,197,253,0.28), transparent 42%), linear-gradient(180deg, rgba(30,64,175,0.55), rgba(15,23,42,0.92))'
                      : 'var(--node-bg)',
                    border: `1px solid ${isActive
                      ? 'var(--node-border-active)'
                      : isDone
                        ? 'var(--node-border-done)'
                        : 'var(--node-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isActive
                      ? '0 0 0 1px rgba(147,197,253,0.18), 0 0 0 8px rgba(59,130,246,0.08), 0 12px 32px rgba(37,99,235,0.28)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 300ms ease',
                    position: 'relative',
                  }}
                  role="img"
                  aria-label={`${step.label} — ${step.text}`}
                >
                  <StepIcon
                    size={isActive ? 20 : 18}
                    strokeWidth={1.85}
                    style={{
                      color: isActive
                        ? 'var(--node-icon-color-active)'
                        : isDone
                          ? 'var(--node-icon-color-done)'
                          : 'var(--node-icon-color)',
                      transition: 'color 300ms ease',
                    }}
                  />
                  {/* AI scan overlay */}
                  {step.iconType === 'ai' && isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 6,
                        borderRadius: '999px',
                        background: 'linear-gradient(180deg, transparent, rgba(147,197,253,0.2), transparent)',
                        animation: 'loop-node-scan 2.4s ease-in-out infinite',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>

                {/* Text */}
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? 'var(--color-text-on-dark)' : 'rgba(226,232,240,0.85)',
                    transition: 'color 300ms ease',
                  }}>
                    {step.title}
                  </p>
                  <p style={{
                    fontSize: '0.8125rem',
                    color: isActive ? '#93C5FD' : 'var(--color-text-on-dark-muted)',
                    transition: 'color 300ms ease',
                    marginTop: 2,
                  }}>
                    {step.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Responsive visibility — show desktop at >= 1024px, hide mobile */}
        <style>{`
          .desktop-flow { display: none; }
          .mobile-flow { display: flex; }
          @media (min-width: 1024px) {
            .desktop-flow { display: flex; }
            .mobile-flow { display: none; }
          }
        `}</style>
      </div>
    </section>
  );
}
