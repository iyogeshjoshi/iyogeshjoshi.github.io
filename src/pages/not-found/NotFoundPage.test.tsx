import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { apps } from '../../catalog';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('has a no-JS GET search form to /', () => {
    const { container } = render(<NotFoundPage />);
    expect(
      screen.getByRole('heading', { name: 'Page not found' })
    ).toBeInTheDocument();
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('action', '/');
    expect(form).toHaveAttribute('method', 'get');
    expect(screen.getByLabelText('Search the catalog')).toHaveAttribute(
      'name',
      'q'
    );
  });

  it('lists every public app and links home', () => {
    render(<NotFoundPage />);
    for (const app of apps) {
      expect(screen.getByRole('link', { name: app.name })).toHaveAttribute(
        'href',
        `/apps/${app.slug}/`
      );
    }
    expect(
      screen.getByRole('link', { name: /back to the catalog/i })
    ).toHaveAttribute('href', '/');
  });
});
