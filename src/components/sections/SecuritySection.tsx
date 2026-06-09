'use client';

import { useRef, useEffect } from 'react';
import { gsap, safeContext } from '@/lib/gsap';

/* ── Brand Role Logos (reused across pipeline + dual-key) ── */

function AILogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="14" fill="#0f172a" />
      <path d="M24 10L35 16.5V31.5L24 38L13 31.5V16.5L24 10Z"
        stroke="#60a5fa" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="4" fill="#60a5fa" />
      <circle className="am-orbit-dot d1" cx="24" cy="15" r="2" fill="#93c5fd" />
      <circle className="am-orbit-dot d2" cx="32" cy="29" r="2" fill="#93c5fd" />
      <circle className="am-orbit-dot d3" cx="16" cy="29" r="2" fill="#93c5fd" />
    </svg>
  );
}

function HumanLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="14" fill="#0f172a" />
      <circle cx="24" cy="23" r="13" stroke="#60a5fa" strokeWidth="1.6" fill="none" />
      <path className="finger-line" d="M18 24C18 18.5 21 16 24 16C27.5 16 30 19.5 30 24C30 28 28.5 31 24 33"
        stroke="#93c5fd" strokeWidth="1.7" strokeLinecap="round" />
      <path className="finger-line inner" d="M22 25C22 22 22.8 20.2 24.2 20.2C26 20.2 26.8 22.2 26.8 25C26.8 27 26 28.6 24 30"
        stroke="#60a5fa" strokeWidth="1.7" strokeLinecap="round" />
      <path className="human-check" d="M17 37L20.5 40.5L29 32"
        stroke="#60a5fa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Other Pipeline Glyphs ── */

function PolicyGateGlyph() {
  return (
    <svg className="security-glyph policy-gate" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="10" y="9" width="8" height="26" rx="4" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5" />
      <rect x="26" y="9" width="8" height="26" rx="4" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5" />
      <path className="scan" d="M14 22H30" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="22" r="4" fill="rgba(59,130,246,0.18)" stroke="#60A5FA" strokeWidth="1.5" />
    </svg>
  );
}

function ExecutionLedgerGlyph() {
  return (
    <svg className="security-glyph execution-ledger" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="11" y="8" width="22" height="28" rx="5" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5" />
      <path className="ledger-line l1" d="M16 17H28" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <path className="ledger-line l2" d="M16 23H25" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <path className="ledger-line l3" d="M16 29H22" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <circle className="ledger-dot" cx="30" cy="30" r="4" fill="rgba(59,130,246,0.18)" stroke="#60A5FA" strokeWidth="1.5" />
    </svg>
  );
}

/* ── Trust Card Glyphs ── */

function MaskedDataGlyph() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <rect x="10" y="14" width="36" height="28" rx="8" fill="rgba(15,23,42,0.92)" stroke="rgba(96,165,250,0.34)" strokeWidth="1.2" />
      <path d="M18 24H38" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 32H32" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity=".46" />
      <rect x="20" y="20" width="16" height="4" rx="2" fill="rgba(59,130,246,0.24)" />
      <circle cx="38" cy="20" r="4" fill="rgba(59,130,246,0.16)" stroke="#60A5FA" strokeWidth="1.5" />
      <line x1="36" y1="18" x2="40" y2="22" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="18" x2="36" y2="22" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PermissionBoundaryGlyph() {
  return (
    <svg className="permission-boundary" width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <rect x="10" y="12" width="36" height="32" rx="10" fill="rgba(15,23,42,0.92)" stroke="rgba(96,165,250,0.34)" strokeWidth="1.2" />
      <path d="M18 28H38" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 18V38" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity=".35" />
      <circle className="moving-agent" cx="22" cy="28" r="4" fill="#3B82F6" />
      <path d="M38 20V36" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" opacity=".82" />
    </svg>
  );
}

function AuditTrailCardGlyph() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <path d="M14 16H28C34 16 38 20 38 26C38 32 34 36 28 36H18" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="16" r="3" fill="#93C5FD" />
      <circle cx="38" cy="26" r="3" fill="#60A5FA" />
      <circle cx="18" cy="36" r="3" fill="#3B82F6" />
      <circle cx="30" cy="26" r="6" fill="rgba(59,130,246,0.18)" stroke="rgba(96,165,250,0.42)" strokeWidth="1" />
      <path d="M27 26L29 28.5L33 23" stroke="#F1F5F9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Data ── */

const PIPELINE_STAGES = [
  { label: 'AI 生成建议', desc: 'AI 基于数据生成决策选项', color: 'var(--color-gate-ai)', icon: <AILogo /> },
  { label: '权限与策略校验', desc: '自动检查权限和合规策略', color: 'var(--color-signal-warning)', icon: <PolicyGateGlyph /> },
  { label: '人类确认', desc: '管理者拥有最终决策权', color: 'var(--color-gate-human)', icon: <HumanLogo /> },
  { label: '执行已确认', desc: '任务自动分配并开始追踪', color: 'var(--color-gate-unlocked)', icon: <ExecutionLedgerGlyph /> },
];

const TRUST_CARDS = [
  { icon: <MaskedDataGlyph />, title: '数据不裸奔', desc: '脱敏处理、权限隔离、私有化部署' },
  { icon: <PermissionBoundaryGlyph />, title: 'AI 不越权', desc: 'AI 只生成建议，不自动做最终决策' },
  { icon: <AuditTrailCardGlyph />, title: '行为可追溯', desc: '每一次建议、确认、回流都有审计记录' },
];

/* ── Section ── */

export default function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRefs = useRef<HTMLDivElement[]>([]);
  const lineRefs = useRef<HTMLDivElement[]>([]);
  const dualKeyRef = useRef<HTMLDivElement>(null);
  const trustRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = safeContext(() => {
      if (reduced) {
        stageRefs.current.forEach((el) => { if (el) gsap.set(el, { opacity: 1 }); });
        lineRefs.current.forEach((el) => { if (el) gsap.set(el, { scaleX: 1 }); });
        trustRefs.current.forEach((el) => { if (el) gsap.set(el, { opacity: 1, y: 0 }); });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      stageRefs.current.forEach((stage, i) => {
        if (!stage) return;
        gsap.set(stage, { opacity: 0, y: 20 });
        tl.to(stage, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, i * 0.3);

        if (i < lineRefs.current.length && lineRefs.current[i]) {
          gsap.set(lineRefs.current[i], { scaleX: 0 });
          tl.to(lineRefs.current[i], { scaleX: 1, duration: 0.3, ease: 'power2.out' }, i * 0.3 + 0.2);
        }
      });

      // Dual-key entrance
      if (dualKeyRef.current) {
        gsap.set(dualKeyRef.current, { opacity: 0, y: 16 });
        tl.to(dualKeyRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.2);
      }

      trustRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { opacity: 0, y: 20 });
        tl.to(card, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.8 + i * 0.12);
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="section-security"
      ref={sectionRef}
      className="am-narrative-section am-narrative-peak"
      style={{
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
        background: 'transparent',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        <h2
          className="font-semibold text-center"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--color-text-on-dark)',
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          AI 可以建议，但不能越权。
        </h2>
        <p
          className="text-center"
          style={{
            fontSize: '1.125rem',
            color: 'var(--color-text-on-dark-muted)',
            lineHeight: 1.65,
            maxWidth: 600,
            margin: '0 auto 64px',
          }}
        >
          AutoMage 的所有自动化都经过权限、审计和人类确认。系统负责生成选项，人负责做决定。
        </p>

        {/* Pipeline (desktop: horizontal) */}
        <div className="hidden md:flex items-center justify-center gap-0 mb-12">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={i} className="flex items-center">
              <div
                ref={(el) => { if (el) stageRefs.current[i] = el; }}
                className="flex flex-col items-center text-center"
                style={{ width: 140 }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-dark)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                    overflow: 'visible',
                  }}
                >
                  {stage.icon}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-on-dark)', marginBottom: 4 }}>
                  {stage.label}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-on-dark-muted)', lineHeight: 1.4 }}>
                  {stage.desc}
                </span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div
                  ref={(el) => { if (el) lineRefs.current[i] = el; }}
                  style={{
                    width: 48,
                    height: 2,
                    background: `linear-gradient(to right, ${stage.color}, ${PIPELINE_STAGES[i + 1].color})`,
                    transformOrigin: 'left',
                    opacity: 0.3,
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Dual-Key Authorization: AI → approval gate → Human */}
        <div
          ref={dualKeyRef}
          className="am-dual-key hidden md:flex"
        >
          <div className="am-role-card">
            <div className="am-role-logo">
              <AILogo size={44} />
            </div>
            <div>
              <div className="am-role-title">AI</div>
              <div className="am-role-desc">生成建议</div>
            </div>
          </div>

          <div className="am-approval-bridge">
            <span className="am-moving-dot" />
            <span className="am-bridge-label">approval gate</span>
          </div>

          <div className="am-role-card">
            <div className="am-role-logo">
              <HumanLogo size={44} />
            </div>
            <div>
              <div className="am-role-title">Human</div>
              <div className="am-role-desc">确认放行</div>
            </div>
          </div>
        </div>

        {/* Mobile pipeline */}
        <div className="md:hidden flex flex-col items-center gap-6 mb-12">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={i} className="flex items-center gap-4">
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'visible',
              }}>
                {stage.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{stage.label}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-on-dark-muted)' }}>{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRUST_CARDS.map((card, i) => (
            <div
              key={i}
              ref={(el) => { if (el) trustRefs.current[i] = el; }}
              style={{
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.90), rgba(11, 22, 40, 0.84))',
                border: '1px solid rgba(148, 163, 184, 0.16)',
                borderRadius: 'var(--radius-md)',
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-on-dark)', marginBottom: 8 }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-on-dark-muted)', lineHeight: 1.65 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        <style>{`
          /* ── Dual-Key Authorization ── */
          .am-dual-key {
            margin: 40px auto 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 18px;
          }

          .am-role-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px 10px 10px;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.80);
            border: 1px solid rgba(148, 163, 184, 0.18);
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255,255,255,0.05);
            backdrop-filter: blur(14px);
          }

          .am-role-logo {
            width: 44px;
            height: 44px;
            border-radius: 14px;
            overflow: visible;
          }

          .am-role-logo svg {
            width: 44px;
            height: 44px;
            display: block;
          }

          .am-role-title {
            font-family: var(--font-console, ui-monospace, SFMono-Regular, Menlo, monospace);
            font-size: 13px;
            font-weight: 700;
            color: var(--color-text-on-dark);
            line-height: 1;
          }

          .am-role-desc {
            margin-top: 4px;
            font-size: 12px;
            color: var(--color-text-on-dark-muted);
            white-space: nowrap;
          }

          .am-approval-bridge {
            width: 108px;
            height: 28px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .am-approval-bridge::before {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            height: 1px;
            transform: translateY(-50%);
            background: linear-gradient(
              90deg,
              rgba(96, 165, 250, 0.12),
              rgba(96, 165, 250, 0.8),
              rgba(96, 165, 250, 0.12)
            );
          }

          .am-moving-dot {
            position: absolute;
            left: 0;
            top: 50%;
            width: 7px;
            height: 7px;
            border-radius: 999px;
            transform: translateY(-50%);
            background: #60a5fa;
            box-shadow: 0 0 16px rgba(96, 165, 250, 0.9);
            animation: amApprovalMove 2.4s ease-in-out infinite;
          }

          .am-bridge-label {
            position: absolute;
            top: 22px;
            font-family: var(--font-console, ui-monospace, monospace);
            font-size: 9px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--color-text-on-dark-muted);
          }

          /* ── Shared Logo Animations ── */
          .am-orbit-dot {
            transform-origin: 24px 24px;
            animation: amOrbit 5s linear infinite;
          }

          .am-orbit-dot.d2 {
            animation-delay: -1.6s;
          }

          .am-orbit-dot.d3 {
            animation-delay: -3.2s;
          }

          .finger-line {
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: amFingerDraw 2.8s ease-in-out infinite;
          }

          .finger-line.inner {
            animation-delay: 0.18s;
          }

          .human-check {
            stroke-dasharray: 20;
            stroke-dashoffset: 20;
            animation: amCheckDraw 2.8s ease-in-out infinite;
          }

          /* ── Pipeline Glyph Animations ── */
          .policy-gate .scan {
            animation: scan-gate 1.8s ease-in-out infinite;
          }

          .execution-ledger .ledger-line {
            stroke-dasharray: 20;
            stroke-dashoffset: 20;
            animation: ledger-write 2.2s ease-in-out infinite;
          }
          .execution-ledger .l2 { animation-delay: 0.18s; }
          .execution-ledger .l3 { animation-delay: 0.36s; }
          .execution-ledger .ledger-dot {
            transform-origin: center;
            animation: ledger-seal 2.2s ease-in-out infinite;
          }

          .permission-boundary .moving-agent {
            animation: boundary-stop 2.4s ease-in-out infinite;
          }

          @keyframes amApprovalMove {
            0% {
              left: 0;
              opacity: 0.25;
            }
            45% {
              opacity: 1;
            }
            100% {
              left: calc(100% - 7px);
              opacity: 0.25;
            }
          }

          @keyframes amOrbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes amFingerDraw {
            0% {
              stroke-dashoffset: 48;
              opacity: 0.2;
            }
            48% {
              stroke-dashoffset: 0;
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0.55;
            }
          }

          @keyframes amCheckDraw {
            0%, 48% {
              stroke-dashoffset: 20;
              opacity: 0;
            }
            68% {
              stroke-dashoffset: 0;
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0.55;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .am-dual-key *,
            .security-glyph *,
            .permission-boundary * {
              animation: none !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
