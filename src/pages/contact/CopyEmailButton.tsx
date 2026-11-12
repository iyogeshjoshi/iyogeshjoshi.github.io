import React, { useCallback, useEffect, useRef, useState } from 'react';

import styles from './ContactPage.module.css';

export interface CopyEmailButtonProps {
  email: string;
}

type CopyState = 'idle' | 'copied' | 'failed';

const RESET_AFTER_MS = 4000;

/**
 * Progressive enhancement: rendered hidden and disabled on the server and on
 * the first client render, then enabled after mount if the Clipboard API is
 * available. The mailto link next to it works without JavaScript.
 */
export const CopyEmailButton: React.FC<CopyEmailButtonProps> = ({ email }) => {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setReady(
      typeof navigator !== 'undefined' &&
        typeof navigator.clipboard?.writeText === 'function'
    );
    return () => clearTimeout(timer.current);
  }, []);

  const onCopy = useCallback(async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
    } catch {
      setState('failed');
    }
    timer.current = setTimeout(() => setState('idle'), RESET_AFTER_MS);
  }, [email]);

  const message =
    state === 'copied'
      ? 'Email address copied to clipboard.'
      : state === 'failed'
        ? 'Couldn’t copy. Please select the address and copy it manually.'
        : '';

  return (
    <>
      <button
        type="button"
        className={styles.copy}
        onClick={onCopy}
        hidden={!ready}
        disabled={!ready}
      >
        {state === 'copied' ? 'Copied' : 'Copy address'}
      </button>
      <p className={styles.status} role="status" aria-live="polite">
        {message}
      </p>
    </>
  );
};

export default CopyEmailButton;
