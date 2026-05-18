'use client';

import { useRef, useEffect } from 'react';

/* ── Signal Bus Data ── */

interface SignalChipData {
  text: string;
  type: 'input' | 'ai' | 'review' | 'decision' | 'task';
}

const SIGNAL_FLOW: SignalChipData[] = [
  { text: '日报提交', type: 'input' },
  { text: 'AI 风险识别', type: 'ai' },
  { text: 'Manager 审阅通过', type: 'review' },
  { text: '决策已确认', type: 'decision' },
  { text: '任务已回流', type: 'task' },
];

const CHIP_COLORS: Record<string, string> = {
  input: 'var(--color-signal-success)',
  ai: 'var(--color-brand-accent)',
  review: 'var(--color-signal-warning)',
  decision: 'var(--color-brand-accent-alt)',
  task: 'var(--color-signal-success)',
};

/* ── Signal Chip ── */

function SignalChip({ chip }: { chip: SignalChipData }) {
  return (
    <div
      className="signal-chip shrink-0 inline-flex items-center gap-2"
      style={{
        '--chip-color': CHIP_COLORS[chip.type],
      } as React.CSSProperties}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '999px',
          background: CHIP_COLORS[chip.type],
          boxShadow: `0 0 12px ${CHIP_COLORS[chip.type]}`,
          flexShrink: 0,
        }}
      />
      {chip.text}
    </div>
  );
}

/* ── Arrow Connector ── */

function Arrow() {
  return (
    <svg
      width="16"
      height="10"
      viewBox="0 0 16 10"
      fill="none"
      style={{ flexShrink: 0, opacity: 0.3 }}
      aria-hidden="true"
    >
      <path d="M0 5H14M11 1L15 5L11 9" style={{ stroke: 'var(--color-text-on-dark-muted)' }} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Signal Track (single scrolling row) ── */

function SignalTrack() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Ensure seamless loop by replicating content until > 2x viewport
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const groups = track.querySelectorAll<HTMLElement>('.signal-group');
    if (groups.length < 2) return;

    const groupWidth = groups[0].scrollWidth;
    const viewportWidth = window.innerWidth;

    if (groupWidth < viewportWidth) {
      const copiesNeeded = Math.ceil((viewportWidth * 2) / groupWidth);
      const container = groups[0].parentNode;
      if (!container) return;

      while (container.childNodes.length > 2) {
        container.removeChild(container.lastChild!);
      }

      for (let i = 0; i < copiesNeeded - 2; i++) {
        const clone = groups[0].cloneNode(true);
        container.appendChild(clone);
      }
    }
  }, []);

  const renderGroup = (prefix: string) => (
    <div
      className="signal-group flex items-center shrink-0"
      style={{ gap: '10px', paddingRight: '10px' }}
    >
      {SIGNAL_FLOW.map((chip, i) => (
        <div key={`${prefix}-${i}`} className="flex items-center" style={{ gap: '10px' }}>
          <SignalChip chip={chip} />
          {i < SIGNAL_FLOW.length - 1 && <Arrow />}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="signal-bus__viewport"
    >
      <div
        ref={trackRef}
        className="signal-bus__track"
      >
        {renderGroup('a')}
        {renderGroup('b')}
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function LogoMarquee() {
  return (
    <section
      className="relative py-8"
      style={{ background: 'var(--color-surface-deep)' }}
      aria-label="组织信号流"
    >
      <div className="signal-bus">
        <div className="signal-bus__label">Live Signals</div>
        <SignalTrack />
      </div>

      <style>{`
        .signal-bus {
          width: min(1120px, calc(100vw - 48px));
          margin: 0 auto;
          height: 54px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 18px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 999px;
          background:
            linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.88));
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.16);
          overflow: hidden;
        }

        .signal-bus__label {
          flex: 0 0 auto;
          font-family: var(--font-console);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(147, 197, 253, 0.9);
        }

        .signal-bus__viewport {
          overflow: hidden;
          flex: 1;
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }

        .signal-bus__track {
          display: flex;
          align-items: center;
          width: max-content;
          gap: 10px;
          animation: signal-marquee 28s linear infinite;
        }

        .signal-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 28px;
          padding: 0 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(226, 232, 240, 0.86);
          font-size: 12px;
          white-space: nowrap;
          transition: background 200ms ease;
        }

        .signal-chip:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .signal-bus__track:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .signal-bus__track {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
