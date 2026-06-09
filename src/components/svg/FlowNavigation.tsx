'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { gsap, ScrollTrigger, gsapReady } from '@/lib/gsap';

interface LoopNode {
  id: string;
  label: string;
  zhLabel: string;
  sectionId: string;
  angle: number;
}

const LOOP_NODES: LoopNode[] = [
  { id: 'signal', label: 'Signal', zhLabel: '信号', sectionId: 'section-hero', angle: 0 },
  { id: 'compress', label: 'Compress', zhLabel: '压缩', sectionId: 'section-compare', angle: 60 },
  { id: 'review', label: 'Review', zhLabel: '审阅', sectionId: 'section-loop', angle: 120 },
  { id: 'decide', label: 'Decide', zhLabel: '决策', sectionId: 'section-value', angle: 180 },
  { id: 'execute', label: 'Execute', zhLabel: '执行', sectionId: 'section-security', angle: 240 },
  { id: 'learn', label: 'Learn', zhLabel: '学习', sectionId: 'section-faq', angle: 300 },
];

const SVG_WIDTH = 80;
const NODE_X = 40;

export default function FlowNavigation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<SVGCircleElement[]>([]);
  const labelRefs = useRef<SVGTextElement[]>([]);
  const pulseRefs = useRef<SVGCircleElement[]>([]);
  const pathRefs = useRef<SVGLineElement[]>([]);
  const particleRef = useRef<SVGCircleElement>(null);
  const trailRefs = useRef<SVGCircleElement[]>([]);
  const activeIndexRef = useRef<number>(-1);
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const [stages, setStages] = useState<{ cy: number; sectionId: string }[]>([]);
  const [svgHeight, setSvgHeight] = useState(300);

  const prefersReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const activateNode = useCallback(
    (index: number) => {
      if (!gsapReady()) return;
      activeIndexRef.current = index;

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        if (i === index) {
          gsap.to(node, { attr: { r: 10 }, fill: 'var(--color-loop-node-active)', duration: 0.3 });
        } else if (i < index) {
          gsap.to(node, { attr: { r: 6 }, fill: 'var(--color-loop-node-active)', opacity: 0.6, duration: 0.3 });
        } else {
          gsap.to(node, { attr: { r: 6 }, fill: 'var(--color-loop-node-inactive)', opacity: 1, duration: 0.3 });
        }
      });

      labelRefs.current.forEach((label, i) => {
        if (!label) return;
        gsap.to(label, { opacity: i === index ? 1 : 0.4, duration: 0.3, ease: 'power1.out' });
      });

      // Path segments: active up to current node
      pathRefs.current.forEach((path, i) => {
        if (!path) return;
        gsap.to(path, {
          stroke: i < index ? 'var(--color-loop-path-active)' : 'var(--color-loop-path)',
          duration: 0.3,
        });
      });

      // Pulse glow on active node
      pulseRefs.current.forEach((pulse, i) => {
        if (!pulse) return;
        gsap.killTweensOf(pulse);
        const reduced = prefersReducedMotion();
        if (i === index && !reduced) {
          gsap.set(pulse, { attr: { r: 10 }, opacity: 0.3 });
          gsap.to(pulse, {
            attr: { r: 14 },
            opacity: 0,
            duration: 1,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          });
        } else {
          gsap.set(pulse, { opacity: 0 });
        }
      });
    },
    [prefersReducedMotion],
  );

  const handleNavigate = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Compute stage positions
  useEffect(() => {
    const compute = () => {
      const found: { cy: number; sectionId: string }[] = [];
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const height = Math.max(300, Math.min(600, Math.round(docHeight / 20)));

      LOOP_NODES.forEach((node) => {
        const el = document.getElementById(node.sectionId);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const scrollY = rect.top + window.scrollY;
        const ratio = Math.max(0, Math.min(1, scrollY / (docHeight || 1)));
        const cy = Math.round(ratio * (height - 20)) + 10;
        found.push({ cy, sectionId: node.sectionId });
      });

      setStages(found);
      setSvgHeight(height);
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // GSAP animations
  useEffect(() => {
    if (!containerRef.current || stages.length === 0 || !gsapReady()) return;

    const reduced = prefersReducedMotion();

    // Section-based node activation
    stages.forEach((stage, i) => {
      const el = document.getElementById(stage.sectionId);
      if (!el) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => activateNode(i),
        onEnterBack: () => activateNode(i),
      });
      triggersRef.current.push(st);
    });

    // Flowing particle along the rail
    if (particleRef.current && !reduced) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(particleRef.current, {
        attr: { cy: svgHeight },
        duration: 3,
        ease: 'sine.inOut',
      });
      // Trails follow with delay
      trailRefs.current.forEach((trail, i) => {
        if (!trail) return;
        gsap.to(trail, {
          attr: { cy: svgHeight },
          duration: 3,
          delay: (i + 1) * 0.15,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });
    }

    activateNode(0);

    const pulses = pulseRefs.current;
    return () => {
      triggersRef.current.forEach((st) => st.kill());
      triggersRef.current = [];
      pulses.forEach((el) => {
        if (el) gsap.killTweensOf(el);
      });
    };
  }, [stages, svgHeight, activateNode, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="hidden lg:block fixed right-10 top-1/2 -translate-y-1/2 z-50"
      aria-label="信息闭环导航"
      role="navigation"
    >
      <svg
        ref={svgRef}
        width={SVG_WIDTH}
        height={svgHeight}
        viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
        fill="none"
        style={{ overflow: 'visible' }}
      >
        {/* Background path */}
        <line
          x1={NODE_X}
          y1={0}
          x2={NODE_X}
          y2={svgHeight}
          stroke="var(--color-loop-path)"
          strokeWidth={2}
        />

        {/* Progress segments between nodes */}
        {stages.map((stage, i) => {
          if (i === 0) return null;
          const prev = stages[i - 1];
          return (
            <line
              key={`path-${i}`}
              ref={(el) => {
                if (el) pathRefs.current[i - 1] = el;
              }}
              x1={NODE_X}
              y1={prev.cy}
              x2={NODE_X}
              y2={stage.cy}
              stroke="var(--color-loop-path)"
              strokeWidth={2}
            />
          );
        })}

        {/* Flowing particle */}
        <circle
          ref={particleRef}
          cx={NODE_X}
          cy={0}
          r={4}
          fill="var(--color-loop-particle)"
          opacity={0.8}
        />

        {/* Trail circles */}
        {[3, 2].map((r, i) => (
          <circle
            key={`trail-${i}`}
            ref={(el) => {
              if (el) trailRefs.current[i] = el;
            }}
            cx={NODE_X}
            cy={0}
            r={r}
            fill="var(--color-loop-particle)"
            opacity={0.3 - i * 0.1}
          />
        ))}

        {/* Stage nodes */}
        {stages.map((stage, i) => (
          <g key={LOOP_NODES[i].id}>
            {/* Pulse glow */}
            <circle
              ref={(el) => {
                if (el) pulseRefs.current[i] = el;
              }}
              cx={NODE_X}
              cy={stage.cy}
              r={10}
              fill="var(--color-loop-node-glow)"
              opacity={0}
            />

            <foreignObject
              x={NODE_X - 14}
              y={stage.cy - 14}
              width={28}
              height={28}
              style={{ overflow: 'visible' }}
            >
              <button
                onClick={() => handleNavigate(LOOP_NODES[i].sectionId)}
                aria-label={`${LOOP_NODES[i].zhLabel} — 第${i + 1}步`}
                onMouseEnter={() => {
                  if (activeIndexRef.current !== i && gsapReady()) {
                    gsap.to(nodeRefs.current[i], { attr: { r: 8 }, fill: 'var(--color-loop-node-active)', duration: 0.2 });
                  }
                }}
                onMouseLeave={() => {
                  if (activeIndexRef.current !== i && gsapReady()) {
                    gsap.to(nodeRefs.current[i], { attr: { r: 6 }, fill: 'var(--color-loop-node-inactive)', duration: 0.2 });
                  }
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid var(--color-brand-accent)';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" style={{ overflow: 'visible' }}>
                  <circle
                    ref={(el) => {
                      if (el) nodeRefs.current[i] = el;
                    }}
                    cx={14}
                    cy={14}
                    r={6}
                    fill="var(--color-loop-node-inactive)"
                  />
                </svg>
              </button>
            </foreignObject>

            <text
              ref={(el) => {
                if (el) labelRefs.current[i] = el;
              }}
              x={NODE_X + 16}
              y={stage.cy + 4}
              fontSize={11}
              fill="var(--color-text-tertiary)"
              fontFamily="inherit"
              opacity={0.4}
              className="pointer-events-none select-none"
            >
              {LOOP_NODES[i].zhLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
