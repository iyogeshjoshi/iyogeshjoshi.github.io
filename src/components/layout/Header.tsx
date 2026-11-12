import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ThemeToggle } from '../../theme/ThemeToggle';
import styles from './Header.module.css';

export interface HeaderProps {
  /** Current pathname, used to set aria-current="page". */
  currentPath?: string;
}

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', label: 'Catalog' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
];

const MENU_ID = 'primary-menu';

export const Header: React.FC<HeaderProps> = ({ currentPath }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a className={styles.brand} href="/">
          <span className={styles.mark} aria-hidden="true">
            d/
          </span>
          <span className={styles.wordmark}>
            deviloper<span className={styles.tld}>.dev</span>
          </span>
          <span className={styles.srOnly}> — home</span>
        </a>
        <div className={styles.actions}>
          <nav ref={navRef} className={styles.nav} aria-label="Primary">
            <button
              ref={buttonRef}
              type="button"
              className={styles.menuButton}
              aria-expanded={open}
              aria-controls={MENU_ID}
              onClick={toggle}
            >
              <svg
                className={styles.menuIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                focusable="false"
              >
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
              <span>Menu</span>
            </button>
            <ul id={MENU_ID} className={styles.list} data-open={open}>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    className={styles.link}
                    href={item.href}
                    aria-current={
                      currentPath === item.href ? 'page' : undefined
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.theme}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
