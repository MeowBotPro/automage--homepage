'use client';

import { useEffect, useRef, useState, useId } from 'react';

interface BetaSuccessModalProps {
  applicationPublicId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BetaSuccessModal({
  applicationPublicId,
  isOpen,
  onClose,
}: BetaSuccessModalProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement as HTMLElement | null;

    document.body.style.overflow = 'hidden';

    const focusCloseButton = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusCloseButton);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(applicationPublicId);
      setHasCopied(true);
    } catch {
      setHasCopied(false);
    }
  };

  return (
    <div
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 140,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(2, 6, 23, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        style={{
          position: 'relative',
          width: 'min(100%, 520px)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          background: 'var(--color-surface-card)',
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.24)',
          padding: '28px 24px 24px',
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="关闭弹窗"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--color-border-default)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: '1.125rem',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(59, 130, 246, 0.12)',
            color: 'var(--color-brand-accent)',
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 18,
          }}
        >
          ✓
        </div>

        <h3
          id={titleId}
          style={{
            fontSize: '1.75rem',
            lineHeight: 1.2,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          申请已提交
        </h3>

        <div id={descriptionId} style={{ marginTop: 14 }}>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: 1.75,
            }}
          >
            我们已收到你的内测申请，会优先审核与你当前团队场景匹配的申请。
          </p>

          <div
            style={{
              marginTop: 18,
              padding: '16px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              background: 'var(--color-surface-elevated)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-tertiary)',
                marginBottom: 8,
              }}
            >
              申请编号
            </div>
            <div
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-console)',
                fontSize: '1rem',
                letterSpacing: '0.06em',
                wordBreak: 'break-all',
              }}
            >
              {applicationPublicId}
            </div>
          </div>

          <div style={{ marginTop: 18, color: 'var(--color-text-secondary)', lineHeight: 1.75 }}>
            <p>我们通常会在 1-3 个工作日内通过你留下的联系方式沟通。</p>
            <p style={{ marginTop: 6 }}>如果你希望更快获得反馈，可以保留申请编号。</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 24,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              minWidth: 140,
              background: 'var(--color-brand-primary)',
              color: 'var(--color-text-on-dark)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            继续浏览
          </button>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              minWidth: 140,
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {hasCopied ? '已复制申请编号' : '复制申请编号'}
          </button>
        </div>
      </div>
    </div>
  );
}
