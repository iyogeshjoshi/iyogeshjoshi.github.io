import React, { useCallback } from 'react';

import { apps, site } from '../../catalog';
import styles from './Footer.module.css';

const openCookieSettings = (): void => {
  const fc = window.googlefc;
  if (!fc || !fc.callbackQueue || !fc.showRevocationMessage) return;
  fc.callbackQueue.push(fc.showRevocationMessage);
};

export const Footer: React.FC = () => {
  const onCookieSettings = useCallback(() => openCookieSettings(), []);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <p className={styles.brand}>
            deviloper<span className={styles.tld}>.dev</span>
          </p>
          <p className={styles.blurb}>
            A collection of side projects — free web tools, small games and
            simulations by Yogesh Joshi. Supported by ads.
          </p>
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>
        <nav className={styles.col} aria-label="Catalog">
          <p className={styles.heading}>Catalog</p>
          <ul className={styles.list}>
            {apps.map((app) => (
              <li key={app.slug}>
                <a className={styles.link} href={`/apps/${app.slug}/`}>
                  {app.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav className={styles.col} aria-label="Site">
          <p className={styles.heading}>Site</p>
          <ul className={styles.list}>
            <li>
              <a className={styles.link} href="/about/">
                About
              </a>
            </li>
            <li>
              <a className={styles.link} href="/contact/">
                Contact
              </a>
            </li>
            <li>
              <a className={styles.link} href="/sitemap.html">
                Sitemap
              </a>
            </li>
          </ul>
        </nav>
        <nav className={styles.col} aria-label="Legal">
          <p className={styles.heading}>Legal</p>
          <ul className={styles.list}>
            <li>
              <a className={styles.link} href="/privacy-policy.html">
                Privacy policy
              </a>
            </li>
            <li>
              <a className={styles.link} href="/terms.html">
                Terms of use
              </a>
            </li>
            <li>
              <button
                type="button"
                className={styles.link}
                onClick={onCookieSettings}
              >
                Cookie settings
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className={styles.bottom}>
        <span>© {year} deviloper.dev</span>
      </div>
    </footer>
  );
};

export default Footer;
