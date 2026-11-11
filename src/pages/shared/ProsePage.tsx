import React from 'react';

import { Container } from '../../components/layout/Container';
import { formatIsoDate } from './legal';
import styles from './ProsePage.module.css';

export interface ProsePageProps {
  /** Small label above the title, e.g. "Legal". */
  eyebrow?: string;
  title: string;
  /** Intro paragraph under the title. */
  lead?: React.ReactNode;
  /** ISO date (`YYYY-MM-DD`) shown as "Effective date / Last updated". */
  updated?: string;
  /** Optional in-page table of contents. */
  toc?: ReadonlyArray<{ id: string; label: string }>;
  children?: React.ReactNode;
}

/**
 * Shared layout for long-form site pages (privacy, terms, about, contact,
 * sitemap). Rendered inside <Layout>, which already provides <main>.
 */
export const ProsePage: React.FC<ProsePageProps> = ({
  eyebrow,
  title,
  lead,
  updated,
  toc,
  children,
}) => (
  <Container as="article" className={styles.page}>
    <div className={styles.measure}>
      <header className={styles.header}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
        {updated ? (
          <p className={styles.updated}>
            Effective date / Last updated:{' '}
            <time dateTime={updated}>{formatIsoDate(updated)}</time>
          </p>
        ) : null}
      </header>
      {toc && toc.length > 0 ? (
        <nav className={styles.toc} aria-label="On this page">
          <p className={styles.tocHeading}>On this page</p>
          <ol className={styles.tocList}>
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className={styles.prose}>{children}</div>
    </div>
  </Container>
);

export interface ProseSectionProps {
  id: string;
  title: string;
  children?: React.ReactNode;
}

/** A titled section whose h2 doubles as an anchor target. */
export const ProseSection: React.FC<ProseSectionProps> = ({
  id,
  title,
  children,
}) => (
  <section className={styles.section} aria-labelledby={id}>
    <h2 id={id}>{title}</h2>
    {children}
  </section>
);

export interface SummaryBoxProps {
  title: string;
  children?: React.ReactNode;
}

/** Highlighted summary box, e.g. "The short version". */
export const SummaryBox: React.FC<SummaryBoxProps> = ({ title, children }) => (
  <aside className={styles.summary} aria-label={title}>
    <p className={styles.summaryTitle}>{title}</p>
    {children}
  </aside>
);

export default ProsePage;
