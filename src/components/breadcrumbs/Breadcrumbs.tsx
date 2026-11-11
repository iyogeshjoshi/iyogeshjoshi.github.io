import React from 'react';

import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current page (the last item). */
  href?: string;
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => (
  <nav className={styles.nav} aria-label="Breadcrumb">
    <ol className={styles.list}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={`${index}-${item.label}`} className={styles.item}>
            {isLast || !item.href ? (
              <span
                className={styles.current}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <a className={styles.link} href={item.href}>
                {item.label}
              </a>
            )}
            {!isLast && (
              <span className={styles.sep} aria-hidden="true">
                /
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
