import React, { useCallback } from 'react';

import { CATEGORY_LABELS } from '@/catalog';
import type { Category } from '@/catalog';
import styles from './CategoryChips.module.css';

export interface CategoryChipsProps {
  categories: readonly Category[];
  /** `null` = All. */
  selected: Category | null;
  /** Matches per chip for the current search. */
  counts: Record<Category | 'all', number>;
  onSelect: (category: Category | null) => void;
  label?: string;
}

interface ChipProps {
  value: Category | null;
  label: string;
  count: number;
  pressed: boolean;
  onSelect: (category: Category | null) => void;
}

const Chip: React.FC<ChipProps> = ({
  value,
  label,
  count,
  pressed,
  onSelect,
}) => {
  const handleClick = useCallback(() => onSelect(value), [onSelect, value]);
  return (
    <button
      type="button"
      className={styles.chip}
      aria-pressed={pressed}
      onClick={handleClick}
      data-empty={count === 0 || undefined}
    >
      {label}
      <span className={styles.count} aria-hidden="true">
        {count}
      </span>
      <span className="visually-hidden">
        , {count} {count === 1 ? 'app' : 'apps'}
      </span>
    </button>
  );
};

/** "All" plus one toggle button per category in use. */
export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selected,
  counts,
  onSelect,
  label = 'Filter by category',
}) => (
  <div className={styles.scroller}>
    <div role="group" aria-label={label} className={styles.group}>
      <Chip
        value={null}
        label="All"
        count={counts.all}
        pressed={selected === null}
        onSelect={onSelect}
      />
      {categories.map((category) => (
        <Chip
          key={category}
          value={category}
          label={CATEGORY_LABELS[category]}
          count={counts[category] ?? 0}
          pressed={selected === category}
          onSelect={onSelect}
        />
      ))}
    </div>
  </div>
);
