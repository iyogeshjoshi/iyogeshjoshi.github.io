import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ErrorBoundary } from './ErrorBoundary';
import { Layout } from './Layout';

const Boom: React.FC = () => {
  throw new Error('boom');
};

describe('Layout', () => {
  it('renders landmarks and a skip link targeting #main', () => {
    render(
      <Layout>
        <p>content</p>
      </Layout>
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main');
    expect(main).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Skip to content' })
    ).toHaveAttribute('href', '#main');
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});

describe('ErrorBoundary', () => {
  it('renders a fallback with a home link when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /back to the catalog/i })
    ).toHaveAttribute('href', '/');
    spy.mockRestore();
  });
});
