import React, { useCallback } from 'react';

import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  query: string;
  /** Plural label of the active category, if any (e.g. "Games"). */
  categoryLabel?: string;
  /** Search terms that are known to return results. */
  suggestions: readonly string[];
  onSuggestion: (term: string) => void;
  onClear: () => void;
}

interface SuggestionProps {
  term: string;
  onPick: (term: string) => void;
}

const Suggestion: React.FC<SuggestionProps> = ({ term, onPick }) => {
  const handleClick = useCallback(() => onPick(term), [onPick, term]);
  return (
    <li>
      <button type="button" className={styles.suggestion} onClick={handleClick}>
        {term}
      </button>
    </li>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  query,
  categoryLabel,
  suggestions,
  onSuggestion,
  onClear,
}) => {
  const term = query.trim();
  return (
    <div className={styles.empty}>
      <p className={styles.title}>
        {term ? `Nothing matches “${term}”` : 'Nothing here yet'}
        {categoryLabel ? ` in ${categoryLabel}` : ''}
      </p>
      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <p className={styles.hint} id="empty-suggestions">
            Try one of these, or browse everything:
          </p>
          <ul className={styles.list} aria-labelledby="empty-suggestions">
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                term={suggestion}
                onPick={onSuggestion}
              />
            ))}
          </ul>
        </div>
      )}
      <button type="button" className={styles.clear} onClick={onClear}>
        Clear search &amp; filters
      </button>
    </div>
  );
};
