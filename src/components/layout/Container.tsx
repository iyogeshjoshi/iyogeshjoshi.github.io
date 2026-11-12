import React from 'react';

import styles from './Container.module.css';

export interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  /** Element to render. Defaults to `div`. */
  as?: 'div' | 'section' | 'article' | 'header' | 'footer';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  as: Tag = 'div',
}) => (
  <Tag
    className={
      className ? `${styles.container} ${className}` : styles.container
    }
  >
    {children}
  </Tag>
);

export default Container;
