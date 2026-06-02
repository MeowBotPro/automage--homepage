'use client';

import { useRef, useEffect } from 'react';
import { gsap, safeContext } from '@/lib/gsap';

const TASKS = [
  { id: 'AM-142', label: 'Beta invite scarcity rule', owner: 'Product', state: 'human review', risk: 'medium' },
  { id: 'AM-147', label: 'Homepage dawn model refactor', owner: 'Design + FE', state: 'in build', risk: 'low' },
  { id: 'AM-151', label: 'Application submit audit trail', owner: 'Platform', state: 'policy gate', risk: 'medium' },
  { id: 'AM-156', label: 'Deploy health probe hardening', owner: 'Ops', state: 'queued', risk: 'low' },
];

const LOG_ROWS = [
  { time: '09:41:12', tag: 'signal', text: '23 frontline records compressed into 4 risk signals' },
  { time: '09:41:24', tag: 'policy', text: 'masked customer identifiers before AI brief generation' },
  { time: '09:42:03', tag: 'queue', text: 'AM-147 promoted after human owner confirmation' },
  { time: '09:42:31', tag: 'risk', text: 'invite-code replay path requires submit-time validation' },
  { time: '09:43:10', tag: 'ci', text: 'lint/build gate waiting for branch checkpoint' },
  { time: '09:43:29', tag: 'deploy', text: 'preview release locked until approval receipt is written' },
  { time: '09:44:06', tag: 'loop', text: 'decision brief linked to sprint task and audit trail' },
  { time: '09:44:33', tag: 'learn', text: 'execution feedback scheduled for next signal intake' },
];

const SYSTEM_STATUS = [
  { label: 'Signal intake', value: 'Live', tone: 'normal' },
  { label: 'CI gate', value: 'Ready', tone: 'success' },
  { label: 'Risk watch', value: '2 open', tone: 'warning' },
  { label: 'Human approval', value: 'Required', tone: 'normal' },
];

const DECISION_FIELDS = [
  { key: 'Owner', value: 'Homepage pod / FE lead' },
  { key: 'Deadline', value: '2026-06-02 22:00 CST' },
  { key: 'Risk', value: 'Spec drift, mobile clipping' },
  { key: 'Action', value: 'Reorder narrative, validate, deploy' },
];

function toneColor(tone: string) {
  if (tone === 'success') return 'var(--color-signal-success)';
  if (tone === 'warning') return 'var(--color-signal-warning)';
  return 'var(--color-brand-cyan)';
}

export default function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<HTMLDivElement[]>([]);
  const logRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = safeContext(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const panels = panelRefs.current.filter(Boolean);
      const logs = logRefs.current.filter(Boolean);

      if (reduced) {
        gsap.set([...panels, ...logs], { opacity: 1, y: 0 });
        return;
      }

      gsap.set(panels, { opacity: 0, y: 24 });
      gsap.set(logs, { opacity: 0, y: 8 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          toggleActions: 'play none none none',
          once: true,
        },
      });

      timeline.to(panels, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
      });

      timeline.to(
        logs,
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
          stagger: 0.04,
          ease: 'power2.out',
        },
        '-=0.18',
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="section-story"
      ref={sectionRef}
      data-dark-dev-section
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
        background: 'var(--color-surface-command)',
        color: 'var(--color-text-on-dark)',
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 620"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      >
        <path d="M80 120C280 40 400 220 560 160S820 60 1120 150" stroke="var(--color-brand-accent)" strokeWidth="1" fill="none" opacity="0.38" />
        <path d="M120 500C320 380 460 520 610 390S880 300 1160 430" stroke="var(--color-brand-cyan)" strokeWidth="1" fill="none" opacity="0.26" />
        <path d="M220 80V560M600 40V580M980 100V540" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ maxWidth: 760, marginBottom: 48 }}>
          <p
            style={{
              margin: '0 0 14px',
              fontFamily: 'var(--font-console)',
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-brand-cyan)',
            }}
          >
            Automage internal command center
          </p>
          <h2
            className="font-semibold"
            style={{
              margin: 0,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.12,
              color: 'var(--color-text-on-dark)',
              letterSpacing: 0,
            }}
          >
            我们正在用 AutoMage 管理 AutoMage 的开发
          </h2>
          <p
            style={{
              margin: '18px 0 0',
              maxWidth: 660,
              color: 'var(--color-text-on-dark-muted)',
              fontSize: '1.05rem',
              lineHeight: 1.75,
            }}
          >
            这里展示的是脱敏后的真实研发工作流：信号进入、风险归并、人工确认、CI 与部署状态一起进入同一条决策链。
          </p>
        </div>

        <div
          className="am-dev-grid grid grid-cols-1 lg:grid-cols-12 gap-5"
          style={{ alignItems: 'stretch' }}
        >
          <div className="am-dev-column lg:col-span-4" style={{ minWidth: 0 }}>
            <div
              ref={(element) => {
                if (element) panelRefs.current[0] = element;
              }}
              data-dev-panel="issue-queue"
              className="am-dev-panel"
            >
              <div className="am-dev-panel__header">
                <span>Issue queue</span>
                <span className="am-dev-panel__meta">Sprint 06</span>
              </div>
              <div className="am-task-list">
                {TASKS.map((task) => (
                  <div key={task.id} className="am-task-row">
                    <div className="am-task-row__top">
                      <span className="am-task-id">{task.id}</span>
                      <span className={`am-risk am-risk--${task.risk}`}>{task.risk}</span>
                    </div>
                    <div className="am-task-label">{task.label}</div>
                    <div className="am-task-meta">{task.owner} / {task.state}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={(element) => {
                if (element) panelRefs.current[1] = element;
              }}
              data-dev-panel="risk-signals"
              className="am-dev-panel"
              style={{ marginTop: 20 }}
            >
              <div className="am-dev-panel__header">
                <span>Risk signals</span>
                <span className="am-dev-panel__meta">masked</span>
              </div>
              <div className="am-risk-matrix">
                <div>
                  <span className="am-metric-value">04</span>
                  <span className="am-metric-label">open signals</span>
                </div>
                <div>
                  <span className="am-metric-value">02</span>
                  <span className="am-metric-label">need owner</span>
                </div>
                <div>
                  <span className="am-metric-value">01</span>
                  <span className="am-metric-label">policy gate</span>
                </div>
              </div>
            </div>
          </div>

          <div className="am-dev-column lg:col-span-5" style={{ minWidth: 0 }}>
            <div
              ref={(element) => {
                if (element) panelRefs.current[2] = element;
              }}
              data-dev-panel="live-log"
              className="am-dev-panel am-dev-panel--tall"
            >
              <div className="am-console-bar">
                <span className="am-window-dot am-window-dot--close" />
                <span className="am-window-dot am-window-dot--min" />
                <span className="am-window-dot am-window-dot--max" />
                <span className="am-console-title">automage-dev.log</span>
              </div>
              <div className="am-log-stream">
                {LOG_ROWS.map((row, index) => (
                  <div
                    key={`${row.time}-${row.tag}`}
                    ref={(element) => {
                      if (element) logRefs.current[index] = element;
                    }}
                    data-log-row
                    className="am-log-row"
                  >
                    <span className="am-log-time">{row.time}</span>
                    <span className="am-log-tag">{row.tag}</span>
                    <span className="am-log-text">{row.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="am-dev-column lg:col-span-3" style={{ minWidth: 0 }}>
            <div
              ref={(element) => {
                if (element) panelRefs.current[3] = element;
              }}
              data-dev-panel="system-status"
              className="am-dev-panel"
            >
              <div className="am-dev-panel__header">
                <span>System status</span>
                <span className="am-dev-panel__meta">live</span>
              </div>
              <div className="am-status-list">
                {SYSTEM_STATUS.map((item) => (
                  <div key={item.label} className="am-status-row">
                    <span
                      data-status-indicator={item.tone}
                      className="am-status-light"
                      style={{ background: toneColor(item.tone), boxShadow: `0 0 12px ${toneColor(item.tone)}` }}
                    />
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={(element) => {
                if (element) panelRefs.current[4] = element;
              }}
              data-dev-panel="decision-brief"
              data-decision-brief
              className="am-dev-panel"
              style={{ marginTop: 20 }}
            >
              <div className="am-dev-panel__header">
                <span>AI decision brief</span>
                <span className="am-dev-panel__meta">human gate</span>
              </div>
              <div className="am-brief-fields">
                {DECISION_FIELDS.map((field) => (
                  <div key={field.key} data-decision-field={field.key.toLowerCase()} className="am-brief-field">
                    <span>{field.key}</span>
                    <strong>{field.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .am-dev-panel {
          min-width: 0;
          height: 100%;
          border-radius: var(--radius-md);
          border: 1px solid rgba(148, 163, 184, 0.16);
          background:
            linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.78)),
            var(--color-surface-dark);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.04);
          padding: 18px;
        }

        .am-dev-panel--tall {
          min-height: 100%;
        }

        .am-dev-panel__header,
        .am-task-row__top,
        .am-status-row,
        .am-console-bar {
          display: flex;
          align-items: center;
        }

        .am-dev-panel__header {
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          font-family: var(--font-console);
          font-size: 0.78rem;
          color: var(--color-text-on-dark);
        }

        .am-dev-panel__meta {
          color: var(--color-text-on-dark-muted);
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .am-task-list,
        .am-log-stream,
        .am-status-list,
        .am-brief-fields {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .am-task-row,
        .am-log-row,
        .am-status-row,
        .am-brief-field {
          min-width: 0;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(11, 22, 40, 0.58);
        }

        .am-task-row {
          padding: 12px;
        }

        .am-task-row__top {
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
        }

        .am-task-id,
        .am-log-time,
        .am-log-tag,
        .am-risk,
        .am-metric-label,
        .am-brief-field span {
          font-family: var(--font-console);
          font-size: 0.72rem;
        }

        .am-task-id,
        .am-log-time {
          color: var(--color-brand-cyan);
        }

        .am-risk {
          border-radius: 999px;
          padding: 2px 7px;
          text-transform: uppercase;
        }

        .am-risk--low {
          color: var(--color-signal-success);
          background: rgba(34, 197, 94, 0.12);
        }

        .am-risk--medium {
          color: var(--color-signal-warning);
          background: rgba(245, 158, 11, 0.12);
        }

        .am-task-label {
          color: var(--color-text-on-dark);
          font-size: 0.92rem;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .am-task-meta {
          margin-top: 6px;
          color: var(--color-text-on-dark-muted);
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .am-risk-matrix {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .am-risk-matrix > div {
          min-width: 0;
          border-radius: var(--radius-sm);
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.14);
          padding: 12px 10px;
        }

        .am-metric-value,
        .am-metric-label {
          display: block;
        }

        .am-metric-value {
          color: var(--color-text-on-dark);
          font-family: var(--font-console);
          font-size: 1.3rem;
          line-height: 1;
        }

        .am-metric-label {
          margin-top: 7px;
          color: var(--color-text-on-dark-muted);
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .am-console-bar {
          gap: 7px;
          height: 32px;
          margin: -4px -4px 14px;
          padding: 0 6px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }

        .am-window-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          flex: 0 0 auto;
        }

        .am-window-dot--close { background: var(--color-chrome-close); }
        .am-window-dot--min { background: var(--color-chrome-minimize); }
        .am-window-dot--max { background: var(--color-chrome-maximize); }

        .am-console-title {
          margin-left: 6px;
          color: var(--color-text-on-dark-muted);
          font-family: var(--font-console);
          font-size: 0.74rem;
          overflow-wrap: anywhere;
        }

        .am-log-row {
          display: grid;
          grid-template-columns: auto auto minmax(0, 1fr);
          align-items: start;
          gap: 10px;
          padding: 10px 11px;
          font-family: var(--font-console);
        }

        .am-log-tag {
          color: var(--color-text-on-dark);
          border-radius: 999px;
          padding: 1px 7px;
          background: rgba(59, 130, 246, 0.12);
        }

        .am-log-text {
          min-width: 0;
          color: var(--color-text-on-dark-muted);
          font-size: 0.76rem;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }

        .am-status-row {
          gap: 10px;
          padding: 11px;
          color: var(--color-text-on-dark-muted);
          font-size: 0.82rem;
          line-height: 1.4;
        }

        .am-status-row strong {
          margin-left: auto;
          color: var(--color-text-on-dark);
          font-family: var(--font-console);
          font-size: 0.76rem;
          font-weight: 600;
        }

        .am-status-light {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          flex: 0 0 auto;
          animation: amDevStatus 2.4s ease-in-out infinite;
        }

        .am-brief-field {
          padding: 11px;
        }

        .am-brief-field span {
          display: block;
          color: var(--color-brand-cyan);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .am-brief-field strong {
          display: block;
          margin-top: 6px;
          color: var(--color-text-on-dark);
          font-size: 0.84rem;
          line-height: 1.45;
          font-weight: 560;
          overflow-wrap: anywhere;
        }

        @keyframes amDevStatus {
          0%, 100% { opacity: 0.55; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 1023px) {
          .am-dev-grid {
            display: flex !important;
            flex-direction: column;
            gap: 20px;
          }

          .am-dev-column {
            display: contents;
          }

          .am-dev-panel {
            height: auto;
          }
        }

        @media (max-width: 640px) {
          .am-dev-panel {
            padding: 16px;
          }

          .am-risk-matrix {
            grid-template-columns: 1fr;
          }

          .am-log-row {
            grid-template-columns: 1fr;
            gap: 6px;
          }

          .am-status-row {
            align-items: flex-start;
          }

          .am-status-row strong {
            margin-left: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .am-status-light {
            animation: none !important;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
