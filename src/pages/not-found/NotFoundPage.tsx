import React from 'react';

import { apps } from '../../catalog';
import { Container } from '../../components/layout/Container';
import styles from './NotFoundPage.module.css';

/** Content for 404.html. Rendered inside <Layout>, which provides <main>. */
export const NotFoundPage: React.FC = () => (
  <Container className={styles.page}>
    <h1 className={styles.title}>Page not found</h1>
    <p className={styles.copy}>
      The page you were looking for doesn&apos;t exist or has moved. Search the
      catalog or pick an app below.
    </p>
    <form className={styles.form} action="/" method="get" role="search">
      <label className={styles.label} htmlFor="nf-q">
        Search the catalog
      </label>
      <div className={styles.row}>
        <input
          id="nf-q"
          className={styles.input}
          type="search"
          name="q"
          autoComplete="off"
          placeholder="e.g. ruler, counter"
        />
        <button className={styles.button} type="submit">
          Search
        </button>
      </div>
    </form>
    <h2 className={styles.sub}>All apps</h2>
    <ul className={styles.apps}>
      {apps.map((app) => (
        <li key={app.slug}>
          <a className={styles.appLink} href={`/apps/${app.slug}/`}>
            {app.name}
          </a>
        </li>
      ))}
    </ul>
    <p>
      <a className={styles.appLink} href="/">
        Back to the catalog
      </a>
    </p>
  </Container>
);

export default NotFoundPage;
