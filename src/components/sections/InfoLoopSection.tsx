'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap, safeContext } from '@/lib/gsap';
import {
  FileText,
  Shield,
  CheckCircle,
  GitBranch,
  Send,
  ScanLine,
  Eye,
  Sparkles,
  Target,
  Users,
  AlertTriangle,
  CheckSquare,
  type LucideIcon,
} from 'lucide-react';

/* ── Inspector Data ── */
interface InspectorData {
  input: string[];
  output: string[];
  status: string;
}

/* ── Flow Step ── */
interface FlowStep {
  id: string;
  label: string;
  Icon: LucideIcon;
  iconType: 'staff' | 'ai' | 'manager' | 'draft' | 'boss' | 'workflow';
  title: string;
  text: string;
  angle: number;
  inspector: InspectorData;
}

const STEPS: FlowStep[] = [
  {
    id: 'staff', label: 'Staff', Icon: FileText, iconType: 'staff',
    title: 'Staff 提交日报', text: '今天提交了 23 条一线记录', angle: 0,
    inspector: {
      input: ['一线信息 23 条', '覆盖 5 个项目线'],
      output: ['信号已录入系统', '等待 AI 处理'],
      status: '信息捕获完成',
    },
  },
  {
    id: 'ai', label: 'AI', Icon: ScanLine, iconType: 'ai',
    title: 'AI 自动汇总', text: '识别 4 个风险、2 个依赖、1 个异常', angle: 60,
    inspector: {
      input: ['23 条原始信号', '上下文：项目历史 + 团队状态'],
      output: ['4 个风险识别', '2 个依赖关系', '1 个异常标记'],
      status: '语义压缩完成',
    },
  },
  {
    id: 'manager', label: 'Manager', Icon: Eye, iconType: 'manager',
    title: 'Manager 审阅确认', text: '审阅通过 3 条，标记 1 条需补充', angle: 120,
    inspector: {
      input: ['AI 汇总报告', '风险优先级排序'],
      output: ['3 条审阅通过', '1 条标记补充'],
      status: '人工校验完成',
    },
  },
  {
    id: 'dream', label: 'Dream', Icon: Sparkles, iconType: 'draft',
    title: 'Dream 生成草案', text: '生成 A/B 两个决策选项', angle: 180,
    inspector: {
      input: ['审阅确认的情报', 'Boss 决策偏好模型'],
      output: ['方案 A：延期 + 资源增补', '方案 B：范围调整 + 优先级重排'],
      status: '决策草案就绪',
    },
  },
  {
    id: 'boss', label: 'Boss', Icon: CheckCircle, iconType: 'boss',
    title: 'Boss 确认决策', text: '选择 B，并设定优先级', angle: 240,
    inspector: {
      input: ['A/B 两个方案', '优先级：High', '截止时间：本周五'],
      output: ['确认方案 B', '设定交付优先级'],
      status: '决策锁定',
    },
  },
  {
    id: 'task', label: 'Task', Icon: GitBranch, iconType: 'workflow',
    title: '任务自动回流', text: '自动生成 5 个任务，分配到 3 人', angle: 300,
    inspector: {
      input: ['Boss 确认方案 B', '优先级：High', '截止时间：本周五'],
      output: ['任务 01：同步客户延期风险', '任务 02：补充项目依赖说明', '任务 03：更新交付计划'],
      status: '闭环完成，一线信息回到一线',
    },
  },
];

/* ── Orbit geometry ── */
const LOOP_RADIUS = 230;
const CENTER = 320;
const SVG_SIZE = 640;
const SLOT_SIZE = 52;

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

/* ── Background nodes (decorative) ── */
interface BgNodeDef {
  label: string;
  Icon: LucideIcon;
  top: string;
  left: string;
}

const BG_NODES: BgNodeDef[] = [
  { label: 'Sales', Icon: Send, top: '16%', left: '8%' },
  { label: 'Support', Icon: Users, top: '22%', left: '82%' },
  { label: 'Project', Icon: Target, top: '52%', left: '4%' },
  { label: 'Finance', Icon: Shield, top: '72%', left: '86%' },
  { label: 'Risk', Icon: AlertTriangle, top: '85%', left: '14%' },
  { label: 'Delivery', Icon: CheckSquare, top: '40%', left: '90%' },
];

/* ── Signal particles (decorative) ── */
interface SignalParticleDef {
  top: string;
  left: string;
  delay: string;
  tx: string;
  ty: string;
}

const SIGNAL_PARTICLES: SignalParticleDef[] = [
  { top: '20%', left: '14%', delay: '0s', tx: '18vw', ty: '8vh' },
  { top: '26%', left: '80%', delay: '1.2s', tx: '-22vw', ty: '6vh' },
  { top: '56%', left: '10%', delay: '2.4s', tx: '20vw', ty: '-12vh' },
  { top: '76%', left: '82%', delay: '0.8s', tx: '-20vw', ty: '-18vh' },
  { top: '88%', left: '20%', delay: '3.2s', tx: '16vw', ty: '-24vh' },
];

/* ── Stats data ── */
const STATS = [
  { value: '23', label: 'Signals captured' },
  { value: '4', label: 'Risks compressed' },
  { value: '5', label: 'Tasks assigned' },
];

/* ── Component ── */
export default function InfoLoopSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);
  const trail1Ref = useRef<SVGCircleElement>(null);
  const trail2Ref = useRef<SVGCircleElement>(null);
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

        if (innerRefs.current[i]) {
          tl.to(innerRefs.current[i], { scale: 1.18, duration: 0.3, ease: 'power2.out' }, startTime);
          if (i > 0 && innerRefs.current[i - 1]) {
            tl.to(innerRefs.current[i - 1], { scale: 1, duration: 0.3, ease: 'power2.out' }, startTime);
          }
        }

        if (glowRefs.current[i]) {
          tl.fromTo(
            glowRefs.current[i],
            { attr: { r: 24 }, opacity: 0.45 },
            { attr: { r: 38 }, opacity: 0, duration: 0.6, ease: 'power2.out' },
            startTime,
          );
        }

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
        tl.to(node, { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1 }, 6);
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
  const currentInspector = currentStep.inspector;

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ═══ Background: Organizational Nodes + Signal Particles ═══ */}
      <div className="loop-bg-decor" aria-hidden="true">
        {BG_NODES.map((node) => {
          const NodeIcon = node.Icon;
          return (
            <div
              key={node.label}
              className="pointer-events-none"
              style={{
                position: 'absolute',
                top: node.top,
                left: node.left,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(147,197,253,0.12)',
                border: '1px solid rgba(96,165,250,0.06)',
                background: 'rgba(15,23,42,0.2)',
                borderRadius: 999,
                padding: '5px 10px',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              <NodeIcon size={12} strokeWidth={1.6} style={{ opacity: 0.7 }} />
              {node.label}
            </div>
          );
        })}

        {SIGNAL_PARTICLES.map((sp, i) => (
          <div
            key={i}
            className="pointer-events-none"
            style={{
              position: 'absolute',
              top: sp.top,
              left: sp.left,
              width: 4,
              height: 4,
              borderRadius: 999,
              background: 'rgba(96,165,250,0.6)',
              boxShadow: '0 0 10px rgba(96,165,250,0.4)',
              animation: `loop-particle-drift 7s ${sp.delay} ease-in-out infinite`,
              ['--tx' as string]: sp.tx,
              ['--ty' as string]: sp.ty,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* ── Title ── */}
        <div style={{ maxWidth: 720, margin: '0 auto 72px', textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(147,197,253,0.6)',
              marginBottom: 16,
            }}
          >
            INFORMATION LOOP
          </span>
          <h2
            className="font-semibold"
            style={{
              fontSize: 'clamp(2rem, 4.2vw, 3.25rem)',
              color: 'var(--color-text-on-dark)',
              lineHeight: 1.15,
              marginBottom: 20,
              letterSpacing: '-0.03em',
            }}
          >
            信息如何在你的组织中流动
          </h2>
          <p
            style={{
              fontSize: '1.0625rem',
              lineHeight: 1.75,
              color: 'rgba(148,163,184,0.72)',
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            从一线记录，到管理判断，再到任务回流，AutoMage 把组织里的每一次输入变成可追踪的决策闭环。
          </p>
        </div>

        {/* ═══ Desktop: Orbit + Inspector ═══ */}
        <div
          className="desktop-flow items-center justify-center"
          style={{
            gap: 80,
            maxWidth: 1120,
            margin: '0 auto',
          }}
        >
          {/* ── SVG Orbit ── */}
          <div style={{ width: '100%', aspectRatio: '1', flexShrink: 0 }}>
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
                opacity={0.35}
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

              {/* ── Nodes ── */}
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
                      r={24}
                      fill="var(--color-loop-node-glow)"
                      opacity={0}
                    />

                    {/* Slot */}
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
                          width: 48,
                          height: 48,
                          margin: 2,
                          borderRadius: '999px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          transformOrigin: 'center center',
                          background: isActive
                            ? 'radial-gradient(circle at 35% 20%, rgba(147,197,253,0.3), transparent 42%), linear-gradient(180deg, rgba(30,64,175,0.6), rgba(15,23,42,0.92))'
                            : 'var(--node-bg)',
                          border: `1px solid ${isActive
                            ? 'var(--node-border-active)'
                            : isDone
                              ? 'var(--node-border-done)'
                              : 'var(--node-border)'}`,
                          boxShadow: isActive
                            ? '0 0 0 1px rgba(147,197,253,0.18), 0 0 0 10px rgba(59,130,246,0.08), 0 20px 56px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.16)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 28px rgba(0,0,0,0.18)',
                          transition: 'background 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
                        }}
                      >
                        <StepIcon
                          size={isActive ? 22 : 20}
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
                      y={pos.y + 36}
                      textAnchor="middle"
                      fontSize={13}
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
              <circle ref={particleRef} r={7} fill="var(--color-loop-particle)" />
              <circle ref={trail1Ref} r={5} fill="var(--color-loop-particle)" />
              <circle ref={trail2Ref} r={3} fill="var(--color-loop-particle)" />
            </svg>
          </div>

          {/* ── Inspector Panel ── */}
          <div
            ref={inspectorRef}
            role="status"
            aria-live="polite"
            style={{
              width: 440,
              minHeight: 320,
              background:
                'radial-gradient(circle at 20% 0%, rgba(59,130,246,0.12), transparent 42%), linear-gradient(180deg, rgba(15,23,42,0.86), rgba(15,23,42,0.62))',
              border: '1px solid rgba(148,163,184,0.16)',
              borderRadius: 28,
              padding: 28,
              flexShrink: 0,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 32px 90px rgba(0,0,0,0.24)',
            }}
          >
            {/* ── Header ── */}
            <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '999px',
                  background:
                    'radial-gradient(circle at 35% 20%, rgba(147,197,253,0.2), transparent 42%), linear-gradient(180deg, rgba(30,64,175,0.4), rgba(15,23,42,0.85))',
                  border: '1px solid rgba(96,165,250,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 0 1px rgba(147,197,253,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <currentStep.Icon size={22} strokeWidth={1.85} style={{ color: 'var(--color-glyph-stroke-light)' }} />
              </div>
              <div>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-on-dark)', display: 'block', lineHeight: 1.3 }}>
                  {currentStep.title}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(147,197,253,0.6)', marginTop: 2, display: 'block' }}>
                  {currentStep.text}
                </span>
              </div>
            </div>

            {/* ── Data Sections ── */}
            {/* Input */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(148,163,184,0.5)',
                marginBottom: 8,
              }}>
                Input
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {currentInspector.input.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: 999,
                      background: 'rgba(96,165,250,0.5)',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '0.8125rem', color: 'rgba(226,232,240,0.8)', lineHeight: 1.5 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(148,163,184,0.1)', marginBottom: 20 }} />

            {/* Output */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(148,163,184,0.5)',
                marginBottom: 8,
              }}>
                Output
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {currentInspector.output.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: 999,
                      background: 'rgba(59,130,246,0.6)',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '0.8125rem', color: 'rgba(226,232,240,0.8)', lineHeight: 1.5 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(148,163,184,0.1)', marginBottom: 20 }} />

            {/* Status */}
            <div
              style={{
                padding: '10px 14px',
                background: isComplete
                  ? 'rgba(34,197,94,0.1)'
                  : 'rgba(59,130,246,0.08)',
                border: `1px solid ${isComplete
                  ? 'rgba(34,197,94,0.2)'
                  : 'rgba(59,130,246,0.12)'}`,
                borderRadius: 12,
                fontSize: '0.8125rem',
                color: isComplete ? 'var(--color-signal-success)' : 'rgba(147,197,253,0.8)',
                fontWeight: 500,
              }}
            >
              {currentInspector.status}
            </div>

            {/* ── Progress Dots ── */}
            <div className="flex items-center gap-2" style={{ marginTop: 24 }}>
              {STEPS.map((step, i) => (
                <div
                  key={step.id}
                  style={{
                    width: i === activeIndex ? 28 : 8,
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
          </div>
        </div>

        {/* ═══ Stats Row ═══ */}
        <div
          className="loop-stats items-center justify-center"
          style={{
            marginTop: 72,
            gap: 48,
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <span style={{
                fontSize: 'clamp(1.5rem, 2vw, 2rem)',
                fontWeight: 700,
                color: 'var(--color-brand-accent)',
                lineHeight: 1,
              }}>
                {stat.value}
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: 'rgba(148,163,184,0.6)',
              }}>
                {stat.label}
              </span>
            </div>
          ))}
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
              borderRadius: 999,
              background: 'var(--color-glyph-stroke)',
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
                    borderRadius: 999,
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
                        borderRadius: 999,
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
                    color: isActive ? 'var(--color-glyph-stroke-light)' : 'var(--color-text-on-dark-muted)',
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
          .loop-stats { display: none; }
          .loop-bg-decor { display: none; }
          @media (min-width: 1024px) {
            .desktop-flow { display: grid; grid-template-columns: clamp(420px, 34vw, 560px) 440px; }
            .mobile-flow { display: none; }
            .loop-stats { display: flex; }
            .loop-bg-decor { display: block; }
          }
        `}</style>
      </div>
    </section>
  );
}
