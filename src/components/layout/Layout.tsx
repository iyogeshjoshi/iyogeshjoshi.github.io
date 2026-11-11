import React from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { Footer } from './Footer';
import { Header } from './Header';
import { SkipLink } from './SkipLink';

export interface LayoutProps {
  children?: React.ReactNode;
  currentPath?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPath }) => (
  <>
    <SkipLink />
    <Header currentPath={currentPath} />
    <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </main>
    <Footer />
  </>
);

export default Layout;
