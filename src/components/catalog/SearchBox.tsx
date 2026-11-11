import React, { forwardRef, useCallback, useEffect, useRef } from 'react';

import styles from './SearchBox.module.css';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
}

export const SEARCH_PLACEHOLDER = 'Search tools, games and simulations…';

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/**
 * Catalog search field. Instant (`onChange` fires per keystroke); `/` and
 * ⌘K / Ctrl+K focus it from anywhere on the page, `Esc` clears then blurs.
 */
export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  function SearchBox(
    {
      value,
      onChange,
      id = 'catalog-search',
      label = 'Search the catalog',
      placeholder = SEARCH_PLACEHOLDER,
    },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef]
    );

    // Global shortcuts.
    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent): void => {
        const input = innerRef.current;
        if (!input || event.defaultPrevented || event.isComposing) return;

        const isSlash =
          event.key === '/' &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey;
        const isCmdK =
          event.key.toLowerCase() === 'k' &&
          (event.metaKey || event.ctrlKey) &&
          !event.altKey &&
          !event.shiftKey;
        if (!isSlash && !isCmdK) return;

        if (event.target === input) {
          // Typing "/" into the box stays a character; ⌘K just selects.
          if (isCmdK) {
            event.preventDefault();
            input.select();
          }
          return;
        }
        if (isEditable(event.target)) return;

        event.preventDefault();
        input.focus();
        input.select();
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value),
      [onChange]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        if (event.currentTarget.value) onChange('');
        else event.currentTarget.blur();
      },
      [onChange]
    );

    return (
      <div className={styles.field}>
        <label htmlFor={id} className="visually-hidden">
          {label}
        </label>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          ref={setRefs}
          id={id}
          className={styles.input}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="search"
          aria-keyshortcuts="/ Control+K Meta+K"
        />
        <kbd className={styles.kbd} aria-hidden="true">
          /
        </kbd>
      </div>
    );
  }
);
