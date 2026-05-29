'use client';

import { ChevronDown, Check } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

interface FormSelectProps {
  name: string;
  label: string;
  placeholder: string;
  options: string[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function FormSelect({
  name,
  label,
  placeholder,
  options,
  onFocus,
  onBlur,
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selectedIndex = options.indexOf(value);
  const displayValue = value || placeholder;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onBlur]);

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
    onFocus?.();
  };

  const closeList = () => {
    setIsOpen(false);
    onBlur?.();
  };

  const chooseOption = (option: string) => {
    setValue(option);
    setIsOpen(false);
    onBlur?.();
    buttonRef.current?.focus();
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      if (!isOpen) {
        openList();
        return;
      }

      setActiveIndex((current) => {
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        return (current + direction + options.length) % options.length;
      });
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (!isOpen) {
        openList();
        return;
      }

      chooseOption(options[activeIndex]);
      return;
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeList();
    }
  };

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <input
        name={name}
        value={value}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => {
          if (isOpen) {
            closeList();
          } else {
            openList();
          }
        }}
        onKeyDown={handleButtonKeyDown}
        style={{
          width: '100%',
          minHeight: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '14px 16px',
          border: `1px solid ${isOpen ? 'var(--color-border-brand)' : 'var(--color-border-default)'}`,
          borderRadius: 'var(--radius-md)',
          background: isOpen ? 'var(--color-surface-card)' : 'var(--color-surface-elevated)',
          boxShadow: isOpen ? 'var(--shadow-glow), var(--shadow-md)' : 'inset 0 1px 0 rgba(255,255,255,0.72)',
          color: value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: '1rem',
          lineHeight: 1.35,
          textAlign: 'left',
          transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
        }}
      >
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayValue}
        </span>
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            background: isOpen ? 'rgba(59, 130, 246, 0.10)' : 'rgba(15, 23, 42, 0.04)',
            color: isOpen ? 'var(--color-brand-accent)' : 'var(--color-text-tertiary)',
            transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
          }}
        >
          <ChevronDown
            size={18}
            strokeWidth={1.8}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform var(--duration-normal) var(--ease-out)',
            }}
          />
        </span>
      </button>

      <div
        id={listboxId}
        role="listbox"
        aria-label={label}
        style={{
          position: 'absolute',
          zIndex: 30,
          top: 'calc(100% + 10px)',
          left: 0,
          right: 0,
          padding: 8,
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255, 255, 255, 0.96)',
          boxShadow: '0 24px 64px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.85)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)',
          transformOrigin: 'top center',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)',
        }}
      >
        {options.map((option, index) => {
          const isSelected = value === option;
          const isActive = activeIndex === index;

          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={isSelected}
              tabIndex={isOpen ? 0 : -1}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseOption(option)}
              style={{
                width: '100%',
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 12px',
                border: 'none',
                borderLeft: isSelected ? '3px solid var(--color-brand-accent)' : '3px solid transparent',
                borderRadius: 'var(--radius-md)',
                background: isActive || isSelected ? 'var(--color-surface-tinted)' : 'transparent',
                color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                fontWeight: isSelected ? 600 : 400,
                lineHeight: 1.35,
                textAlign: 'left',
                transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
              }}
            >
              <span style={{ minWidth: 0 }}>{option}</span>
              {isSelected ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: 22,
                    height: 22,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: 'var(--color-brand-accent)',
                    flexShrink: 0,
                  }}
                >
                  <Check size={14} strokeWidth={2.2} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
