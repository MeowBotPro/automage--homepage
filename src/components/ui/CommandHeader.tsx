'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap, ScrollTrigger, gsapReady } from '@/lib/gsap';

/* ── Navigation items ── */
interface NavItem {
  label: string;
  sublabel: string;
  sectionId: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: '产品逻辑', sublabel: '从噪声到决策', sectionId: 'section-compare' },
  { label: '信息闭环', sublabel: '六个节点，一个闭环', sectionId: 'section-loop' },
  { label: '安全边界', sublabel: 'AI 可以建议，但不能越权', sectionId: 'section-security' },
  { label: '决策说明书', sublabel: '关于 AutoMage 的问题', sectionId: 'section-faq' },
];

/* ── Status chip states ── */
interface StatusState {
  label: string;
  color: string;
}

const STATUS_MAP: Record<string, StatusState> = {
  hero:     { label: 'Signal intake',  color: 'var(--color-brand-accent)' },
  compare:  { label: 'Compressing',    color: 'var(--color-brand-accent)' },
  loop:     { label: 'Loop active',    color: 'var(--color-brand-accent)' },
  security: { label: 'Human gate',     color: 'var(--color-brand-accent-alt)' },
  faq:      { label: 'Decision manual', color: 'var(--color-brand-accent)' },
  footer:   { label: 'Loop closed',    color: 'var(--color-signal-success)' },
};

/* ── Brand Mark: bare icon with subtle halo ── */
function BrandMark() {
  return (
    <span
      className="am-brand-mark"
      style={{
        position: 'relative',
        width: 33,
        height: 33,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -9,
          borderRadius: 999,
          background: 'radial-gradient(circle, rgba(96,165,250,0.18), transparent 70%)',
          filter: 'blur(4px)',
          pointerEvents: 'none',
        }}
      />
      <svg
        viewBox="0 0 416.99 407.84"
        fill="none"
        className="am-logo-colink"
        aria-hidden="true"
        style={{ width: 30, height: 30, position: 'relative', zIndex: 1, opacity: 0.95 }}
      >
        <path
          fill="#F8FAFC"
          d="M387.26,217.1a29.74,29.74,0,0,0-29.6,27v0c-32.88,13-52.51,1.28-52.51,1.28,53.87-9.71,68.93-65.81,68.93-65.81h0a28.6,28.6,0,0,0,3.36.2,29.75,29.75,0,1,0-24.33-12.66c-16.38,40.67-51.18,43.54-51.23,43.54l-.05,0a126,126,0,1,0-186.63,0l-.05,0c-.1,0-34.86-2.89-51.23-43.54a29.72,29.72,0,1,0-24.33,12.66,28.73,28.73,0,0,0,3.36-.2h0s15.06,56.1,68.93,65.81c0,0-19.63,11.74-52.51-1.28v0a29.72,29.72,0,1,0-8.64,23.82h0s37.16,25.95,81.84,7.05c0,0-14.17,27-44,36.09a29.73,29.73,0,1,0,7,25.19s51.29-10.21,73.25-48.51c0,0,3.32,30.7-18.82,61.4h0a29.73,29.73,0,1,0,23,29,29.62,29.62,0,0,0-2.19-11.21s31.7-30.65,37.69-73.54c6,42.89,37.7,73.54,37.7,73.54h0A29.72,29.72,0,1,0,267,349.15h0c-22.13-30.7-18.81-61.4-18.81-61.4,22,38.3,73.24,48.51,73.25,48.51a29.72,29.72,0,1,0,7-25.19c-29.81-9.1-44-36.09-44-36.09,44.68,18.9,81.84-7.05,81.84-7.05h0a29.73,29.73,0,1,0,21-50.82Zm-9.84-84.82A17.73,17.73,0,1,1,359.69,150,17.75,17.75,0,0,1,377.42,132.28ZM39.57,167.74A17.73,17.73,0,1,1,57.3,150,17.75,17.75,0,0,1,39.57,167.74Zm-9.84,96.82a17.73,17.73,0,1,1,17.73-17.73A17.75,17.75,0,0,1,29.73,264.56Zm36.59,84a17.73,17.73,0,1,1,17.73-17.73A17.75,17.75,0,0,1,66.32,348.52Zm76.94,47.32A17.73,17.73,0,1,1,161,378.11,17.75,17.75,0,0,1,143.26,395.84Zm16.6-193.2a31.41,31.41,0,1,1,31.41-31.41A31.41,31.41,0,0,1,159.86,202.64ZM273.73,360.38A17.73,17.73,0,1,1,256,378.11,17.75,17.75,0,0,1,273.73,360.38Zm76.94-47.32a17.73,17.73,0,1,1-17.73,17.73A17.75,17.75,0,0,1,350.67,313.06ZM257.13,202.64a31.41,31.41,0,1,1,31.41-31.41A31.41,31.41,0,0,1,257.13,202.64Zm130.13,61.92A17.73,17.73,0,1,1,405,246.83,17.75,17.75,0,0,1,387.26,264.56Z"
        />
        {/* Left eye */}
        <circle
          className="am-logo-eye"
          fill="#60A5FA"
          cx="162.19" cy="171.23" r="13.38"
          transform="translate(-58.08 255.55) rotate(-67.5)"
        />
        {/* Right eye */}
        <circle
          className="am-logo-eye"
          fill="#60A5FA"
          cx="254.8" cy="171.23" r="13.38"
          transform="translate(-24.14 43.03) rotate(-9.22)"
        />
      </svg>
    </span>
  );
}

/* ── Status Dot ── */
function StatusDot({ color }: { color: string }) {
  return (
    <span
      className="am-status-dot"
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  );
}

/* ── Main Header ── */
export default function CommandHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [status, setStatus] = useState<StatusState>(STATUS_MAP.hero);
  const [menuOpen, setMenuOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const activeRef = useRef('hero');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  /* ── Boot animation ── */
  useEffect(() => {
    if (!gsapReady() || !headerRef.current) return;
    if (reducedMotion) { setBooted(true); return; }

    const els = headerRef.current.querySelectorAll('[data-boot]');
    gsap.set(els, { opacity: 0, y: 5 });
    gsap.set('.am-brand-mark', { opacity: 0, y: -3, scale: 0.96 });
    gsap.set('.am-logo-eye', { opacity: 0, scale: 0.5, transformOrigin: 'center center' });

    const tl = gsap.timeline({ delay: 0.1 });

    tl.to('[data-boot="logo"]', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
      .to('.am-brand-mark', { opacity: 1, y: 0, scale: 1, duration: 0.48, ease: 'power2.out' }, '-=0.25')
      .to('.am-logo-eye', { opacity: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(2.5)' }, '-=0.15')
      .call(() => {
        const mark = document.querySelector('.am-brand-mark');
        if (mark) mark.classList.add('am-booted');
      })
      .to('[data-boot="name"]', { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '-=0.12')
      .to('[data-boot="nav"]', { opacity: 1, y: 0, duration: 0.25, stagger: 0.06, ease: 'power2.out' }, '-=0.1')
      .to('[data-boot="status"]', { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, '-=0.05')
      .to('[data-boot="cta"]', { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '-=0.1')
      .call(() => setBooted(true));
  }, [reducedMotion]);

  /* ── Scroll tracking ── */
  useEffect(() => {
    if (typeof window === 'undefined' || !gsapReady()) return;
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Section tracking ── */
  const updateStatus = useCallback((key: string) => {
    if (activeRef.current === key) return;
    activeRef.current = key;
    setActiveSection(key);
    setStatus(STATUS_MAP[key] ?? STATUS_MAP.hero);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !gsapReady()) return;
    const triggers: ScrollTrigger[] = [];

    const heroEl = document.getElementById('section-hero');
    if (heroEl) {
      triggers.push(ScrollTrigger.create({
        trigger: heroEl, start: 'top center', end: 'bottom center',
        onEnter: () => updateStatus('hero'), onEnterBack: () => updateStatus('hero'),
      }));
    }

    for (const key of ['compare', 'loop', 'security', 'faq'] as const) {
      const el = document.getElementById(`section-${key}`);
      if (!el) continue;
      triggers.push(ScrollTrigger.create({
        trigger: el, start: 'top center', end: 'bottom center',
        onEnter: () => updateStatus(key), onEnterBack: () => updateStatus(key),
      }));
    }

    const footerEl = document.querySelector('footer');
    if (footerEl) {
      triggers.push(ScrollTrigger.create({
        trigger: footerEl, start: 'top bottom', end: 'bottom bottom',
        onEnter: () => { setIsDark(true); updateStatus('footer'); },
        onLeaveBack: () => { setIsDark(false); },
      }));
    }

    return () => { for (const st of triggers) st.kill(); };
  }, [updateStatus]);

  const handleNavClick = useCallback((sectionId: string) => {
    setMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isTop = !isScrolled;

  return (
    <>
      <header
        ref={headerRef}
        className="am-command-header"
        data-state={isTop ? 'top' : 'scrolled'}
        data-theme={isDark ? 'dark' : 'light'}
        role="banner"
        aria-label="AutoMage 主导航"
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          width: 'min(1180px, calc(100% - 32px))',
          height: 64,
          borderRadius: 22,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          background: isDark
            ? 'rgba(15, 23, 42, 0.78)'
            : 'rgba(15, 23, 42, 0.78)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.10)'}`,
          boxShadow: isScrolled
            ? '0 18px 60px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.08)'
            : 'inset 0 1px 0 rgba(255,255,255,0.08)',
          color: 'var(--color-text-on-dark)',
          transition: 'box-shadow 0.4s',
        }}
      >
        {/* ── Brand ── */}
        <a
          href="/"
          data-boot="logo"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0, textDecoration: 'none', color: 'inherit',
            paddingLeft: 4, minWidth: 140,
            opacity: reducedMotion ? 1 : 0,
          }}
        >
          <BrandMark />
          <span
            data-boot="name"
            style={{
              fontWeight: 700, fontSize: 21, letterSpacing: '-0.02em',
              lineHeight: 1, color: 'var(--color-text-on-dark)',
              fontFamily: 'var(--font-sans)',
              opacity: reducedMotion ? 1 : 0,
            }}
          >
            AutoMage
          </span>
        </a>

        {/* ── Nav ── */}
        <nav
          className="hidden lg:flex items-center"
          style={{ marginLeft: 'auto', gap: 2 }}
          role="navigation"
          aria-label="页面导航"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = `section-${activeSection}` === item.sectionId;
            return (
              <button
                key={item.sectionId}
                data-boot="nav"
                onClick={() => handleNavClick(item.sectionId)}
                aria-current={isActive ? 'true' : undefined}
                style={{
                  position: 'relative', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '7px 12px',
                  fontSize: 13, fontWeight: 560,
                  color: isActive ? 'rgba(248,250,252,0.96)' : 'rgba(248,250,252,0.72)',
                  fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em',
                  borderRadius: 999,
                  transition: 'color 0.2s, background 0.2s',
                  whiteSpace: 'nowrap',
                  opacity: reducedMotion ? 1 : 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(248,250,252,0.96)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isActive
                    ? 'rgba(248,250,252,0.96)' : 'rgba(248,250,252,0.72)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ── Status chip ── */}
        <div
          data-boot="status"
          className="hidden md:flex items-center"
          style={{
            marginLeft: 16, gap: 6, padding: '3px 10px', borderRadius: 999,
            fontSize: 11, fontWeight: 500,
            fontFamily: 'var(--font-mono, var(--font-sans))', letterSpacing: '-0.01em',
            color: 'rgba(191,219,254,0.88)',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(96,165,250,0.14)',
            whiteSpace: 'nowrap',
            opacity: reducedMotion ? 1 : 0,
            transition: 'color 0.3s', flexShrink: 0,
          }}
        >
          <StatusDot color={status.color} />
          <span>{status.label}</span>
        </div>

        {/* ── CTA ── */}
        <div
          className="hidden lg:flex items-center"
          data-boot="cta"
          style={{ gap: 10, flexShrink: 0, marginLeft: 12, opacity: reducedMotion ? 1 : 0 }}
        >
          {/* 预约演示 — ghost */}
          <button
            onClick={() => handleNavClick('section-beta')}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10, padding: '7px 16px',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              color: 'rgba(248,250,252,0.78)',
              fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
              e.currentTarget.style.color = 'var(--color-text-on-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = 'rgba(248,250,252,0.78)';
            }}
          >
            预约演示
          </button>
          {/* 申请内测 — primary white */}
          <button
            className="am-cta-primary"
            onClick={() => handleNavClick('section-beta')}
            style={{
              background: '#FFFFFF', color: 'var(--color-surface-dark)',
              border: 'none', borderRadius: 999, padding: '7px 18px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 4,
              transition: 'transform 0.15s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            申请内测
            <span style={{ display: 'inline-block', transition: 'transform 0.2s' }}>
              &rarr;
            </span>
          </button>
        </div>

        {/* ── Mobile: dot + hamburger ── */}
        <div className="flex lg:hidden items-center" style={{ marginLeft: 'auto', gap: 12 }}>
          <span
            className="hidden sm:flex md:hidden items-center"
            data-boot="status"
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            <StatusDot color={status.color} />
          </span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: 36, height: 36,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 5, padding: 0,
            }}
          >
            {[
              { transform: menuOpen ? 'translateY(3.25px) rotate(45deg)' : 'none', opacity: 1 },
              { transform: 'none', opacity: menuOpen ? 0 : 1 },
              { transform: menuOpen ? 'translateY(-3.25px) rotate(-45deg)' : 'none', opacity: 1 },
            ].map((s, i) => (
              <span
                key={i}
                style={{
                  display: 'block', width: 20, height: 1.5,
                  backgroundColor: 'var(--color-text-on-dark)', borderRadius: 1,
                  transition: 'transform 0.3s, opacity 0.3s',
                  transform: s.transform, opacity: s.opacity,
                }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* ── Mobile Command Drawer ── */}
      <div
        className="am-command-drawer lg:hidden"
        data-open={menuOpen}
        style={{ position: 'fixed', inset: 0, zIndex: 99, pointerEvents: menuOpen ? 'auto' : 'none' }}
      >
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(15,23,42,0.4)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            opacity: menuOpen ? 1 : 0, transition: 'opacity 0.3s',
          }}
        />
        <div
          style={{
            position: 'absolute', top: 96, left: '50%',
            transform: menuOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-12px)',
            opacity: menuOpen ? 1 : 0,
            transition: 'transform 0.35s var(--ease-out), opacity 0.3s',
            width: 'min(380px, calc(100% - 32px))',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: 20, padding: '24px 20px',
            boxShadow: '0 24px 80px rgba(15,23,42,0.12)',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)', fontWeight: 600, fontFamily: 'var(--font-sans)', marginBottom: 8,
            }}>
              AutoMage Command
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12, color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono, var(--font-sans))',
            }}>
              <StatusDot color={status.color} />
              <span>{status.label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map((item, i) => {
              const isActive = `section-${activeSection}` === item.sectionId;
              return (
                <button
                  key={item.sectionId}
                  onClick={() => handleNavClick(item.sectionId)}
                  style={{
                    background: isActive ? 'rgba(37,99,235,0.06)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '12px 14px', borderRadius: 12,
                    transition: 'background 0.2s',
                    display: 'flex', gap: 12, alignItems: 'baseline',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--color-text-on-dark-muted)',
                    fontFamily: 'var(--font-mono, var(--font-sans))', minWidth: 20,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div style={{
                      fontSize: 15, fontWeight: isActive ? 600 : 450,
                      color: isActive ? 'var(--color-surface-dark)' : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-sans)', lineHeight: 1.3,
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--color-text-on-dark-muted)',
                      fontFamily: 'var(--font-sans)', marginTop: 2,
                    }}>
                      {item.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{
            display: 'flex', gap: 10, marginTop: 20, paddingTop: 16,
            borderTop: '1px solid rgba(148,163,184,0.15)',
          }}>
            <button onClick={() => handleNavClick('section-beta')} style={{
              flex: 1, background: 'none',
              border: '1px solid rgba(148,163,184,0.3)',
              borderRadius: 10, padding: '10px 0',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)',
            }}>
              预约演示
            </button>
            <button onClick={() => handleNavClick('section-beta')} style={{
              flex: 1, background: 'var(--color-surface-dark)', color: 'var(--color-text-on-dark)',
              border: 'none', borderRadius: 10, padding: '10px 0',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}>
              申请内测
            </button>
          </div>

          <div style={{
            marginTop: 16, textAlign: 'center',
            fontSize: 11, color: 'var(--color-text-on-dark-muted)',
            fontFamily: 'var(--font-mono, var(--font-sans))',
          }}>
            &bull; Human approval required
          </div>
        </div>
      </div>
    </>
  );
}
