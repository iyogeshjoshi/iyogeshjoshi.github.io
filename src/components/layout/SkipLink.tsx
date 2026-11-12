import React from 'react';

import styles from './SkipLink.module.css';

export const SkipLink: React.FC = () => (
  <a className={styles.skip} href="#main">
    Skip to content
  </a>
);

export default SkipLink;
