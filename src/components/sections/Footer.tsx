'use client';

export default function Footer() {
  return (
    <footer
      className="am-narrative-section"
      style={{
        background: 'transparent',
        borderTop: '1px solid rgba(148, 163, 184, 0.10)',
        padding: '24px 24px 32px',
      }}
    >
      <div
        className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ maxWidth: 1200 }}
      >
        <span
          className="font-semibold"
          style={{ color: 'var(--color-text-on-dark)', fontSize: '1rem' }}
        >
          AutoMage
        </span>

        <div className="flex flex-wrap justify-center" style={{ gap: 24 }}>
          {['隐私政策', '使用条款', '联系我们'].map((label) => (
            <a
              key={label}
              href="#"
              className="cursor-pointer"
              style={{
                color: 'var(--color-text-on-dark-muted)',
                fontSize: '0.8rem',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = 'var(--color-text-on-dark)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = 'var(--color-text-on-dark-muted)';
              }}
            >
              {label}
            </a>
          ))}
        </div>

        <span style={{ color: 'var(--color-text-on-dark-muted)', fontSize: '0.8rem' }}>
          &copy; 2026 AutoMage. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
