"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { gsap, ScrollTrigger, gsapReady } from "@/lib/gsap";

interface LoopNode {
  id: string;
  label: string;
  zhLabel: string;
  sectionId: string;
}

const LOOP_NODES: LoopNode[] = [
  { id: "signal", label: "Signal", zhLabel: "信号", sectionId: "section-hero" },
  { id: "compress", label: "Compress", zhLabel: "压缩", sectionId: "section-compare" },
  { id: "explore", label: "Explore", zhLabel: "探索", sectionId: "section-loop" },
  { id: "authorize", label: "Authorize", zhLabel: "授权", sectionId: "section-security" },
  { id: "execute", label: "Execute", zhLabel: "执行", sectionId: "section-story" },
  { id: "receipt", label: "Receipt", zhLabel: "回执", sectionId: "section-receipt" },
];

const SVG_WIDTH = 80;
const NODE_X = 40;

export default function FlowNavigation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<SVGCircleElement[]>([]);
  const labelRefs = useRef<SVGTextElement[]>([]);
  const pulseRefs = useRef<SVGCircleElement[]>([]);
  const pathRefs = useRef<SVGLineElement[]>([]);
  const particleRef = useRef<SVGCircleElement>(null);
  const trailRefs = useRef<SVGCircleElement[]>([]);
  const activeIndexRef = useRef(-1);
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const [stages, setStages] = useState<{ cy: number; sectionId: string }[]>([]);
  const [svgHeight, setSvgHeight] = useState(300);

  const prefersReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const activateNode = useCallback((index: number) => {
    if (!gsapReady()) return;
    activeIndexRef.current = index;

    nodeRefs.current.forEach((node, i) => {
      if (!node) return;
      gsap.to(node, {
        attr: { r: i === index ? 10 : 6 },
        fill: i <= index ? "var(--color-loop-node-active)" : "var(--color-loop-node-inactive)",
        opacity: i < index ? 0.6 : 1,
        duration: 0.3,
      });
    });

    labelRefs.current.forEach((label, i) => {
      if (label) gsap.to(label, { opacity: i === index ? 1 : 0.4, duration: 0.3 });
    });

    pathRefs.current.forEach((path, i) => {
      if (path) gsap.to(path, {
        stroke: i < index ? "var(--color-loop-path-active)" : "var(--color-loop-path)",
        duration: 0.3,
      });
    });

    pulseRefs.current.forEach((pulse, i) => {
      if (!pulse) return;
      gsap.killTweensOf(pulse);
      if (i === index && !prefersReducedMotion()) {
        gsap.set(pulse, { attr: { r: 10 }, opacity: 0.3 });
        gsap.to(pulse, { attr: { r: 14 }, opacity: 0, duration: 1, repeat: -1, yoyo: true });
      } else {
        gsap.set(pulse, { opacity: 0 });
      }
    });
  }, [prefersReducedMotion]);

  useEffect(() => {
    const compute = () => {
      const found: { cy: number; sectionId: string }[] = [];
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const height = Math.max(300, Math.min(600, Math.round(docHeight / 20)));

      LOOP_NODES.forEach((node) => {
        const element = document.getElementById(node.sectionId);
        if (!element) return;
        const scrollY = element.getBoundingClientRect().top + window.scrollY;
        const ratio = Math.max(0, Math.min(1, scrollY / (docHeight || 1)));
        found.push({ cy: Math.round(ratio * (height - 20)) + 10, sectionId: node.sectionId });
      });

      setStages(found);
      setSvgHeight(height);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (!containerRef.current || stages.length === 0 || !gsapReady()) return;
    const reduced = prefersReducedMotion();

    stages.forEach((stage, index) => {
      const element = document.getElementById(stage.sectionId);
      if (!element) return;
      triggersRef.current.push(ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom center",
        onEnter: () => activateNode(index),
        onEnterBack: () => activateNode(index),
      }));
    });

    if (particleRef.current && !reduced) {
      gsap.to(particleRef.current, { attr: { cy: svgHeight }, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true });
      trailRefs.current.forEach((trail, index) => {
        if (trail) gsap.to(trail, {
          attr: { cy: svgHeight },
          duration: 3,
          delay: (index + 1) * 0.15,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }

    activateNode(0);
    return () => {
      triggersRef.current.forEach((trigger) => trigger.kill());
      triggersRef.current = [];
    };
  }, [stages, svgHeight, activateNode, prefersReducedMotion]);

  const navigate = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={containerRef} className="hidden lg:block fixed right-10 top-1/2 -translate-y-1/2 z-50" aria-label="事件路径导航" role="navigation">
      <svg width={SVG_WIDTH} height={svgHeight} viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`} fill="none" style={{ overflow: "visible" }}>
        <line x1={NODE_X} y1={0} x2={NODE_X} y2={svgHeight} stroke="var(--color-loop-path)" strokeWidth={2} />
        {stages.map((stage, index) => {
          if (index === 0) return null;
          return (
            <line
              key={LOOP_NODES[index].id}
              ref={(element) => {
                if (element) pathRefs.current[index - 1] = element;
              }}
              x1={NODE_X}
              y1={stages[index - 1].cy}
              x2={NODE_X}
              y2={stage.cy}
              stroke="var(--color-loop-path)"
              strokeWidth={2}
            />
          );
        })}
        <circle ref={particleRef} cx={NODE_X} cy={0} r={4} fill="var(--color-loop-particle)" opacity={0.8} />
        {[3, 2].map((radius, index) => (
          <circle
            key={radius}
            ref={(element) => {
              if (element) trailRefs.current[index] = element;
            }}
            cx={NODE_X}
            cy={0}
            r={radius}
            fill="var(--color-loop-particle)"
            opacity={0.3 - index * 0.1}
          />
        ))}
        {stages.map((stage, index) => (
          <g key={LOOP_NODES[index].id}>
            <circle
              ref={(element) => {
                if (element) pulseRefs.current[index] = element;
              }}
              cx={NODE_X}
              cy={stage.cy}
              r={10}
              fill="var(--color-loop-node-glow)"
              opacity={0}
            />
            <foreignObject x={NODE_X - 14} y={stage.cy - 14} width={28} height={28} style={{ overflow: "visible" }}>
              <button
                onClick={() => navigate(LOOP_NODES[index].sectionId)}
                aria-label={`${LOOP_NODES[index].zhLabel} — 第${index + 1}步`}
                style={{ width: 28, height: 28, borderRadius: "50%", border: 0, background: "transparent", cursor: "pointer", padding: 0 }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <circle
                    ref={(element) => {
                      if (element) nodeRefs.current[index] = element;
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
              ref={(element) => {
                if (element) labelRefs.current[index] = element;
              }}
              x={NODE_X + 16}
              y={stage.cy + 4}
              fontSize={11}
              fill="var(--color-text-tertiary)"
              opacity={0.4}
              className="pointer-events-none select-none"
            >
              {LOOP_NODES[index].zhLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
